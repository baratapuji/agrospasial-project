const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('🔥 Error Log:', err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  return errorResponse(res, message, statusCode);
};

module.exports = { errorHandler };