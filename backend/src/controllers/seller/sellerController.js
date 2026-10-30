const sellerService = require('../../services/seller/sellerService');
const { successResponse, errorResponse } = require('../../utils/response');

// Nama field di payload JWT bisa berbeda-beda; satu helper supaya konsisten
const getUserId = (req) => req.user?.userId ?? req.user?.id ?? req.user?.sub;

const getDashboard = async (req, res, next) => {
  try {
    const shop = await sellerService.getSellerShopByUserId(getUserId(req));
    return successResponse(res, 'Data dashboard seller berhasil diambil.', { shop });
  } catch (error) {
    next(error);
  }
};

// Status onboarding: shop = null jika toko belum dibuat
const getOnboardingStatus = async (req, res, next) => {
  try {
    const shop = await sellerService.getOnboardingStatus(getUserId(req));
    return successResponse(res, 'Status onboarding berhasil diambil.', { shop });
  } catch (error) {
    next(error);
  }
};

const registerShopOnboarding = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'Sesi tidak valid. Silakan login kembali.', 401);
    }

    const name = String(req.body?.name ?? '').trim();
    const description = String(req.body?.description ?? '').trim();
    if (!name || !description) {
      return errorResponse(res, 'Nama dan deskripsi toko wajib diisi.', 400);
    }

    const shop = await sellerService.createShopOnboarding(userId, { name, description });
    return successResponse(res, 'Profil toko berhasil disimpan, silakan pilih tier.', shop, 200);
  } catch (error) {
    next(error);
  }
};

// Pilih paket gratis (SILVER). Paket berbayar aktif lewat pembayaran Midtrans.
const updateTier = async (req, res, next) => {
  try {
    const { tierType } = req.body;
    const updatedShop = await sellerService.updateShopTier(getUserId(req), tierType);
    return successResponse(res, 'Tier toko berhasil diperbarui.', updatedShop);
  } catch (error) {
    next(error);
  }
};

const finishOnboarding = async (req, res, next) => {
  try {
    const updatedShop = await sellerService.completeOnboarding(getUserId(req));
    return successResponse(res, 'Onboarding selesai. Menunggu verifikasi admin.', updatedShop);
  } catch (error) {
    next(error);
  }
};

const addProduct = async (req, res, next) => {
  try {
    const shop = await sellerService.getSellerShopByUserId(getUserId(req));
    const product = await sellerService.createProductWithTierCheck(shop.id, req.body);
    return successResponse(res, 'Produk berhasil ditambahkan.', product, 201);
  } catch (error) {
    next(error);
  }
};

const addSpatialAsset = async (req, res, next) => {
  try {
    // Tanpa cek onboarding selesai, karena titik lokasi disimpan di langkah 3
    const shop = await sellerService.getShopByUserId(getUserId(req));

    if (!shop) return errorResponse(res, 'Anda belum memiliki toko terdaftar.', 404);
    if (shop.onboarding_step < 3) {
      return errorResponse(res, 'Pilih paket toko terlebih dahulu sebelum menyimpan lokasi.', 403);
    }

    const { assetType, geom, areaHectares } = req.body;
    const asset = await sellerService.saveSellerSpatialAsset(shop.id, assetType, geom, areaHectares);
    return successResponse(res, 'Aset spasial berhasil disimpan ke peta.', asset, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getOnboardingStatus,
  registerShopOnboarding,
  updateTier,
  finishOnboarding,
  addProduct,
  addSpatialAsset,
};