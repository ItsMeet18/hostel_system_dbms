const mysql = require('mysql2');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Meetshah@1801',
  database: process.env.DB_NAME || 'hostel_management'
};

// Create connection pool
const pool = mysql.createPool({
  ...DB_CONFIG,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

const createTables = [
  `CREATE TABLE IF NOT EXISTS hostels (
    hostel_id INT AUTO_INCREMENT PRIMARY KEY,
    hostel_name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    contact_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS mess_plans (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_type ENUM('veg', 'non-veg', 'custom') NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS residents (
    resident_id INT AUTO_INCREMENT PRIMARY KEY,
    hostel_id INT,
    mess_plan_id INT,
    name VARCHAR(100) NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    emergency_contact VARCHAR(20),
    email VARCHAR(150) UNIQUE,
    password VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id) ON DELETE SET NULL,
    FOREIGN KEY (mess_plan_id) REFERENCES mess_plans(plan_id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    hostel_id INT NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    room_type ENUM('single', 'double', 'triple', 'suite') DEFAULT 'double',
    capacity INT NOT NULL,
    occupied INT DEFAULT 0,
    status ENUM('available', 'full', 'maintenance') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_room (hostel_id, room_number),
    FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS allotments (
    allotment_id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE,
    lifestyle_preference ENUM('quiet', 'social', 'early-riser', 'night-owl') DEFAULT 'quiet',
    status ENUM('active', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS roommate_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    preference_type ENUM('quiet', 'social', 'night-owl', 'early-riser', 'studious', 'party-friendly') NOT NULL,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS maintenance_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    issue_description TEXT NOT NULL,
    complaint_status ENUM('pending', 'in-progress', 'resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS laundry_services (
    laundry_id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    service_date DATE NOT NULL,
    status ENUM('requested', 'in-progress', 'completed') DEFAULT 'requested',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    additional_charges DECIMAL(10,2) DEFAULT 0,
    due_date DATE NOT NULL,
    status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS visitor_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    visitor_name VARCHAR(100) NOT NULL,
    entry_time DATETIME NOT NULL,
    exit_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS access_cards (
    card_id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    issue_date DATE NOT NULL,
    status ENUM('active', 'inactive', 'lost') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS mess_plan_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES mess_plans(plan_id) ON DELETE CASCADE
  )`
];

// Initialize database and create tables
async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password
    });

    await connection.promise().query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
    await connection.promise().query(`USE \`${DB_CONFIG.database}\``);
    await connection.end();

    for (const statement of createTables) {
      await promisePool.query(statement);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = { promisePool, initializeDatabase };

