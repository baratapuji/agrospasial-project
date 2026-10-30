const express = require('express');
const router = express.Router();
const webhookController = require('../../controllers/payment/webhookController');

// Endpoint publik untuk menerima webhook Midtrans
router.post('/notification', webhookController.handleNotification);

module.exports = router;