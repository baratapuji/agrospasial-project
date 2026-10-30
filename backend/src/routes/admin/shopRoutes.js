const express = require('express');
const router = express.Router();
const shopController = require('../../controllers/admin/shopController');
const { authenticateToken, authorizeRoles } = require('../../middlewares/authMiddleware');

router.get('/admin/pending', authenticateToken, authorizeRoles('admin'), shopController.getPendingShops);
router.patch('/admin/verify/:id', authenticateToken, authorizeRoles('admin'), shopController.verifyShop);

module.exports = router;