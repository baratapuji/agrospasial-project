const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/admin/orderController');
const { authenticateToken, authorizeRoles } = require('../../middlewares/authMiddleware');

router.get('/admin/transactions', authenticateToken, authorizeRoles('admin'), orderController.getAdminTransactions);

module.exports = router;