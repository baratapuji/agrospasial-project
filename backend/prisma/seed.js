const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai seeding database...');

  // 1. Buat Akun Super Admin
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash('admin123', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@agrospasial.com' },
    update: {},
    create: {
      email: 'admin@agrospasial.com',
      password_hash,
      role: 'admin',
      status_akun: 'active',
      profile: {
        create: {
          full_name: 'Super Admin AgroSpasial',
          phone: '081234567890',
        },
      },
    },
  });

  // 2. Buat Kategori Komoditas Awal
  const categories = [
    { name: 'Pangan & Beras', slug: 'pangan-beras' },
    { name: 'Sayuran Segar', slug: 'sayuran-segar' },
    { name: 'Buah-Buahan', slug: 'buah-buahan' },
    { name: 'Rempah & Bumbu', slug: 'rempah-bumbu' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 3. Buat Setting CMS Default
  await prisma.appSetting.upsert({
    where: { setting_key: 'agrospasial_description' },
    update: {},
    create: {
      setting_key: 'agrospasial_description',
      setting_value: 'AgroSpasial adalah platform WebGIS dan E-Commerce terintegrasi untuk pemetaan lahan pertanian serta transparansi distribusi komoditas pangan lokal.',
    },
  });

  console.log('✅ Seeding selesai! Akun Admin: admin@agrospasial.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });