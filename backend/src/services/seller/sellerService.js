const prisma = require('../../config/prisma');

// Konfigurasi Batas Berdasarkan Tier Toko
const TIER_LIMITS = {
  SILVER: { maxProducts: 4, maxHighlights: 1 },
  GOLD: { maxProducts: 8, maxHighlights: 3 },
  LUXURY: { maxProducts: 12, maxHighlights: 6 },
};

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

  if (!shop) {
    throw new Error('Toko belum terdaftar.');
  }

  // Jika onboarding belum selesai (kurang dari step 4), lempar error / status khusus
  if (shop.onboarding_step < 4) {
    const error = new Error('Anda harus menyelesaikan proses onboarding dan memilih paket tier terlebih dahulu.');
    error.statusCode = 403;
    error.onboardingIncomplete = true;
    throw error;
  }

  return shop;
};

// Langkah 1: Simpan / Update Profil Toko Saat Onboarding Awal
const createShopOnboarding = async (userId, data) => {
  // Cek apakah toko sudah dibuat sebelumnya saat register
  const existingShop = await prisma.shop.findUnique({
    where: { owner_id: userId },
  });

  if (existingShop) {
    // Jika toko sudah ada, lakukan update nama & deskripsi
    return await prisma.shop.update({
      where: { owner_id: userId },
      data: {
        name: data.name,
        description: data.description,
        onboarding_step: 2, // Lanjut ke tahap pilih tier
      },
    });
  }

  // Jika belum ada, buat record shop baru
  return await prisma.shop.create({
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

// Langkah 2: Update Tier Toko (Silver / Gold / Luxury)
const updateShopTier = async (shopId, tierType) => {
  let fee = 0.05;
  if (tierType === 'GOLD') fee = 0.03;
  if (tierType === 'LUXURY') fee = 0.015;

  return await prisma.shop.update({
    where: { id: shopId },
    data: {
      tier: tierType,
      commission_rate: fee,
      onboarding_step: 3, // Lanjut ke tahap gambar peta spasial
    },
  });
};

// Langkah 3: Selesaikan Onboarding Peta Spasial
const completeOnboarding = async (shopId) => {
  return await prisma.shop.update({
    where: { id: shopId },
    data: {
      onboarding_step: 4, // Selesai / Menunggu Verifikasi Admin
    },
  });
};

// Tambah Produk dengan Validasi Batas Tier & Highlight
const createProductWithTierCheck = async (shopId, data) => {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: { products: true },
  });

  if (!shop) throw new Error('Toko tidak ditemukan.');

  const limits = TIER_LIMITS[shop.tier] || TIER_LIMITS.SILVER;

  // Cek batas jumlah produk
  if (shop.products.length >= limits.maxProducts) {
    throw new Error(`Batas maksimal produk untuk tier ${shop.tier} adalah ${limits.maxProducts} produk.`);
  }

  // Cek batas produk highlight
  if (data.isHighlight) {
    const currentHighlights = shop.products.filter(p => p.is_highlight).length;
    if (currentHighlights >= limits.maxHighlights) {
      throw new Error(`Batas maksimal produk highlight untuk tier ${shop.tier} adalah ${limits.maxHighlights} produk.`);
    }
  }

  return await prisma.product.create({
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
const saveSellerSpatialAsset = async (shopId, assetType, geom, areaHectares) => {
  return await prisma.spatialAsset.create({
    data: {
      shop_id: shopId,
      asset_type: assetType, // 'POINT' atau 'POLYGON'
      geom: geom,
      area_hectares: areaHectares ? parseFloat(areaHectares) : null,
    },
  });
};

module.exports = {
  getSellerShopByUserId,
  createShopOnboarding,
  updateShopTier,
  completeOnboarding,
  createProductWithTierCheck,
  saveSellerSpatialAsset,
};