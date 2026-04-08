const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.FRONTEND_PORT || 5500;

console.log('🚀 Starting Enhanced Frontend Server...');
console.log(`📂 Serving files from: ${__dirname}`);
console.log(`🌐 Server will be available at: http://localhost:${PORT}`);

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
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.error('❌ register.html not found at:', filePath);
    res.status(404).send('register.html not found');
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
    res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
  }
});

// Handle 404 for other routes with better error message
app.use((req, res) => {
  console.log(`❌ 404 for route: ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      '/index.html',
      '/register.html', 
      '/admin-dashboard.html',
      '/student-dashboard.html'
    ]
  });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`✅ Frontend server running successfully on port ${PORT}`);
  console.log(`🌐 Available URLs:`);
  console.log(`   - http://localhost:${PORT}/index.html`);
  console.log(`   - http://localhost:${PORT}/register.html`);
  console.log(`   - http://localhost:${PORT}/admin-dashboard.html`);
  console.log(`   - http://localhost:${PORT}/student-dashboard.html`);
  console.log(`   - http://localhost:${PORT}/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log('💡 Solution: Kill existing process or use different port');
    console.log('   Command: taskkill /F /IM node.exe');
    console.log('   Then try again');
  } else {
    console.error('❌ Server error:', err);
  }
});
