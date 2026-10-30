const prisma = require('../../config/prisma');

const getAllAuditLogs = async () => {
  return await prisma.adminActivityLog.findMany({
    include: {
      admin: {
        select: { email: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};

module.exports = { getAllAuditLogs };