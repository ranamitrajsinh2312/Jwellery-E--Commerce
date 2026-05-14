const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
  
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: Object.values(err.errors).map(e => e.message),
      });
    }
  
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
  
    // Default to 500 for unhandled errors
    res.status(500).json({
      message: 'Server error',
      error: err.message, // Include message for easier debugging
    });
  };

  
  module.exports = errorHandler;