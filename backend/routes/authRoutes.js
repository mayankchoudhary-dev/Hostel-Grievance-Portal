// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { register, login } = require('../controllers/authController');

// POST /api/register
router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('room_no').trim().notEmpty(),
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // continue logic
    return await register(req, res);
  }
);

// POST /api/login
router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    console.log("Login API called"); // Debug log
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // continue logic
    return await login(req, res);
  }
);

module.exports = router;
