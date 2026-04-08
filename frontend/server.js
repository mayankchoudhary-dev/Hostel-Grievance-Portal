const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.FRONTEND_PORT || 5500;

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
  res.json({ success: true, message: 'Frontend server is running' });
});

// Serve HTML files for specific routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.get('/student-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'student-dashboard.html'));
});

// Catch-all route for any .html file
app.get('*.html', (req, res) => {
  const filePath = path.join(__dirname, req.path);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
  }
});

// Handle 404 for other routes
app.use((req, res) => {
  res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on http://localhost:${PORT}`);
  console.log(`🏠 Home page: http://localhost:${PORT}/`);
  console.log(`📱 Register page: http://localhost:${PORT}/register.html`);
  console.log(`👨‍💼 Admin dashboard: http://localhost:${PORT}/admin-dashboard.html`);
  console.log(`👨‍🎓 Student dashboard: http://localhost:${PORT}/student-dashboard.html`);
  console.log(`\n📝 All HTML files are now accessible!`);
});
