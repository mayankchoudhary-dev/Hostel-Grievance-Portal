// server.js - Express entry point with Socket.io
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// ============================================================
// Security Middleware
// ============================================================
// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

// Rate limiting (prevents spam attacks) - DISABLED FOR TESTING
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 min
//   max: 1000, // Increased from 100 to 1000
//   message: { success: false, message: 'Too many requests, please try again later.' }
// });
// app.use(limiter);

// ============================================================
// Socket.io setup
// ============================================================
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ============================================================
// Middleware - attach io instance to every request
// ============================================================
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// CORS configuration - MUST come before all routes
app.use(cors({
  origin: "https://hostelhgp.netlify.app",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically with CORS headers (before other middleware)
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Max-Age', '86400');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Disable caching for API responses (except uploads)
app.use((req, res, next) => {
  if (!req.path.startsWith('/uploads')) {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
  }
  next();
});

// ============================================================
app.get('/', (req, res) => {
  res.send('Hostel Grievance Portal Backend Running 🚀');
});
// ============================================================
app.use('/api', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Hostel Grievance Portal API is running 🚀' });
});

// Image serving endpoint with proper CORS
app.get('/api/images/:filename', (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  const filePath = path.join(__dirname, 'uploads', filename);
  
  console.log('🔍 Image request:', filename); // Debug log
  console.log('🔍 File path:', filePath); // Debug log
  console.log('🔍 File exists:', fs.existsSync(filePath)); // Debug log
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log('🔍 File not found:', filePath); // Debug log
    return res.status(404).json({ success: false, message: 'Image not found' });
  }
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  
  // Set content type based on file extension
  const ext = path.extname(filename).toLowerCase();
  const contentType = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  }[ext] || 'application/octet-stream';
  
  res.setHeader('Content-Type', contentType);
  
  console.log('🔍 Serving image:', filePath, 'Content-Type:', contentType); // Debug log
  
  // Send file
  res.sendFile(filePath);
});

// Test image serving
app.get('/api/test-images', (_req, res) => {
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(__dirname, 'uploads');
  
  try {
    const files = fs.readdirSync(uploadsDir);
    const imageFiles = files.filter(file => 
      file.endsWith('.jpg') || file.endsWith('.jpeg') || 
      file.endsWith('.png') || file.endsWith('.gif')
    );
    
    res.json({
      success: true,
      uploadsDir: uploadsDir,
      files: files,
      imageFiles: imageFiles,
      testUrls: imageFiles.map(file => `https://hostel-grievance-portal.onrender.com/uploads/${file}`)
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.send(200);
});

// Specific OPTIONS handler for uploads
app.options('/uploads/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Max-Age', '86400');
  res.send(200);
});

// ============================================================
// 404 Handler
// ============================================================
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ============================================================
// Global error handler
// ============================================================
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

// ============================================================
// Start server
// ============================================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📂 Uploads served at http://localhost:${PORT}/uploads`);
  console.log(`🔗 Health check at http://localhost:${PORT}/api/health\n`);
});
