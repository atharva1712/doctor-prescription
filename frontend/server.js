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
if (fs.existsSync(path.join(BUILD_PATH, 'static'))) {
  console.log('Static directory exists');
  if (fs.existsSync(path.join(BUILD_PATH, 'static', 'js'))) {
    console.log('Static/js directory exists, files:', fs.readdirSync(path.join(BUILD_PATH, 'static', 'js')).slice(0, 5));
  }
}

// Serve static files from the React app build directory
// This will serve files from build/static/js, build/static/css, etc.
// express.static will serve files if they exist, otherwise call next()
app.use(express.static(BUILD_PATH, {
  maxAge: '1y',
  etag: false
}));

// Handle React routing - return all non-API, non-static requests to React app
// This catches routes that don't match static files
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // If it's a request for a static file that wasn't served by express.static,
  // it means the file doesn't exist - return 404
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$/)) {
    return res.status(404).send('File not found');
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

