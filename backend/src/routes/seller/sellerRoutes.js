const express = require('express');
const router = express.Router();
const sellerController = require('../../controllers/seller/sellerController');
const { authenticateToken, authorizeRoles } = require('../../middlewares/authMiddleware');

// Endpoint Dashboard & Onboarding Seller
router.get('/dashboard', authenticateToken, authorizeRoles('seller', 'admin'), sellerController.getDashboard);
router.post('/onboarding/shop', authenticateToken, authorizeRoles('seller', 'admin'), sellerController.registerShopOnboarding);
router.patch('/onboarding/tier', authenticateToken, authorizeRoles('seller', 'admin'), sellerController.updateTier);
router.post('/onboarding/finish', authenticateToken, authorizeRoles('seller', 'admin'), sellerController.finishOnboarding);

// Endpoint Manajemen Produk & Spasial Seller
router.post('/products', authenticateToken, authorizeRoles('seller', 'admin'), sellerController.addProduct);
router.post('/spatial', authenticateToken, authorizeRoles('seller', 'admin'), sellerController.addSpatialAsset);

module.exports = router;