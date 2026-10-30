const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/productController');
const { authenticateToken, authorizeRoles } = require('../../middlewares/authMiddleware');

// Endpoint khusus Admin untuk moderasi produk
router.get('/admin/all', authenticateToken, authorizeRoles('admin'), productController.getAdminProducts);
router.patch('/admin/status/:productId', authenticateToken, authorizeRoles('admin'), productController.updateProductStatus);

module.exports = router;