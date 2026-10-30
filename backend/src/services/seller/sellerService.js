const prisma = require('../../config/prisma');

// Konfigurasi Batas Berdasarkan Tier Toko
const TIER_LIMITS = {
  SILVER: { maxProducts: 4, maxHighlights: 1 },
  GOLD: { maxProducts: 8, maxHighlights: 3 },
  LUXURY: { maxProducts: 12, maxHighlights: 6 },
};

const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });

// Ambil toko milik user TANPA cek onboarding (dipakai saat onboarding & simpan spasial)
const getShopByUserId = (userId) =>
  prisma.shop.findUnique({ where: { owner_id: userId } });

// Status ringkas untuk halaman onboarding (null jika toko belum dibuat)
const getOnboardingStatus = (userId) =>
  prisma.shop.findUnique({
    where: { owner_id: userId },
    select: { id: true, name: true, description: true, tier: true, onboarding_step: true },
  });

// Dashboard penuh: hanya untuk toko yang onboarding-nya sudah selesai
const getSellerShopByUserId = async (userId) => {
  const shop = await prisma.shop.findUnique({
    where: { owner_id: userId },
    include: {
      spatial_assets: true,
      products: {
        include: { category: true },
        orderBy: { id: 'desc' },
      },
    },
  });

  if (!shop) throw fail('Toko belum terdaftar.', 404);

  if (shop.onboarding_step < 4) {
    const error = fail('Anda harus menyelesaikan proses onboarding dan memilih paket tier terlebih dahulu.', 403);
    error.onboardingIncomplete = true;
    throw error;
  }

  return shop;
};

// Langkah 1: Simpan / Update Profil Toko
const createShopOnboarding = async (userId, data) => {
  const existingShop = await prisma.shop.findUnique({ where: { owner_id: userId } });

  if (existingShop) {
    return prisma.shop.update({
      where: { id: existingShop.id },
      data: {
        name: data.name,
        description: data.description,
        // jangan mundurkan langkah jika sudah lebih jauh
        onboarding_step: Math.max(existingShop.onboarding_step, 2),
      },
    });
  }

  return prisma.shop.create({
    data: {
      owner_id: userId,
      name: data.name,
      description: data.description,
      onboarding_step: 2,
      tier: 'SILVER',
      commission_rate: 0.05,
    },
  });
};

// Langkah 2 (gratis): hanya SILVER yang boleh dipilih tanpa bayar.
// Tier GOLD/LUXURY aktif otomatis lewat pembayaran Midtrans (webhook / tier sync).
const updateShopTier = async (userId, tierType) => {
  if (tierType !== 'SILVER') {
    throw fail('Paket berbayar hanya aktif setelah pembayaran berhasil.', 403);
  }

  const shop = await prisma.shop.findUnique({ where: { owner_id: userId } });
  if (!shop) throw fail('Toko belum terdaftar.', 404);
  if (shop.onboarding_step < 2) throw fail('Lengkapi profil toko terlebih dahulu.', 400);
  if (shop.tier !== 'SILVER') throw fail('Paket berbayar sudah aktif untuk toko ini.', 409);

  return prisma.shop.update({
    where: { id: shop.id },
    data: {
      tier: 'SILVER',
      commission_rate: 0.05,
      onboarding_step: Math.max(shop.onboarding_step, 3),
    },
  });
};

// Langkah 3: Selesaikan onboarding (menunggu verifikasi admin)
const completeOnboarding = async (userId) => {
  const shop = await prisma.shop.findUnique({ where: { owner_id: userId } });
  if (!shop) throw fail('Toko belum terdaftar.', 404);
  if (shop.onboarding_step >= 4) return shop; // sudah selesai
  if (shop.onboarding_step < 3) throw fail('Selesaikan langkah sebelumnya terlebih dahulu.', 403);

  const pointCount = await prisma.spatialAsset.count({
    where: { shop_id: shop.id, asset_type: 'POINT' },
  });
  if (pointCount === 0) throw fail('Tentukan titik lokasi toko terlebih dahulu.', 400);

  return prisma.shop.update({
    where: { id: shop.id },
    data: { onboarding_step: 4 },
  });
};

// Tambah Produk dengan Validasi Batas Tier & Highlight
const createProductWithTierCheck = async (shopId, data) => {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: { products: true },
  });

  if (!shop) throw fail('Toko tidak ditemukan.', 404);

  const limits = TIER_LIMITS[shop.tier] || TIER_LIMITS.SILVER;

  if (shop.products.length >= limits.maxProducts) {
    throw fail(`Batas maksimal produk untuk tier ${shop.tier} adalah ${limits.maxProducts} produk.`, 400);
  }

  if (data.isHighlight) {
    const currentHighlights = shop.products.filter((p) => p.is_highlight).length;
    if (currentHighlights >= limits.maxHighlights) {
      throw fail(`Batas maksimal produk highlight untuk tier ${shop.tier} adalah ${limits.maxHighlights} produk.`, 400);
    }
  }

  return prisma.product.create({
    data: {
      shop_id: shopId,
      category_id: data.categoryId,
      name: data.name,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now(),
      description: data.description,
      price: parseFloat(data.price),
      unit_type: data.unitType,
      weight_grams: parseInt(data.weightGrams || 1000),
      stock: parseInt(data.stock),
      is_active: true,
      is_highlight: data.isHighlight || false,
    },
  });
};

// Simpan Aset Spasial oleh Seller
// POINT hanya satu per toko: simpan ulang akan menggantikan titik lama (aman saat retry).
const saveSellerSpatialAsset = async (shopId, assetType, geom, areaHectares) => {
  if (!['POINT', 'POLYGON'].includes(assetType)) throw fail('Tipe aset spasial tidak valid.', 400);
  if (!geom || typeof geom !== 'object') throw fail('Data geometri tidak valid.', 400);

  const create = prisma.spatialAsset.create({
    data: {
      shop_id: shopId,
      asset_type: assetType,
      geom,
      area_hectares: areaHectares ? parseFloat(areaHectares) : null,
    },
  });

  if (assetType === 'POINT') {
    const [, asset] = await prisma.$transaction([
      prisma.spatialAsset.deleteMany({ where: { shop_id: shopId, asset_type: 'POINT' } }),
      create,
    ]);
    return asset;
  }

  return create;
};

module.exports = {
  getShopByUserId,
  getOnboardingStatus,
  getSellerShopByUserId,
  createShopOnboarding,
  updateShopTier,
  completeOnboarding,
  createProductWithTierCheck,
  saveSellerSpatialAsset,
};