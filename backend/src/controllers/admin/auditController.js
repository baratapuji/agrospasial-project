const auditService = require('../../services/admin/auditService');
const { successResponse } = require('../../utils/response');

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await auditService.getAllAuditLogs();
    return successResponse(res, 'Log audit berhasil diambil.', logs);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs };