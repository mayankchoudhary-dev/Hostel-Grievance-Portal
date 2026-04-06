const express = require('express');
const cors = require('cors');

const app = express();

// Test CORS configuration
app.use(cors({
  origin: ['http://localhost:5500', 'https://hostelhgp.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'X-Requested-With']
}));

app.get('/test-cors', (req, res) => {
  res.json({
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

const PORT = 5002; // Different port to avoid conflicts
app.listen(PORT, () => {
  console.log(`🚀 CORS test server running on http://localhost:${PORT}`);
});
