const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;