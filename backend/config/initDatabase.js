import { promisePool } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'hotel_booking';
    const tempPool = await import('mysql2/promise').then(m => 
      m.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306
      })
    );

    await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await tempPool.end();
    console.log('✅ Database created/verified');

    // Create tables
    await createTables();
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

const createTables = async () => {
  // Rooms table
  await promisePool.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_number VARCHAR(50) UNIQUE NOT NULL,
      room_type VARCHAR(100) NOT NULL,
      price_per_night DECIMAL(10, 2) NOT NULL,
      capacity INT NOT NULL,
      amenities TEXT,
      status ENUM('available', 'occupied', 'maintenance', 'reserved') DEFAULT 'available',
      description TEXT,
      image_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Guests table
  await promisePool.query(`
    CREATE TABLE IF NOT EXISTS guests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      address TEXT,
      nationality VARCHAR(100),
      id_type VARCHAR(50),
      id_number VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Bookings table
  await promisePool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guest_id INT NOT NULL,
      room_id INT NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      adults INT DEFAULT 1,
      children INT DEFAULT 0,
      total_price DECIMAL(10, 2) NOT NULL,
      status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled') DEFAULT 'pending',
      payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
      special_requests TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
      INDEX idx_guest_id (guest_id),
      INDEX idx_room_id (room_id),
      INDEX idx_check_in (check_in),
      INDEX idx_check_out (check_out),
      INDEX idx_status (status)
    )
  `);

  // Admins table
  await promisePool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(200),
      role ENUM('admin') DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Notifications table
  await promisePool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
      INDEX idx_admin_id (admin_id),
      INDEX idx_is_read (is_read),
      INDEX idx_created_at (created_at)
    )
  `);

  // Insert default admin (password: admin123)
  const [existingAdmin] = await promisePool.query(
    'SELECT id FROM admins WHERE username = ?',
    ['admin']
  );

  if (existingAdmin.length === 0) {
    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await promisePool.query(`
      INSERT INTO admins (username, email, password, full_name, role)
      VALUES (?, ?, ?, ?, ?)
    `, ['admin', 'admin@hotel.com', hashedPassword, 'Admin User', 'admin']);
    
    console.log('✅ Default admin created (username: admin, password: admin123)');
  }

  // Insert sample rooms if none exist
  const [rooms] = await promisePool.query('SELECT COUNT(*) as count FROM rooms');
  if (rooms[0].count === 0) {
    const sampleRooms = [
      ['101', 'Single', 50.00, 1, 'WiFi, TV, AC', 'available', 'Comfortable single room with city view'],
      ['102', 'Double', 80.00, 2, 'WiFi, TV, AC, Mini Bar', 'available', 'Spacious double room perfect for couples'],
      ['201', 'Twin', 85.00, 2, 'WiFi, TV, AC, Mini Bar', 'available', 'Two single beds with balcony'],
      ['202', 'Suite', 150.00, 4, 'WiFi, TV, AC, Mini Bar, Jacuzzi', 'available', 'Luxury suite with living area'],
      ['301', 'Family', 120.00, 4, 'WiFi, TV, AC, Mini Bar', 'available', 'Family room with extra space']
    ];

    for (const room of sampleRooms) {
      await promisePool.query(`
        INSERT INTO rooms (room_number, room_type, price_per_night, capacity, amenities, status, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, room);
    }
    console.log('✅ Sample rooms inserted');
  }

  // Activities table
  await promisePool.query(`
    CREATE TABLE IF NOT EXISTS activities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      short_description VARCHAR(500),
      price DECIMAL(10, 2) NOT NULL,
      duration_minutes INT NOT NULL,
      max_participants INT DEFAULT 10,
      min_participants INT DEFAULT 1,
      difficulty_level ENUM('easy', 'moderate', 'hard') DEFAULT 'easy',
      location VARCHAR(255),
      meeting_point VARCHAR(255),
      available_days JSON,
      start_time TIME,
      end_time TIME,
      image_url VARCHAR(500),
      is_active BOOLEAN DEFAULT TRUE,
      advance_booking_hours INT DEFAULT 24,
      what_to_bring TEXT,
      rating DECIMAL(3, 2) DEFAULT 0.00,
      total_reviews INT DEFAULT 0,
      total_bookings INT DEFAULT 0,
      confirmed_bookings INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Offers table
  await promisePool.query(`
    CREATE TABLE IF NOT EXISTS offers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      offer_code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(50) DEFAULT 'general',
      discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
      discount_value DECIMAL(10, 2) NOT NULL,
      min_guests INT DEFAULT 1,
      min_nights INT,
      max_uses INT,
      used_count INT DEFAULT 0,
      valid_from DATE,
      valid_to DATE,
      status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
      is_public BOOLEAN DEFAULT FALSE,
      conditions JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_offer_code (offer_code),
      INDEX idx_status (status),
      INDEX idx_valid_from (valid_from),
      INDEX idx_valid_to (valid_to)
    )
  `);
};

export default initDatabase;

