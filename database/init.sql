CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  car_id VARCHAR(30) UNIQUE,
  name VARCHAR(120) NOT NULL,
  brand VARCHAR(80) NOT NULL,
  type VARCHAR(60) NOT NULL,
  price_per_day NUMERIC(10, 2) NOT NULL,
  seats INTEGER NOT NULL,
  year INTEGER NOT NULL,
  fuel_type VARCHAR(40) NOT NULL,
  transmission VARCHAR(40) NOT NULL,
  image_url TEXT,
  description TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_id VARCHAR(30) UNIQUE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  booking_date TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_car_public_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.car_id IS NULL OR NEW.car_id = '' THEN
    NEW.car_id := 'CAR' || LPAD(NEW.id::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_booking_public_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_id IS NULL OR NEW.booking_id = '' THEN
    NEW.booking_id := 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEW.id::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cars_public_id_trigger ON cars;
CREATE TRIGGER cars_public_id_trigger
BEFORE INSERT ON cars
FOR EACH ROW
EXECUTE FUNCTION set_car_public_id();

DROP TRIGGER IF EXISTS bookings_public_id_trigger ON bookings;
CREATE TRIGGER bookings_public_id_trigger
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION set_booking_public_id();

INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin User', 'admin@gmail.com', '$2b$10$SqSlwZx8q3ewVeQogcehjujrATk5VGR9ZPk.8UoR3hZeu3aQE3SI2', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO cars (car_id, name, brand, type, price_per_day, seats, year, fuel_type, transmission, image_url, description)
VALUES
  ('CAR001', 'Tesla Model 3', 'Tesla', 'Sedan', 7499, 5, 2023, 'Electric', 'Automatic', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500&h=300&fit=crop', 'High-performance electric sedan with autopilot capabilities.'),
  ('CAR002', 'BMW X5', 'BMW', 'SUV', 9999, 5, 2023, 'Petrol', 'Automatic', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop', 'Luxury midsize SUV offering powerful performance and a refined interior.'),
  ('CAR003', 'Mercedes C-Class', 'Mercedes-Benz', 'Sedan', 8749, 5, 2022, 'Petrol', 'Automatic', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=500&h=300&fit=crop', 'Sophisticated luxury sedan with advanced tech and comfort.'),
  ('CAR004', 'Audi A6', 'Audi', 'Sedan', 8249, 5, 2023, 'Petrol', 'Automatic', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500&h=300&fit=crop', 'Elegant and tech-forward luxury sedan for a premium driving experience.'),
  ('CAR005', 'Toyota Camry', 'Toyota', 'Sedan', 4499, 5, 2022, 'Hybrid', 'Automatic', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop', 'Reliable and comfortable midsize hybrid sedan for everyday travel.'),
  ('CAR006', 'Honda CR-V', 'Honda', 'SUV', 5499, 5, 2023, 'Petrol', 'Automatic', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&h=300&fit=crop', 'Spacious and practical compact SUV, perfect for families.')
ON CONFLICT (car_id) DO NOTHING;
