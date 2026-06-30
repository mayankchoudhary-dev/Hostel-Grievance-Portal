-- Database Schema for Hostel Grievance Portal
-- Run this in Render MySQL dashboard after database creation

CREATE DATABASE IF NOT EXISTS hostel_grievance_portal;
USE hostel_grievance_portal;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    room_no VARCHAR(50),
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints table
CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('Electricity', 'Water', 'Mess', 'Cleanliness', 'Internet', 'Other') NOT NULL,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    admin_remark TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@hgp.com', '$2b$10$YourHashedPasswordHere', 'admin');

-- Insert sample student user (password: student123)
INSERT INTO users (name, email, password, room_no, role) VALUES 
('Test Student', 'student@hgp.com', '$2b$10$YourHashedPasswordHere', 'A101', 'student');
