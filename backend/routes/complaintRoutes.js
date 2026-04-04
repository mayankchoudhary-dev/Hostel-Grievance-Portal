// routes/complaintRoutes.js - Student complaint routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  submitComplaint,
  getMyComplaints,
  updateComplaint,
  deleteComplaint,
} = require('../controllers/complaintController');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const isAllowed = allowed.test(path.extname(file.originalname).toLowerCase())
    && allowed.test(file.mimetype);
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, png, gif, webp).'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB limit

// All routes require student auth
router.use(authMiddleware);
router.use(roleMiddleware('student'));

// POST /api/complaints — submit with optional image
router.post('/', upload.single('image'), submitComplaint);

// GET /api/complaints/my — paginated list
router.get('/my', getMyComplaints);

// PUT /api/complaints/:id — edit complaint
router.put('/:id', updateComplaint);

// DELETE /api/complaints/:id — delete complaint
router.delete('/:id', deleteComplaint);

module.exports = router;
