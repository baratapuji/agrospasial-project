const express = require('express');
const router = express.Router();
const auditController = require('../../controllers/admin/auditController');
const { authenticateToken, authorizeRoles } = require('../../middlewares/authMiddleware');

router.get('/admin/logs', authenticateToken, authorizeRoles('admin'), auditController.getAuditLogs);

module.exports = router;