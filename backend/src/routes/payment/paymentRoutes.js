const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/payment/paymentController');
const { authenticateToken, authorizeRoles } = require('../../middlewares/authMiddleware');

router.post('/create-tier-charge', authenticateToken, authorizeRoles('seller', 'admin'), paymentController.createTierCharge);

module.exports = router;