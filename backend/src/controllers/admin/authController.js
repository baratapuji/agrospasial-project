const authService = require('../../services/admin/authService');
const { successResponse, errorResponse } = require('../../utils/response');

const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    const message = user.role === 'seller' 
      ? 'Pendaftaran Mitra berhasil! Akun Anda sedang menunggu verifikasi dari Admin.' 
      : 'Pendaftaran akun Pembeli berhasil.';
    
    return successResponse(res, message, { id: user.id, email: user.email, role: user.role, status: user.status_akun }, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.loginUser(email, password);
    return successResponse(res, 'Login berhasil.', data);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };