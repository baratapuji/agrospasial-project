const prisma = require('../../config/prisma');

// Ambil daftar toko yang belum diverifikasi
const getPendingShops = async () => {
  return await prisma.shop.findMany({
    where: { is_verified: false },
    include: {
      owner: { select: { email: true, status_akun: true, created_at: true } },
      spatial_assets: true,
    },
    orderBy: { created_at: 'desc' },
  });
};

// Setujui atau Tolak Toko Mitra
const verifyShop = async (adminId, shopId, isVerified) => {
  return await prisma.$transaction(async (tx) => {
    const shop = await tx.shop.update({
      where: { id: shopId },
      data: { is_verified: isVerified },
    });

    // Catat ke Audit Trail Admin
    await tx.adminActivityLog.create({
      data: {
        admin_id: adminId,
        action: isVerified ? 'VERIFY_SHOP' : 'REJECT_SHOP',
        target_id: shopId,
      },
    });

    return shop;
  });
};

module.exports = { getPendingShops, verifyShop };