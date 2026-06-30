// routes/adminRoutes.js - Admin-only complaint management routes
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getAllComplaints,
  updateStatus,
  addRemark,
  adminDeleteComplaint,
  getAnalytics,
} = require('../controllers/adminController');

// All routes require admin auth
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// GET /api/admin/complaints — list all with filters
router.get('/complaints', getAllComplaints);

// PUT /api/admin/complaints/:id/status — update status & priority
router.put('/complaints/:id/status', updateStatus);

// PUT /api/admin/complaints/:id/remark — add/update remark
router.put('/complaints/:id/remark', addRemark);

// DELETE /api/admin/complaints/:id — delete any complaint
router.delete('/complaints/:id', adminDeleteComplaint);

// GET /api/admin/analytics — chart data
router.get('/analytics', getAnalytics);

module.exports = router;
