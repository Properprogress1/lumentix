// Centralized error handling middleware

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Stellar SDK errors
  if (err.response && err.response.data) {
    return res.status(400).json({
      error: {
        code: 'STELLAR_ERROR',
        message: err.response.data.detail || err.message,
        status: 400,
        details: err.response.data
      }
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        status: 400
      }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
        status: 401
      }
    });
  }

  // Database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Resource already exists',
        status: 409
      }
    });
  }

  // Default error
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
      status: status
    }
  });
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
