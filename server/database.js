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
    hostel_fees DECIMAL(10,2),
    annual_fees DECIMAL(12,2),
    security_deposit DECIMAL(10,2),
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
    roommate_type ENUM('quiet', 'jolly', 'morning-person', 'night-person', 'social', 'studious', 'other') DEFAULT 'quiet',
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
    await ensureColumn('hostels', 'hostel_fees', 'DECIMAL(10,2)');
    await ensureColumn('hostels', 'annual_fees', 'DECIMAL(12,2)');
    await ensureColumn('hostels', 'security_deposit', 'DECIMAL(10,2)');
    await ensureColumn(
      'residents',
      'roommate_type',
      "ENUM('quiet','jolly','morning-person','night-person','social','studious','other') DEFAULT 'quiet'"
    );
    await seedHostels();

    // Create triggers to prevent negative costs and fees
    await promisePool.query(`
      DROP TRIGGER IF EXISTS check_mess_plan_cost_insert
    `);

    await promisePool.query(`
      CREATE TRIGGER check_mess_plan_cost_insert
      BEFORE INSERT ON mess_plans
      FOR EACH ROW
      BEGIN
        IF NEW.cost < 0 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Mess Plan Cost cannot be negative';
        END IF;
      END
    `);

    await promisePool.query(`
      DROP TRIGGER IF EXISTS check_mess_plan_cost_update
    `);

    await promisePool.query(`
      CREATE TRIGGER check_mess_plan_cost_update
      BEFORE UPDATE ON mess_plans
      FOR EACH ROW
      BEGIN
        IF NEW.cost < 0 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Mess Plan Cost cannot be negative';
        END IF;
      END
    `);

    await promisePool.query(`
      DROP TRIGGER IF EXISTS check_hostel_fees_insert
    `);

    await promisePool.query(`
      CREATE TRIGGER check_hostel_fees_insert
      BEFORE INSERT ON hostels
      FOR EACH ROW
      BEGIN
        IF NEW.hostel_fees < 0 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Hostel fees cannot be negative';
        END IF;
      END
    `);

    await promisePool.query(`
      DROP TRIGGER IF EXISTS check_hostel_fees_update
    `);

    await promisePool.query(`
      CREATE TRIGGER check_hostel_fees_update
      BEFORE UPDATE ON hostels
      FOR EACH ROW
      BEGIN
        IF NEW.hostel_fees < 0 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Hostel fees cannot be negative';
        END IF;
      END
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function seedHostels() {
  const hostels = [
    { hostel_id: 1, name: 'Atria Hostel', location: 'Mumbai', hostel_fees: 60000, annual_fees: null, security_deposit: null },
    { hostel_id: 2, name: 'Sunrise Hostel', location: 'Delhi', hostel_fees: 55000, annual_fees: null, security_deposit: null },
    { hostel_id: 3, name: 'Greenfield Hostel', location: 'Bangalore', hostel_fees: 70000, annual_fees: null, security_deposit: null },
    { hostel_id: 4, name: 'Lakeview Hostel', location: 'Chennai', hostel_fees: 65000, annual_fees: null, security_deposit: null },
    { hostel_id: 5, name: 'City Comfort Hostel', location: 'Pune', hostel_fees: 60000, annual_fees: null, security_deposit: null },
    { hostel_id: 6, name: 'Elite Stay Hostel', location: 'Hyderabad', hostel_fees: 80000, annual_fees: null, security_deposit: null },
    { hostel_id: 7, name: 'Harmony Hostel', location: 'Kolkata', hostel_fees: 50000, annual_fees: null, security_deposit: null },
    { hostel_id: 8, name: 'BlueSky Hostel', location: 'Ahmedabad', hostel_fees: 58000, annual_fees: null, security_deposit: null },
    { hostel_id: 9, name: 'Royal Nest Hostel', location: 'Jaipur', hostel_fees: 72000, annual_fees: null, security_deposit: null },
    { hostel_id: 10, name: 'Metro Inn Hostel', location: 'Lucknow', hostel_fees: 0, annual_fees: null, security_deposit: null },
    { hostel_id: 11, name: 'Sunshine Hostel', location: 'Goa', hostel_fees: 45000, annual_fees: 540000, security_deposit: 4500 }
  ];

  for (const hostel of hostels) {
    await promisePool.query(
      `INSERT INTO hostels (hostel_id, hostel_name, location, hostel_fees, annual_fees, security_deposit)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE hostel_name = VALUES(hostel_name)`,
      [hostel.hostel_id, hostel.name, hostel.location, hostel.hostel_fees, hostel.annual_fees, hostel.security_deposit]
    );
  }
}

async function ensureColumn(table, column, definition) {
  try {
    await promisePool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME') {
      throw error;
    }
  }
}

module.exports = { promisePool, initializeDatabase };

