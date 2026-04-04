const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    
    // Connect to MySQL without database specified
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    // Create database if not exists
    await connection.query('CREATE DATABASE IF NOT EXISTS hostel_grievance');
    await connection.query('USE hostel_grievance');
    
    console.log('✅ Database created/connected');

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
        room_no VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create complaints table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        category ENUM('Electricity', 'Water', 'Mess', 'Cleanliness', 'Internet', 'Other') NOT NULL DEFAULT 'Other',
        status ENUM('Pending', 'In Progress', 'Resolved') NOT NULL DEFAULT 'Pending',
        priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Low',
        image_url VARCHAR(500) DEFAULT NULL,
        admin_remark TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await connection.query('CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at)');

    // Create admin user with proper password hash
    const adminPassword = await bcrypt.hash('admin123', 10);
    await connection.query(`
      INSERT INTO users (name, email, password, role, room_no)
      VALUES ('Admin', 'admin@hostel.com', ?, 'admin', NULL)
      ON DUPLICATE KEY UPDATE password = VALUES(password)
    `, [adminPassword]);

    console.log('✅ Tables created and admin user initialized');
    console.log('📧 Admin login: admin@hostel.com');
    console.log('🔑 Admin password: admin123');
    
    await connection.end();
    console.log('🎉 Setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
