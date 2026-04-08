const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5500;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Parse URL
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Default to index.html for root
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Construct file path
  const filePath = path.join(__dirname, pathname);
  
  // Get file extension
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`File not found: ${filePath}`);
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html><html><head><title>404 - File Not Found</title></head><body><h1>Cannot ${req.method} ${req.url}</h1><p>The requested file was not found.</p></body></html>`);
      return;
    }
    
    // Read and serve file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.log(`Error reading file: ${filePath}`, err);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('Internal Server Error');
        return;
      }
      
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Simple Frontend Server running on http://localhost:${PORT}`);
  console.log(`🏠 Home page: http://localhost:${PORT}/`);
  console.log(`📱 Register page: http://localhost:${PORT}/register.html`);
  console.log(`👨‍💼 Admin dashboard: http://localhost:${PORT}/admin-dashboard.html`);
  console.log(`👨‍🎓 Student dashboard: http://localhost:${PORT}/student-dashboard.html`);
  console.log(`\n📝 All HTML files are now accessible!`);
});
