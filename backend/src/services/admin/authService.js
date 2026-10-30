const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (payload) => {
  const { email, password, full_name, phone, role } = payload;

  // 1. Cek ketersediaan email
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('Email sudah terdaftar!');
    error.statusCode = 400;
    throw error;
  }

  // 2. Hash Password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // 3. Tentukan status_akun
  const initialStatus = role === 'seller' ? 'pending' : 'active';

  // 4. Transaction Prisma (Buat User, UserProfile, & Shop jika Seller)
  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password_hash,
        role: role || 'buyer',
        status_akun: initialStatus,
      },
    });

    await tx.userProfile.create({
      data: {
        user_id: user.id,
        full_name,
        phone,
      },
    });

    // Jika mendaftar sebagai seller, otomatis buat record Shop awal untuk Onboarding
    if (role === 'seller') {
      await tx.shop.create({
        data: {
          owner_id: user.id,
          name: `${full_name}'s Farm`, // Nama default awal, bisa diubah saat onboarding
          description: 'Toko pertanian baru di AgroSpasial',
          onboarding_step: 1,
          tier: 'SILVER',
          commission_rate: 0.05,
        },
      });
    }

    return user;
  });

  return newUser;
};

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { 
      profile: true, 
      shops: true // Pastikan 'shops' (plural) sesuai relasi schema.prisma
    },
  });

  if (!user) {
    const error = new Error('Email atau password salah.');
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Email atau password salah.');
    error.statusCode = 400;
    throw error;
  }

  if (user.status_akun === 'suspended') {
    const error = new Error('Akun Anda telah ditangguhkan.');
    error.statusCode = 403;
    throw error;
  }

  // Ambil toko pertama milik seller (jika ada)
  const userShop = user.shops && user.shops.length > 0 ? user.shops[0] : null;

  // Generate Token JWT
  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile?.full_name,
      // Kirim status onboarding step toko ke frontend
      onboarding_step: userShop ? userShop.onboarding_step : 4, 
    },
  };
};

module.exports = { registerUser, loginUser };