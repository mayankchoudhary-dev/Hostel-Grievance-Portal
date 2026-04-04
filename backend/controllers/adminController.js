// controllers/adminController.js - Admin complaint management
const pool = require('../config/db');
const nodemailer = require('nodemailer');

const PAGE_SIZE = 10;

/**
 * Create nodemailer transporter (Gmail SMTP)
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send email notification to student when complaint is resolved
 */
const sendResolutionEmail = async (studentEmail, studentName, complaintTitle, remark) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'youremail@gmail.com') return;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Hostel Admin" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: `✅ Your Complaint Has Been Resolved - ${complaintTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Hostel Grievance Portal</h2>
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>Your complaint "<strong>${complaintTitle}</strong>" has been <span style="color:green;font-weight:bold;">Resolved</span>.</p>
          ${remark ? `<p><strong>Admin Remark:</strong> ${remark}</p>` : ''}
          <p>Thank you for your patience.</p>
          <hr/>
          <p style="color:#888; font-size:12px;">Hostel Grievance Portal — Automated Notification</p>
        </div>
      `,
    });
    console.log(`📧 Resolution email sent to ${studentEmail}`);
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

/**
 * GET /api/admin/complaints
 * Admin gets all complaints with filters and pagination
 * Query: ?page=1&status=&category=&search=&dateFrom=&dateTo=
 */
const getAllComplaints = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const { status, category, search, dateFrom, dateTo, sortBy = 'c.created_at', order = 'DESC' } = req.query;
  const offset = (page - 1) * PAGE_SIZE;

  let conditions = [];
  let params = [];

  if (status) { conditions.push('c.status = ?'); params.push(status); }
  if (category) { conditions.push('c.category = ?'); params.push(category); }
  if (search) {
    conditions.push('(c.title LIKE ? OR c.description LIKE ? OR u.name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (dateFrom) { conditions.push('DATE(c.created_at) >= ?'); params.push(dateFrom); }
  if (dateTo) { conditions.push('DATE(c.created_at) <= ?'); params.push(dateTo); }

  const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  // Whitelist sort columns to prevent SQL injection
  const allowedSort = ['c.created_at', 'c.status', 'c.priority', 'c.category'];
  const safeSort = allowedSort.includes(sortBy) ? sortBy : 'c.created_at';
  const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM complaints c JOIN users u ON c.user_id = u.id ${whereClause}`,
      params
    );

    const [complaints] = await pool.query(
      `SELECT c.*, u.name as student_name, u.email as student_email, u.room_no
       FROM complaints c JOIN users u ON c.user_id = u.id
       ${whereClause}
       ORDER BY ${safeSort} ${safeOrder}
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset]
    );

    return res.status(200).json({
      success: true,
      complaints,
      pagination: {
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (err) {
    console.error('getAllComplaints error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * PUT /api/admin/complaints/:id/status
 * Admin updates status and/or priority of a complaint
 */
const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, priority } = req.body;

  const validStatuses = ['Pending', 'In Progress', 'Resolved'];
  const validPriorities = ['Low', 'Medium', 'High'];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ success: false, message: 'Invalid priority value.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.email as student_email, u.name as student_name
       FROM complaints c JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const updates = [];
    const updateParams = [];
    if (status) { updates.push('status = ?'); updateParams.push(status); }
    if (priority) { updates.push('priority = ?'); updateParams.push(priority); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    await pool.query(`UPDATE complaints SET ${updates.join(', ')} WHERE id = ?`, [...updateParams, id]);

    // Emit socket event
    if (req.io) {
      req.io.emit('complaint:updated', { id: parseInt(id), status, priority });
    }

    // Send email if complaint is being marked as Resolved
    if (status === 'Resolved' && rows[0].status !== 'Resolved') {
      await sendResolutionEmail(
        rows[0].student_email,
        rows[0].student_name,
        rows[0].title,
        rows[0].admin_remark
      );
    }

    return res.status(200).json({ success: true, message: 'Complaint updated.' });
  } catch (err) {
    console.error('updateStatus error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * PUT /api/admin/complaints/:id/remark
 * Admin adds/updates a remark on a complaint
 */
const addRemark = async (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;

  if (!remark || remark.trim() === '') {
    return res.status(400).json({ success: false, message: 'Remark cannot be empty.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.email as student_email, u.name as student_name
       FROM complaints c JOIN users u ON c.user_id = u.id WHERE c.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    await pool.query('UPDATE complaints SET admin_remark = ? WHERE id = ?', [remark.trim(), id]);

    // Emit socket
    if (req.io) {
      req.io.emit('complaint:remark', { id: parseInt(id), remark: remark.trim() });
    }

    return res.status(200).json({ success: true, message: 'Remark added.' });
  } catch (err) {
    console.error('addRemark error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * DELETE /api/admin/complaints/:id
 * Admin deletes any complaint
 */
const adminDeleteComplaint = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT id FROM complaints WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    await pool.query('DELETE FROM complaints WHERE id = ?', [id]);

    if (req.io) {
      req.io.emit('complaint:deleted', { id: parseInt(id) });
    }

    return res.status(200).json({ success: true, message: 'Complaint deleted.' });
  } catch (err) {
    console.error('adminDeleteComplaint error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/admin/analytics
 * Returns counts grouped by status and category for charts
 */
const getAnalytics = async (req, res) => {
  try {
    console.log('📊 Analytics API called by user:', req.user); // Debug log
    
    const [[byStatus]] = await pool.query(
      `SELECT status, COUNT(*) as count FROM complaints GROUP BY status`
    );
    console.log('📊 By status data:', byStatus); // Debug log
    
    const [byCategory] = await pool.query(
      `SELECT category, COUNT(*) as count FROM complaints GROUP BY category`
    );
    console.log('📊 By category data:', byCategory); // Debug log
    
    const [[total]] = await pool.query('SELECT COUNT(*) as total FROM complaints');
    console.log('📊 Total complaints:', total.total); // Debug log

    const analyticsData = { byStatus, byCategory, total: total.total };
    console.log('📊 Final analytics data:', analyticsData); // Debug log

    return res.status(200).json({
      success: true,
      analytics: analyticsData,
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllComplaints, updateStatus, addRemark, adminDeleteComplaint, getAnalytics };
