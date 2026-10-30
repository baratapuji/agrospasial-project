const prisma = require('../../config/prisma');

const getAllUsersForAdmin = async () => {
  return await prisma.user.findMany({
    include: { profile: true },
    orderBy: { created_at: 'desc' },
  });
};

const toggleUserStatus = async (adminId, userId, newStatus) => {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { status_akun: newStatus },
    });

    await tx.adminActivityLog.create({
      data: {
        admin_id: adminId,
        action: `UPDATE_USER_STATUS_${newStatus.toUpperCase()}`,
        target_id: userId,
      },
    });

    return user;
  });
};

module.exports = { getAllUsersForAdmin, toggleUserStatus };