const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ PostgreSQL connected successfully');
    release();
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false
});

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// ============ AUTH MIDDLEWARE ============
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const result = await pool.query(
        'SELECT id, name, email, role FROM users WHERE id = $1',
        [decoded.userId]
      );
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      req.user = result.rows[0];
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as admin' });
  }
};

// ============ REGISTRATION API ============
app.post(
  '/api/auth/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  handleValidation,
  async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('📝 Registration attempt:', { name, email });

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'user']
    );

    console.log('✅ User registered:', result.rows[0]);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
  }
);

// ============ LOGIN API (issues real JWT) ============
app.post(
  '/api/auth/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  handleValidation,
  async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt:', email);

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('✅ Login successful:', user.email);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
  }
);

// ============ GET CARS API (public) ============
app.get('/api/cars', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.car_id, c.name, c.brand, c.type, c.price_per_day, c.seats, c.year, c.fuel_type, c.transmission, c.image_url, c.description, c.is_available,
        EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.car_id = c.id AND b.status IN ('approved', 'pending')
          AND CURRENT_DATE >= b.start_date
          AND CURRENT_DATE <= GREATEST(b.start_date, b.end_date - 1)
        ) as is_currently_booked
       FROM cars c ORDER BY c.id`
    );
    res.json({ success: true, cars: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ GET SINGLE CAR API (public) ============
app.get('/api/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let result;
    if (!isNaN(parseInt(id))) {
      result = await pool.query('SELECT * FROM cars WHERE id = $1', [parseInt(id)]);
    }

    if (!result || result.rows.length === 0) {
      result = await pool.query('SELECT * FROM cars WHERE car_id = $1', [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    res.json({ success: true, car: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ CAR AVAILABILITY CHECK (public) ============
app.get('/api/cars/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let carDbId = null;
    if (!isNaN(parseInt(id))) {
      const carResult = await pool.query('SELECT id FROM cars WHERE id = $1', [parseInt(id)]);
      if (carResult.rows.length > 0) carDbId = carResult.rows[0].id;
    }
    if (!carDbId) {
      const carResult = await pool.query('SELECT id FROM cars WHERE car_id = $1', [id]);
      if (carResult.rows.length > 0) carDbId = carResult.rows[0].id;
    }
    if (!carDbId) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    const result = await pool.query(
      `SELECT * FROM bookings
       WHERE car_id = $1 AND status = 'approved'
       AND daterange(start_date, end_date, '[]') && daterange($2, $3, '[]')`,
      [carDbId, startDate, endDate]
    );

    res.json({ success: true, available: result.rows.length === 0 });
  } catch (error) {
    console.error('❌ Error checking availability:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ CREATE BOOKING API (protected) ============
app.post('/api/bookings', protect, async (req, res) => {
  try {
    const { carId, startDate, endDate, days, totalPrice, paidAmount, paymentMethod, paymentStatus, status } = req.body;
    const userId = req.user.id; // ✅ Use authenticated user

    console.log('📝 Booking request:', { userId, carId, startDate, endDate });

    let carDbId = null;
    if (!isNaN(parseInt(carId))) {
      const carResult = await pool.query('SELECT id FROM cars WHERE id = $1', [parseInt(carId)]);
      if (carResult.rows.length > 0) carDbId = carResult.rows[0].id;
    }
    if (!carDbId) {
      const carResult = await pool.query('SELECT id FROM cars WHERE car_id = $1', [carId]);
      if (carResult.rows.length > 0) carDbId = carResult.rows[0].id;
    }
    if (!carDbId) {
      return res.status(400).json({ success: false, message: 'Car not found' });
    }

    const finalPaidAmount = paymentStatus === 'confirmed' ? totalPrice : 0;

    const result = await pool.query(
      `INSERT INTO bookings (user_id, car_id, start_date, end_date, days, total_price, paid_amount, payment_method, payment_status, status, booking_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id, booking_id, start_date, end_date, days, total_price, paid_amount, payment_method, payment_status, status, booking_date`,
      [userId, carDbId, startDate, endDate, days, totalPrice, finalPaidAmount, paymentMethod, paymentStatus, status || 'pending']
    );

    console.log('✅ Booking created:', result.rows[0]);
    res.status(201).json({
      success: true,
      booking: result.rows[0],
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('❌ Booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ GET USER BOOKINGS API (protected) ============
app.get('/api/bookings/my-bookings', protect, async (req, res) => {
  try {
    const userId = req.user.id; // ✅ Use authenticated user

    const result = await pool.query(
      `SELECT b.id, b.booking_id, b.start_date, b.end_date, b.days, b.total_price,
              b.paid_amount, b.payment_method, b.payment_status, b.status, b.booking_date,
              c.name as car_name, c.image_url
       FROM bookings b
       JOIN cars c ON b.car_id = c.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );

    const bookings = result.rows.map(booking => ({
      ...booking,
      id: booking.id.toString()
    }));

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ CANCEL BOOKING API (protected) ============
app.put('/api/bookings/:id/cancel', protect, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Cancelling booking ID:', id);

    let bookingDbId = null;
    if (!isNaN(parseInt(id))) {
      const result = await pool.query('SELECT id FROM bookings WHERE id = $1', [parseInt(id)]);
      if (result.rows.length > 0) bookingDbId = result.rows[0].id;
    } else {
      const result = await pool.query('SELECT id FROM bookings WHERE booking_id = $1', [id]);
      if (result.rows.length > 0) bookingDbId = result.rows[0].id;
    }

    if (!bookingDbId) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 AND status IN ($3, $4) RETURNING *',
      ['cancelled', bookingDbId, 'pending', 'pending_payment']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found or cannot be cancelled' });
    }

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('❌ Error cancelling booking:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ GET ALL BOOKINGS FOR ADMIN (protected + admin) ============
app.get('/api/admin/bookings', protect, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.booking_id, b.start_date, b.end_date, b.days, b.total_price,
              b.paid_amount, b.payment_method, b.payment_status, b.status, b.booking_date,
              c.name as car_name, c.image_url,
              u.name as user_name, u.email as user_email
       FROM bookings b
       JOIN cars c ON b.car_id = c.id
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC`
    );
    res.json({ success: true, bookings: result.rows });
  } catch (error) {
    console.error('❌ Error fetching all bookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ APPROVE BOOKING (protected + admin) ============
app.put('/api/admin/bookings/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Approving booking ID:', id);

    let bookingDbId = null;
    if (!isNaN(parseInt(id))) {
      const result = await pool.query('SELECT id FROM bookings WHERE id = $1', [parseInt(id)]);
      if (result.rows.length > 0) bookingDbId = result.rows[0].id;
    } else {
      const result = await pool.query('SELECT id FROM bookings WHERE booking_id = $1', [id]);
      if (result.rows.length > 0) bookingDbId = result.rows[0].id;
    }

    if (!bookingDbId) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const result = await pool.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['approved', bookingDbId]
    );

    console.log('✅ Booking approved:', result.rows[0]);
    res.json({ success: true, message: 'Booking approved successfully', booking: result.rows[0] });
  } catch (error) {
    console.error('❌ Error approving booking:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ DECLINE BOOKING (protected + admin) ============
app.put('/api/admin/bookings/:id/decline', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Declining booking ID:', id);

    let bookingDbId = null;
    if (!isNaN(parseInt(id))) {
      const result = await pool.query('SELECT id FROM bookings WHERE id = $1', [parseInt(id)]);
      if (result.rows.length > 0) bookingDbId = result.rows[0].id;
    } else {
      const result = await pool.query('SELECT id FROM bookings WHERE booking_id = $1', [id]);
      if (result.rows.length > 0) bookingDbId = result.rows[0].id;
    }

    if (!bookingDbId) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const result = await pool.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['declined', bookingDbId]
    );

    console.log('✅ Booking declined:', result.rows[0]);
    res.json({ success: true, message: 'Booking declined successfully', booking: result.rows[0] });
  } catch (error) {
    console.error('❌ Error declining booking:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ GET ALL USERS (protected + admin) ============
app.get('/api/admin/users', protect, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ DELETE USER (protected + admin) ============
app.delete('/api/admin/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 AND role != $2 RETURNING *',
      [id, 'admin']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found or cannot delete admin' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ADMIN STATS (protected + admin) ============
app.get('/api/admin/stats', protect, adminOnly, async (req, res) => {
  try {
    const carsResult = await pool.query('SELECT COUNT(*) FROM cars');
    const usersResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = $1", ['user']);
    const bookingsResult = await pool.query('SELECT COUNT(*) FROM bookings');
    const revenueResult = await pool.query("SELECT SUM(total_price) FROM bookings WHERE status = $1", ['approved']);

    res.json({
      success: true,
      stats: {
        totalCars: parseInt(carsResult.rows[0].count),
        totalUsers: parseInt(usersResult.rows[0].count),
        totalBookings: parseInt(bookingsResult.rows[0].count),
        totalRevenue: parseInt(revenueResult.rows[0].sum) || 0
      }
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ADD CAR (protected + admin) ============
app.post('/api/admin/cars', protect, adminOnly, async (req, res) => {
  try {
    const { name, brand, type, price_per_day, seats, year, fuel_type, transmission, image_url, description } = req.body;

    const result = await pool.query(
      `INSERT INTO cars (name, brand, type, price_per_day, seats, year, fuel_type, transmission, image_url, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, brand, type, price_per_day, seats, year, fuel_type, transmission, image_url, description]
    );

    console.log('✅ Car added:', result.rows[0]);
    res.status(201).json({ success: true, car: result.rows[0], message: 'Car added successfully' });
  } catch (error) {
    console.error('❌ Error adding car:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ UPDATE CAR (protected + admin) ============
app.put('/api/admin/cars/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, type, price_per_day, seats, year, fuel_type, transmission, image_url, description } = req.body;

    const result = await pool.query(
      `UPDATE cars SET name=$1, brand=$2, type=$3, price_per_day=$4, seats=$5, year=$6, fuel_type=$7, transmission=$8, image_url=$9, description=$10
       WHERE id = $11 RETURNING *`,
      [name, brand, type, price_per_day, seats, year, fuel_type, transmission, image_url, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    res.json({ success: true, car: result.rows[0], message: 'Car updated successfully' });
  } catch (error) {
    console.error('❌ Error updating car:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ DELETE CAR (protected + admin) ============
app.delete('/api/admin/cars/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM cars WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    res.json({ success: true, message: 'Car deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting car:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ PAYMENT API (protected) ============
app.post('/api/payments', protect, async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod, transactionId } = req.body;
    const userId = req.user.id; // ✅ Use authenticated user

    console.log('💰 Payment request:', { bookingId, amount, paymentMethod, transactionId });

    let bookingDbId = null;
    if (bookingId) {
      if (!isNaN(parseInt(bookingId))) {
        const bookingResult = await pool.query('SELECT id FROM bookings WHERE id = $1', [parseInt(bookingId)]);
        if (bookingResult.rows.length > 0) bookingDbId = bookingResult.rows[0].id;
      }
      if (!bookingDbId) {
        const bookingResult = await pool.query('SELECT id FROM bookings WHERE booking_id = $1', [bookingId]);
        if (bookingResult.rows.length > 0) bookingDbId = bookingResult.rows[0].id;
      }
    }

    const result = await pool.query(
      `INSERT INTO payments (booking_id, user_id, amount, payment_method, transaction_id, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'completed', NOW())
       RETURNING *`,
      [bookingDbId, userId, amount, paymentMethod, transactionId]
    );

    console.log('✅ Payment saved:', result.rows[0]);
    res.status(201).json({ success: true, payment: result.rows[0] });
  } catch (error) {
    console.error('❌ Payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`\nServer running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log(`Test Cars API: http://localhost:${PORT}/api/cars\n`);
});
