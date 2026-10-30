const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/userController');
const { authenticateToken, authorizeRoles } = require('../../middlewares/authMiddleware');

router.get('/admin/all', authenticateToken, authorizeRoles('admin'), userController.getUsers);
router.patch('/admin/status/:id', authenticateToken, authorizeRoles('admin'), userController.updateStatus);

module.exports = router;