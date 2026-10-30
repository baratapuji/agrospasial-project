const shopService = require('../../services/admin/shopService');
const { successResponse } = require('../../utils/response');

const getPendingShops = async (req, res, next) => {
  try {
    const shops = await shopService.getPendingShops();
    return successResponse(res, 'Daftar pengajuan mitra pending berhasil diambil.', shops);
  } catch (error) {
    next(error);
  }
};

const verifyShop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;
    const adminId = req.user.userId;

    const updated = await shopService.verifyShop(adminId, id, isVerified);
    return successResponse(res, isVerified ? 'Mitra berhasil diverifikasi.' : 'Mitra ditolak.', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getPendingShops, verifyShop };