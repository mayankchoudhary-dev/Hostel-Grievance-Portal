const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixTables() {
  try {
    console.log('🔧 Fixing database tables...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hostel_grievance'
    });
    
    // Drop and recreate tables in correct order (complaints first due to foreign key)
    await connection.query('DROP TABLE IF EXISTS complaints');
    console.log(' Dropped old complaints table');
    
    await connection.query('DROP TABLE IF EXISTS users');
    console.log(' Dropped old users table');
    
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
        room_no VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log(' Created users table with correct structure');
    
    // Drop and recreate complaints table with correct structure
    await connection.query('DROP TABLE IF EXISTS complaints');
    console.log(' Dropped old complaints table');
    
    await connection.query(`
      CREATE TABLE complaints (
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
    console.log('✅ Created complaints table with correct structure');
    
    // Create indexes
    await connection.query('CREATE INDEX idx_complaints_user_id ON complaints(user_id)');
    await connection.query('CREATE INDEX idx_complaints_status ON complaints(status)');
    await connection.query('CREATE INDEX idx_complaints_category ON complaints(category)');
    await connection.query('CREATE INDEX idx_complaints_created_at ON complaints(created_at)');
    console.log('✅ Created indexes');
    
    // Create admin user
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await connection.query(`
      INSERT INTO users (name, email, password, role, room_no)
      VALUES ('Admin', 'admin@hostel.com', ?, 'admin', NULL)
    `, [adminPassword]);
    console.log('✅ Created admin user');
    
    await connection.end();
    console.log('🎉 Database tables fixed successfully!');
    console.log('📧 Admin login: admin@hostel.com');
    console.log('🔑 Admin password: admin123');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixTables();
