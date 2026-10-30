const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/adminController');
const { authenticateToken, authorizeRoles } = require('../../middlewares/authMiddleware');

// Proteksi seluruh rute admin
router.use(authenticateToken, authorizeRoles('admin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/pending-sellers', adminController.getPendingSellers);
router.patch('/verify-seller/:sellerId', adminController.verifySeller);

module.exports = router;