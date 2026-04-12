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

// MySQL Database Connection Pool
const pool = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// ============================================================
// 1) Static File Serving (MUST BE FIRST)
// ============================================================
// Serve static frontend files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// 2) Security Middleware
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
    origin: ["http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
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
  origin: ["http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:5501", "http://127.0.0.1:5501", "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5000", "http://127.0.0.1:5000", "https://hostel-grievance-portal-7.onrender.com", "https://hostel-grievance-portal-5.onrender.com"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to check request body
app.use((req, res, next) => {
  if (req.path.includes('/login') || req.path.includes('/register')) {
    console.log(`🔍 ${req.method} ${req.path}`);
    console.log("📥 Request headers:", Object.keys(req.headers));
    console.log("📥 Request body:", req.body);
    console.log("📥 Content-Type:", req.headers['content-type']);
  }
  next();
});

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
// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Root route - serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running', timestamp: new Date().toISOString() });
});


// Explicit OPTIONS handling for CORS preflight
app.options('/api/*', (req, res) => {
  console.log("?? OPTIONS request for:", req.path);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  res.status(200).send();
});

// Test endpoint to verify POST method works
app.post('/api/test-post', (req, res) => {
  console.log("?? Test POST endpoint called");
  res.json({ success: true, message: "POST method works!" });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Hostel Grievance Portal API is running 🚀' });
});

// Debug endpoint to test middleware chain
app.get('/api/debug', async (req, res) => {
  console.log('🔍 Debug endpoint called');
  try {
    const testResults = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'Testing...',
      middleware: 'Testing...',
      auth: 'Testing...'
    };
    
    // Test database connection
    try {
      const db = require('./config/db');
      const conn = await db.getConnection();
      testResults.database = '✅ Connected';
      conn.release();
    } catch (dbErr) {
      testResults.database = `❌ Failed: ${dbErr.message}`;
    }
    
    // Test JWT secret
    testResults.auth = process.env.JWT_SECRET ? '✅ Available' : '❌ Missing';
    
    res.json({
      success: true,
      message: 'Debug information',
      data: testResults
    });
  } catch (err) {
    console.error('💥 Debug endpoint error:', err);
    res.status(500).json({
      success: false,
      message: 'Debug endpoint failed',
      error: err.message
    });
  }
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
// 3) API Routes (AFTER static files)
// ============================================================

// ============================================================
// 4) 404 Handler (MUST BE LAST)
// ============================================================
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ============================================================
// 5) Global Error Handler (MUST BE LAST)
// ============================================================

// Global error handler with detailed logging
app.use((err, req, res, next) => {
  console.error('🚨 GLOBAL ERROR HANDLER:');
  console.error('💥 Error:', err.message);
  console.error('💥 Stack:', err.stack);
  console.error('💥 Request URL:', req.url);
  console.error('💥 Request Method:', req.method);
  console.error('💥 Request Headers:', req.headers);
  console.error('💥 Request Body:', req.body);
  
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    debug: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================================
// Start server
// ============================================================
const PORT = process.env.PORT || 5000;


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);

  console.log(`📂 Uploads served at http://localhost:${PORT}/uploads`);
  console.log(`🔗 Health check at http://localhost:${PORT}/api/health\n`);
});
