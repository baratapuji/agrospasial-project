const prisma = require('../../config/prisma');

const getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
};

const createCategory = async (adminId, name, slug) => {
  return await prisma.$transaction(async (tx) => {
    const category = await tx.category.create({
      data: { name, slug },
    });

    // Catat ke Audit Log
    await tx.adminActivityLog.create({
      data: {
        admin_id: adminId,
        action: 'CREATE_CATEGORY',
        target_id: category.id,
      },
    });

    return category;
  });
};

const deleteCategory = async (adminId, categoryId) => {
  return await prisma.$transaction(async (tx) => {
    const category = await tx.category.delete({
      where: { id: categoryId },
    });

    // Catat ke Audit Log
    await tx.adminActivityLog.create({
      data: {
        admin_id: adminId,
        action: 'DELETE_CATEGORY',
        target_id: categoryId,
      },
    });

    return category;
  });
};

module.exports = { getAllCategories, createCategory, deleteCategory };