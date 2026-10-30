const paymentService = require('../../services/payment/paymentService');
const { handleMidtransNotification } = require('../../services/payment/WebhookService');
const { successResponse, errorResponse } = require('../../utils/response');

const createTierCharge = async (req, res, next) => {
  try {
    const { shopId, tierType } = req.body; // harga ditentukan server, bukan dari request
    const user = req.user; // dari middleware authenticateToken

    if (!shopId || !tierType) {
      return errorResponse(res, 'Data pembayaran tidak lengkap.', 400);
    }

    // Urutan argumen harus sama dengan paymentService: (shopId, tierType, user)
    const transaction = await paymentService.createTierTransaction(shopId, tierType, user);
    return successResponse(res, 'Token pembayaran Midtrans berhasil dibuat.', transaction, 201);
  } catch (error) {
    next(error);
  }
};

// Webhook Midtrans (route publik, tanpa authenticateToken)
const midtransNotification = async (req, res, next) => {
  try {
    await handleMidtransNotification(req.body);
    return res.status(200).json({ status: 'OK' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTierCharge, midtransNotification };