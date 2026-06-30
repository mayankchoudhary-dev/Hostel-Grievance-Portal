// config/db.js - MySQL connection pool
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hostel_grievance',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection on startup (warn only — server stays running)
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('⚠️  MySQL connection failed:', err.message);
    console.error('   → Make sure MySQL is running and DB_PASSWORD is set correctly in backend/.env');
    console.error('   → Then restart the server with: node server.js');
  });

module.exports = pool;
