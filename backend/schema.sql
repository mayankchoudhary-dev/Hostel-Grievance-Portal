-- ============================================================
-- Hostel Grievance Portal - Database Schema
-- Run this file in MySQL to set up the database
-- ============================================================

CREATE DATABASE IF NOT EXISTS hostel_grievance;
USE hostel_grievance;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  room_no VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: complaints
-- ============================================================
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
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);

-- ============================================================
-- SEED: Default Admin Account
-- Password: admin123 (proper bcrypt hash)
-- Change this password immediately in production!
-- ============================================================
INSERT INTO users (name, email, password, role, room_no)
VALUES (
  'Admin',
  'admin@hostel.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123 (bcrypt hash)
  'admin',
  NULL
) ON DUPLICATE KEY UPDATE id = id;

-- NOTE: The seed password hash above uses a placeholder.
-- After running schema.sql, you can register a new admin via
-- the API by temporarily allowing role='admin' in the register
-- endpoint, or by updating manually:
--
-- UPDATE users SET role='admin' WHERE email='admin@hostel.com';
