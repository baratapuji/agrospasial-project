const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return errorResponse(res, 'Akses ditolak. Token tidak ditemukan.', 401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return errorResponse(res, 'Token tidak valid atau telah kedaluwarsa.', 403);
    }
    req.user = user;
    next();
  });
};

// Middleware Khusus Pembatasan Role
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Anda tidak memiliki hak akses untuk fitur ini.', 403);
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };