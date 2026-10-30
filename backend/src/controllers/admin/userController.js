const userService = require('../../services/admin/userService');
const { successResponse } = require('../../utils/response');

const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsersForAdmin();
    return successResponse(res, 'Daftar pengguna berhasil diambil.', users);
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' | 'suspended'
    const adminId = req.user.userId;

    const updated = await userService.toggleUserStatus(adminId, id, status);
    return successResponse(res, 'Status akun pengguna berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, updateStatus };