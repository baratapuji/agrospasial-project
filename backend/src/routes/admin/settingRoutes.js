const express = require('express');
const router = express.Router();
const settingController = require('../../controllers/admin/settingController');
const { authenticateToken, authorizeRoles } = require('../../middlewares/authMiddleware');

router.get('/admin/all', authenticateToken, authorizeRoles('admin'), settingController.getSettings);
router.post('/admin/save', authenticateToken, authorizeRoles('admin'), settingController.updateSetting);

module.exports = router;