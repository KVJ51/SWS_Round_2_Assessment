const express = require('express');
const cors = require('cors');
const documentRoutes = require('./routes/document.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok'
  });
});

// Routes
app.use('/api/documents', documentRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
