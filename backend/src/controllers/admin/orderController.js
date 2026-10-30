const orderService = require('../../services/admin/orderService');
const { successResponse } = require('../../utils/response');

const getAdminTransactions = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrdersForAdmin();
    return successResponse(res, 'Rekap transaksi berhasil diambil.', orders);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAdminTransactions };