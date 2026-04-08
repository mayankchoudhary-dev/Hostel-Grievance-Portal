// middleware/authMiddleware.js - JWT verification
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  console.log('🔍 Auth middleware called for:', req.url);
  
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No token provided');
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    console.log('🔍 Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    console.log('✅ Token verified for user:', decoded.email);
    next();
  } catch (err) {
    console.error('💥 Token verification failed:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
