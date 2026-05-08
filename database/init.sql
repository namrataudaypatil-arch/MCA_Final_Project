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
VALUES ('Admin User', 'admin@rentwheels.com', '$2b$10$SqSlwZx8q3ewVeQogcehjujrATk5VGR9ZPk.8UoR3hZeu3aQE3SI2', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO cars (car_id, name, brand, type, price_per_day, seats, year, fuel_type, transmission, image_url, description)
VALUES
  ('CAR001', 'Toyota Innova Crysta', 'Toyota', 'SUV', 3500, 7, 2023, 'Diesel', 'Manual', 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=900&auto=format&fit=crop', 'Spacious family SUV for city and highway trips.'),
  ('CAR002', 'Hyundai Creta', 'Hyundai', 'SUV', 2800, 5, 2023, 'Petrol', 'Automatic', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&auto=format&fit=crop', 'Comfortable compact SUV with premium features.'),
  ('CAR003', 'Honda City', 'Honda', 'Sedan', 2400, 5, 2022, 'Petrol', 'Manual', 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=900&auto=format&fit=crop', 'Reliable sedan with strong mileage and comfort.'),
  ('CAR004', 'Mahindra Thar', 'Mahindra', 'SUV', 4200, 4, 2023, 'Diesel', 'Manual', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&auto=format&fit=crop', 'Adventure-ready SUV for memorable weekend drives.'),
  ('CAR005', 'Maruti Swift', 'Maruti Suzuki', 'Hatchback', 1600, 5, 2022, 'Petrol', 'Manual', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop', 'Budget-friendly hatchback for daily travel.')
ON CONFLICT (car_id) DO NOTHING;
