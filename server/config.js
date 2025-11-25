// Database configuration
// You can also use environment variables by creating a .env file
module.exports = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Meetshah@1801',
    database: process.env.DB_NAME || 'hostel_management'
  }
};

