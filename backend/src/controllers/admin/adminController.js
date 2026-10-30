const adminService = require('../../services/admin/adminService');
const { successResponse } = require('../../utils/response');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getAdminStats();
    return successResponse(res, 'Statistik admin berhasil diambil.', stats);
  } catch (error) {
    next(error);
  }
};

const getPendingSellers = async (req, res, next) => {
  try {
    const sellers = await adminService.getPendingSellers();
    return successResponse(res, 'Daftar pengajuan mitra berhasil diambil.', sellers);
  } catch (error) {
    next(error);
  }
};

const verifySeller = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const { isApproved } = req.body;
    const adminId = req.user.userId;

    const result = await adminService.approveSeller(adminId, sellerId, isApproved);
    const message = isApproved 
      ? 'Mitra berhasil diverifikasi dan diaktifkan.' 
      : 'Pengajuan mitra telah ditolak.';

    return successResponse(res, message, { id: result.id, status: result.status_akun });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getPendingSellers, verifySeller };