const prisma = require('../../config/prisma');

const getAllOrdersForAdmin = async () => {
  return await prisma.order.findMany({
    include: {
      shop: { select: { name: true } },
      user: { select: { email: true } },
      payment: true,
    },
    orderBy: { created_at: 'desc' },
  });
};

module.exports = { getAllOrdersForAdmin };