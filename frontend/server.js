const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';
const BUILD_PATH = path.join(__dirname, 'build');

// Check if build directory exists
if (!fs.existsSync(BUILD_PATH)) {
  console.error('ERROR: Build directory does not exist. Please run "npm run build" first.');
  process.exit(1);
}

// Log build directory contents for debugging
console.log('Build directory contents:', fs.readdirSync(BUILD_PATH));

// Request logging middleware (only log 404s for static assets)
app.use((req, res, next) => {
  // Skip logging for API routes and root
  if (req.path.startsWith('/api') || req.path === '/') {
    return next();
  }
  
  // Check if it's a static file request
  const filePath = path.join(BUILD_PATH, req.path);
  const exists = fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  
  if (!exists) {
    console.log(`⚠️  404 - Static file not found: ${req.path}`);
  }
  next();
});

// Serve static files from the React app build directory
// This will serve files from build/static/js, build/static/css, etc.
app.use(express.static(BUILD_PATH, {
  maxAge: '1y',
  etag: false,
  index: false // Don't auto-serve index.html, let catch-all route handle it
}));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  const indexPath = path.join(BUILD_PATH, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build files not found. Please run "npm run build" first.');
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Serving files from: ${BUILD_PATH}`);
});

