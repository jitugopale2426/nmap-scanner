class AppError extends Error {
  constructor(message, status = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
  }
}

export default AppError;
