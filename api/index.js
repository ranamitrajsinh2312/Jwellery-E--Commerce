const app = require('../backend/server');
const path = require('path');
const express = require('express');

// Serve static files from the 'dist' directory inside 'api'
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Handle SPA routing: serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

module.exports = app;
