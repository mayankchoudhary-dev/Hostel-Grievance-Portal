// middleware/authMiddleware.js - JWT verification
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  console.log('🔍 AUTH MIDDLEWARE - REAL DEBUGGING:');
  console.log('=====================================');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  console.log('Auth Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No token provided or wrong format');
    console.log('Expected: "Bearer <token>"');
    console.log('Got:', authHeader || 'null');
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Extracted token:', token ? token.substring(0, 50) + '...' : 'null');
  console.log('Token length:', token ? token.length : 0);
  console.log('JWT_SECRET used:', process.env.JWT_SECRET ? 'Present' : 'MISSING!');

  try {
    console.log('🔍 Attempting JWT verification...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    console.log('✅ Token verified successfully!');
    console.log('Decoded user:', decoded);
    console.log('=====================================');
    next();
  } catch (err) {
    console.error('💥 JWT VERIFICATION FAILED:');
    console.error('Error type:', err.name);
    console.error('Error message:', err.message);
    console.error('Full error:', err);
    console.error('Token that failed:', token);
    console.error('JWT_SECRET used:', process.env.JWT_SECRET);
    console.log('=====================================');
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
