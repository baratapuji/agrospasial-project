const express = require('express');
const router = express.Router();
const spatialController = require('../../controllers/admin/spatialController');
const { authenticateToken, authorizeRoles } = require('../../middlewares/authMiddleware');

// 1. Endpoint Publik: Semua pengunjung bisa melihat peta WebGIS
router.get('/layers', spatialController.getLayers);

// 2. Endpoint Khusus Admin: Monitoring & Hapus Aset Spasial
router.get('/admin/all', authenticateToken, authorizeRoles('admin'), spatialController.getSpatialAssets);
router.delete('/admin/:id', authenticateToken, authorizeRoles('admin'), spatialController.removeSpatialAsset);

// 3. Endpoint Privat: Hanya Seller/Admin yang bisa menggambar/menambah lahan
router.post('/assets', authenticateToken, authorizeRoles('seller', 'admin'), spatialController.createAsset);
router.patch('/admin/verify/:id', authenticateToken, authorizeRoles('admin'), spatialController.verifySpatialAsset);

module.exports = router;