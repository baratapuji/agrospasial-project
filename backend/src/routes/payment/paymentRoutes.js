const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/payment/paymentController');
const { authenticateToken, authorizeRoles } = require('../../middlewares/authMiddleware');

// Butuh login (seller/admin)
router.post('/create-tier-charge', authenticateToken, authorizeRoles('seller', 'admin'), paymentController.createTierCharge);
router.post('/tier/sync', authenticateToken, authorizeRoles('seller', 'admin'), paymentController.syncTier);

// Webhook Midtrans: PUBLIK, jangan pasang authenticateToken (Midtrans tidak membawa JWT)
router.post('/notification', paymentController.midtransNotification);

module.exports = router;