const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hostel_grievance'
    });
    
    console.log('✅ Connected to MySQL');
    
    // Test if users table exists
    const [tables] = await connection.query('SHOW TABLES LIKE "users"');
    if (tables.length === 0) {
      console.log('❌ Users table does not exist');
      console.log('💡 Run: node setup.js');
    } else {
      console.log('✅ Users table exists');
    }
    
    // Test if complaints table exists
    const [complaintTables] = await connection.query('SHOW TABLES LIKE "complaints"');
    if (complaintTables.length === 0) {
      console.log('❌ Complaints table does not exist');
      console.log('💡 Run: node setup.js');
    } else {
      console.log('✅ Complaints table exists');
    }
    
    await connection.end();
    console.log('🎉 Database test completed');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.log('\n💡 Possible solutions:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check .env file for correct DB credentials');
    console.log('3. Run: node setup.js to create database and tables');
  }
}

testDatabase();
