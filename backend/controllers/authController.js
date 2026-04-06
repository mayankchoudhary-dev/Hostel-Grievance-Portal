// controllers/authController.js - Registration and Login
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');

/**
 * Generate JWT token for a user
 */
const signToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES || '1d'
    }
  );
};

/**
 * POST /api/register
 * Registers a new student account
 */
const register = async (req, res) => {
  const { name, email, password, room_no } = req.body;

    try {
      // Check if email already exists
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user (role is always 'student' on self-registration)
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, role, room_no) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, 'student', room_no]
      );

      const newUser = { id: result.insertId, email, role: 'student', name };
      delete newUser.password; // Ensure password is never sent
      const token = signToken(newUser);

      return res.status(201).json({
        success: true,
        message: 'Registration successful.',
        token,
        user: newUser,
      });
    } catch (err) {
      console.error('register error:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

/**
 * POST /api/login
 * Authenticates existing users (student or admin)
 */
const login = async (req, res) => {
  console.log("🔍 Login request received");
  console.log("📥 Request body:", req.body);
  console.log("📥 Headers:", req.headers);
  
  const { email, password } = req.body;
  
  console.log("📧 Extracted email:", email);
  console.log("🔑 Extracted password:", password ? "Present" : "Missing");

  try {
    console.log("🔍 Querying database for email:", email);
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log("📊 Database query result:", rows.length, "rows found");
    
    if (rows.length === 0) {
      console.log("❌ No user found with email:", email);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];
    console.log("👤 User found:", { id: user.id, email: user.email, role: user.role });
    console.log("🔐 Stored password hash exists:", !!user.password);
    
    console.log("🔍 Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Password match result:", isMatch);

    if (!isMatch) {
      console.log("❌ Password comparison failed for email:", email);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    delete user.password; // Ensure password is never sent
    const token = signToken(user);
    console.log("🎫 Token generated successfully");

    console.log("✅ Login successful for:", email);
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: user,
    });
  } catch (err) {
    console.error('💥 Login error:', err);
    console.error('💥 Error stack:', err.stack);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, login };
