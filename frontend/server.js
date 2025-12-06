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

// Serve static files from the React app build directory
// This will serve files from build/static/js, build/static/css, etc.
// express.static automatically passes to next middleware if file not found
app.use(express.static(BUILD_PATH, {
  maxAge: '1y',
  etag: false,
  index: false // Don't auto-serve index.html, let catch-all route handle it
}));

// Handle React routing - return all non-API, non-static requests to React app
// This catches all routes that don't match static files
app.get('*', (req, res) => {
  // Skip API routes (though they shouldn't reach here if backend is separate)
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Check if it's actually a static file that wasn't found
  const filePath = path.join(BUILD_PATH, req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    // This shouldn't happen, but just in case
    return res.sendFile(filePath);
  }
  
  // For all other routes (React Router routes), serve index.html
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

