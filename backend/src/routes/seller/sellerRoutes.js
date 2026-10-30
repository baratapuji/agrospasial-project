const express = require('express');
const router = express.Router();
const sellerController = require('../../controllers/seller/sellerController');
const { authenticateToken, authorizeRoles } = require('../../middlewares/authMiddleware');

const sellerOrAdmin = [authenticateToken, authorizeRoles('seller', 'admin')];

// Dashboard & Onboarding Seller
router.get('/dashboard', ...sellerOrAdmin, sellerController.getDashboard);
router.get('/onboarding/status', ...sellerOrAdmin, sellerController.getOnboardingStatus);
router.post('/onboarding/shop', ...sellerOrAdmin, sellerController.registerShopOnboarding);
router.patch('/onboarding/tier', ...sellerOrAdmin, sellerController.updateTier);
router.post('/onboarding/finish', ...sellerOrAdmin, sellerController.finishOnboarding);

// Manajemen Produk & Spasial Seller
router.post('/products', ...sellerOrAdmin, sellerController.addProduct);
router.post('/spatial', ...sellerOrAdmin, sellerController.addSpatialAsset);

module.exports = router;