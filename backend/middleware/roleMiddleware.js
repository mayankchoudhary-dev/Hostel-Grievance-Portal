// middleware/roleMiddleware.js - Role-based access control
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('🔍 Role middleware called for:', req.url, 'user:', req.user?.email);
    
    if (!req.user) {
      console.log('❌ User not authenticated in role middleware');
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log('❌ Role access denied. User role:', req.user.role, 'Allowed:', allowedRoles);
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires role: ${allowedRoles.join(' or ')}.`,
      });
    }

    console.log('✅ Role middleware passed for:', req.user.email);
    next();
  };
};

module.exports = roleMiddleware;
