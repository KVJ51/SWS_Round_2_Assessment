const multer = require('multer');

/**
 * 404 Not Found handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
};

/**
 * Centralized error-handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Handle JSON syntax parse error from body parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message: 'Malformed JSON payload in request body'
    });
  }

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum allowed size is 5 MB.'
      });
    }
    return res.status(400).json({
      message: err.message || 'File upload error'
    });
  }

  // Handle custom validation / file type errors
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      message: err.message
    });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: `Invalid ${err.path}: ${err.value}`
    });
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      message: messages.join(', ')
    });
  }

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : (res.statusCode || 500);
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    message
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
