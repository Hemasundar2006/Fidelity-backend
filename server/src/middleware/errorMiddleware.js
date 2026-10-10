import AppError from '../utils/AppError.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new AppError(message, 404, 'NOT_FOUND');
  }

  if (err.code === 11000) {
    console.error('Duplicate key error details:', err.keyValue, err.keyPattern);
    const message = `Duplicate field value entered: ${JSON.stringify(err.keyValue)}`;
    error = new AppError(message, 409, 'CONFLICT');
  }

  if (err.name === 'ValidationError') {
    const message = (err.errors ? Object.values(err.errors) : []).map(val => val.message).join(', ');
    error = new AppError(message, 422, 'VALIDATION_ERROR');
  }

  const statusCode = error.statusCode || 500;
  const code = error.code || 'SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: error.message || 'Server Error',
      details: error.details || []
    }
  });
};

export default errorHandler;
