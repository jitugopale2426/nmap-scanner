const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';
  const errorCode = err.errorCode || 'INTERNAL_ERROR';

  console.error(`[${req.method}] ${req.path} → ${status} [${errorCode}]: ${message}`);

  res.status(status).json({
    success: false,
    message,
    errorCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
