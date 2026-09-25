const express = require('express');
const cors = require('cors');
const documentRoutes = require('./routes/document.routes');
const chatRoutes = require('./routes/chat.routes');
const errorHandler = require('./middleware/error.middleware');
const { setupSwagger } = require('./swagger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation UI
setupSwagger(app);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok'
  });
});

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
