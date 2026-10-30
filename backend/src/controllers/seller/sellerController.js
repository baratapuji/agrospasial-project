const sellerService = require('../../services/seller/sellerService');
const { successResponse, errorResponse } = require('../../utils/response');

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const shop = await sellerService.getSellerShopByUserId(userId);
    return successResponse(res, 'Data dashboard seller berhasil diambil.', { shop });
  } catch (error) {
    next(error);
  }
};

const registerShopOnboarding = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return errorResponse(res, 'Sesi tidak valid. Silakan login kembali.', 401);
    }

    const shop = await sellerService.createShopOnboarding(userId, req.body);
    return successResponse(res, 'Profil toko berhasil disimpan, silakan pilih tier.', shop, 200);
  } catch (error) {
    console.error('Error Onboarding Step 1:', error);
    next(error);
  }
};

const updateTier = async (req, res, next) => {
  try {
    const { shopId, tierType } = req.body;
    const updatedShop = await sellerService.updateShopTier(shopId, tierType);
    return successResponse(res, 'Tier toko berhasil diperbarui.', updatedShop);
  } catch (error) {
    next(error);
  }
};

const finishOnboarding = async (req, res, next) => {
  try {
    const { shopId } = req.body;
    const updatedShop = await sellerService.completeOnboarding(shopId);
    return successResponse(res, 'Onboarding selesai. Menunggu verifikasi admin.', updatedShop);
  } catch (error) {
    next(error);
  }
};

const addProduct = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const shop = await sellerService.getSellerShopByUserId(userId);
    
    if (!shop) return errorResponse(res, 'Anda belum memiliki toko terdaftar.', 400);

    const product = await sellerService.createProductWithTierCheck(shop.id, req.body);
    return successResponse(res, 'Produk berhasil ditambahkan.', product, 201);
  } catch (error) {
    next(error);
  }
};

const addSpatialAsset = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const shop = await sellerService.getSellerShopByUserId(userId);

    if (!shop) return errorResponse(res, 'Anda belum memiliki toko terdaftar.', 400);

    const { assetType, geom, areaHectares } = req.body;
    const asset = await sellerService.saveSellerSpatialAsset(shop.id, assetType, geom, areaHectares);
    return successResponse(res, 'Aset spasial berhasil disimpan ke peta.', asset, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  registerShopOnboarding,
  updateTier,
  finishOnboarding,
  addProduct,
  addSpatialAsset,
};