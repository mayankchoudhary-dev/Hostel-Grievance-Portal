const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.FRONTEND_PORT || 5500;

console.log('🚀 Starting Complete Frontend Server...');
console.log(`📂 Serving files from: ${__dirname}`);
console.log(`🌐 Server will be available at: http://localhost:${PORT}`);

// Enable detailed request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// CORS middleware
app.use(cors({
  origin: ['http://localhost:5001', 'http://127.0.0.1:5001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Serve static files (CSS, JS, images)
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ success: true, message: 'Frontend server is running', port: PORT });
});

// Serve HTML files for specific routes with enhanced logging
app.get('/', (req, res) => {
  console.log('📄 Serving index.html');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  console.log('📄 Serving index.html');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/register.html', (req, res) => {
  console.log('📝 Serving register.html');
  const filePath = path.join(__dirname, 'register.html');
  console.log(`🔍 Looking for file at: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    console.log('✅ register.html found, serving file');
    res.sendFile(filePath);
  } else {
    console.error('❌ register.html NOT found at:', filePath);
    console.error('📂 Available files in directory:');
    const files = fs.readdirSync(__dirname);
    files.forEach(file => {
      if (file.endsWith('.html')) {
        console.error(`   - ${file}`);
      }
    });
    res.status(404).json({
      error: 'File not found',
      message: 'register.html not found',
      path: filePath,
      availableFiles: files.filter(f => f.endsWith('.html'))
    });
  }
});

app.get('/admin-dashboard.html', (req, res) => {
  console.log('👨‍💼 Serving admin-dashboard.html');
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.get('/student-dashboard.html', (req, res) => {
  console.log('👨‍🎓 Serving student-dashboard.html');
  res.sendFile(path.join(__dirname, 'student-dashboard.html'));
});

// Enhanced catch-all route for any .html file
app.get('*.html', (req, res) => {
  const filePath = path.join(__dirname, req.path);
  console.log(`🔍 Catch-all route: ${req.path} -> ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    console.log(`✅ File found: ${filePath}`);
    res.sendFile(filePath);
  } else {
    console.log(`❌ File not found: ${filePath}`);
    res.status(404).json({
      error: 'File not found',
      message: `Cannot ${req.method} ${req.originalUrl}`,
      path: filePath,
      availableRoutes: ['/index.html', '/register.html', '/admin-dashboard.html', '/student-dashboard.html']
    });
  }
});

// Handle 404 for other routes with JSON response
app.use((req, res) => {
  console.log(`❌ 404 for route: ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      '/index.html',
      '/register.html', 
      '/admin-dashboard.html',
      '/student-dashboard.html',
      '/health'
    ]
  });
});

// Start server with comprehensive error handling
const server = app.listen(PORT, () => {
  console.log(`✅ Frontend server running successfully on port ${PORT}`);
  console.log(`🌐 Available URLs:`);
  console.log(`   - http://localhost:${PORT}/index.html`);
  console.log(`   - http://localhost:${PORT}/register.html`);
  console.log(`   - http://localhost:${PORT}/admin-dashboard.html`);
  console.log(`   - http://localhost:${PORT}/student-dashboard.html`);
  console.log(`   - http://localhost:${PORT}/health`);
  console.log('🎯 Server ready for requests!');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error('💡 Solutions:');
    console.error('   1. Kill existing process: taskkill /F /IM node.exe');
    console.error('   2. Use different port: set FRONTEND_PORT=5501');
    console.error('   3. Check for other Node.js processes');
  } else {
    console.error('❌ Server error:', err);
  }
});
