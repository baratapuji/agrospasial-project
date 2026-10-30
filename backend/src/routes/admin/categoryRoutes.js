const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/categoryController');
const { authenticateToken, authorizeRoles } = require('../../middlewares/authMiddleware');

// Endpoint publik (bisa diakses seller saat form produk)
router.get('/', categoryController.getCategories);

// Endpoint khusus Admin
router.post('/', authenticateToken, authorizeRoles('admin'), categoryController.addCategory);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), categoryController.removeCategory);

module.exports = router;