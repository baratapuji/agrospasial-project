const prisma = require('../../config/prisma');

// Ambil seluruh produk untuk dimoderasi oleh Admin
const getAllProductsForAdmin = async () => {
  return await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
      shop: { 
        include: { 
          owner: { select: { email: true, status_akun: true } } 
        } 
      },
    },
    orderBy: { created_at: 'desc' },
  });
};

// Ubah status aktif/non-aktif produk oleh Admin
const toggleProductStatus = async (adminId, productId, isActive) => {
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id: productId },
      data: { is_active: isActive },
    });

    // Catat ke Audit Log
    await tx.adminActivityLog.create({
      data: {
        admin_id: adminId,
        action: isActive ? 'ACTIVATE_PRODUCT' : 'DEACTIVATE_PRODUCT',
        target_id: productId,
      },
    });

    return product;
  });
};

module.exports = { getAllProductsForAdmin, toggleProductStatus };