// controllers/complaintController.js - Student complaint CRUD
const pool = require('../config/db');

const PAGE_SIZE = 10;

/**
 * POST /api/complaints
 * Student submits a new complaint (with optional image upload via multer)
 */
const submitComplaint = async (req, res) => {
  const { title, description, category, priority } = req.body;
  const userId = req.user.id;

  if (!title || !description || !category) {
    return res.status(400).json({ success: false, message: 'Title, description and category are required.' });
  }

  const validCategories = ['Electricity', 'Water', 'Mess', 'Cleanliness', 'Internet', 'Other'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ success: false, message: 'Invalid category.' });
  }

  const validPriorities = ['Low', 'Medium', 'High'];
  const complaintPriority = validPriorities.includes(priority) ? priority : 'Low';

  // Build image URL if file was uploaded
  const imageUrl = req.file
    ? `/uploads/${req.file.filename}`
    : null;

  try {
    const [result] = await pool.query(
      `INSERT INTO complaints (user_id, title, description, category, priority, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, title.trim(), description.trim(), category, complaintPriority, imageUrl]
    );

    const [rows] = await pool.query('SELECT * FROM complaints WHERE id = ?', [result.insertId]);

    // Emit real-time event (socket attached to req by server.js)
    if (req.io) {
      req.io.emit('complaint:new', rows[0]);
    }

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      complaint: rows[0],
    });
  } catch (err) {
    console.error('submitComplaint error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/complaints/my
 * Get paginated complaints submitted by the logged-in student
 * Query: ?page=1&search=&category=&status=
 */
const getMyComplaints = async (req, res) => {
  const userId = req.user.id;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const search = req.query.search ? `%${req.query.search}%` : null;
  const category = req.query.category || null;
  const status = req.query.status || null;

  const offset = (page - 1) * PAGE_SIZE;

  // Build dynamic WHERE clauses
  let conditions = ['c.user_id = ?'];
  let params = [userId];

  if (search) {
    conditions.push('(c.title LIKE ? OR c.description LIKE ?)');
    params.push(search, search);
  }
  if (category) {
    conditions.push('c.category = ?');
    params.push(category);
  }
  if (status) {
    conditions.push('c.status = ?');
    params.push(status);
  }

  const whereClause = 'WHERE ' + conditions.join(' AND ');

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM complaints c ${whereClause}`,
      params
    );

    const [complaints] = await pool.query(
      `SELECT c.*, u.name as student_name, u.room_no
       FROM complaints c JOIN users u ON c.user_id = u.id
       ${whereClause}
       ORDER BY c.created_at DESC
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
    console.error('getMyComplaints error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * PUT /api/complaints/:id
 * Student edits their own complaint (only if status is Pending)
 */
const updateComplaint = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, description, category } = req.body;

  try {
    // Verify ownership and status
    const [rows] = await pool.query(
      'SELECT * FROM complaints WHERE id = ? AND user_id = ?', [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }
    if (rows[0].status === 'Resolved') {
      return res.status(403).json({ success: false, message: 'Cannot edit a resolved complaint.' });
    }

    const validCategories = ['Electricity', 'Water', 'Mess', 'Cleanliness', 'Internet', 'Other'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    }

    const newTitle = title?.trim() || rows[0].title;
    const newDesc = description?.trim() || rows[0].description;
    const newCat = category || rows[0].category;

    await pool.query(
      'UPDATE complaints SET title = ?, description = ?, category = ? WHERE id = ?',
      [newTitle, newDesc, newCat, id]
    );

    return res.status(200).json({ success: true, message: 'Complaint updated.' });
  } catch (err) {
    console.error('updateComplaint error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * DELETE /api/complaints/:id
 * Student deletes their own complaint (only if not Resolved)
 */
const deleteComplaint = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM complaints WHERE id = ? AND user_id = ?', [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }
    if (rows[0].status === 'Resolved') {
      return res.status(403).json({ success: false, message: 'Cannot delete a resolved complaint.' });
    }

    await pool.query('DELETE FROM complaints WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Complaint deleted.' });
  } catch (err) {
    console.error('deleteComplaint error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { submitComplaint, getMyComplaints, updateComplaint, deleteComplaint };
