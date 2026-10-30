const prisma = require('../../config/prisma');

const getAdminStats = async () => {
  const [totalUsers, totalSellers, pendingSellers, totalShops] = await Promise.all([
    prisma.user.count({ where: { role: 'buyer' } }),
    prisma.user.count({ where: { role: 'seller', status_akun: 'active' } }),
    prisma.user.count({ where: { role: 'seller', status_akun: 'pending' } }),
    prisma.shop.count(),
  ]);

  return { totalUsers, totalSellers, pendingSellers, totalShops };
};

const getPendingSellers = async () => {
  return await prisma.user.findMany({
    where: { role: 'seller', status_akun: 'pending' },
    select: {
      id: true,
      email: true,
      status_akun: true,
      created_at: true,
      profile: true,
      shops: true,
    },
    orderBy: { created_at: 'desc' },
  });
};

const approveSeller = async (adminId, sellerId, isApproved) => {
  const status = isApproved ? 'active' : 'suspended';

  return await prisma.$transaction(async (tx) => {
    // 1. Update status akun seller
    const user = await tx.user.update({
      where: { id: sellerId },
      data: { status_akun: status },
    });

    // 2. Jika disetujui, aktifkan status verifikasi tokonya & buatkan toko default jika belum ada
    if (isApproved) {
      const existingShop = await tx.shop.findFirst({ where: { owner_id: sellerId } });
      if (!existingShop) {
        await tx.shop.create({
          data: {
            owner_id: sellerId,
            name: `Toko Tani ${user.email.split('@')[0]}`,
            description: 'Mitra Pertanian Terverifikasi AgroSpasial',
            is_verified: true,
          },
        });
      } else {
        await tx.shop.updateMany({
          where: { owner_id: sellerId },
          data: { is_verified: true },
        });
      }
    }

    // 3. Catat aktivitas di AdminActivityLog
    await tx.adminActivityLog.create({
      data: {
        admin_id: adminId,
        action: isApproved ? 'APPROVE_SELLER' : 'REJECT_SELLER',
        target_id: sellerId,
      },
    });

    return user;
  });
};

module.exports = { getAdminStats, getPendingSellers, approveSeller };