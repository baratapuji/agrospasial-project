const productService = require('../../services/admin/productService');
const { successResponse } = require('../../utils/response');

const getAdminProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProductsForAdmin();
    return successResponse(res, 'Daftar produk moderasi berhasil diambil.', products);
  } catch (error) {
    next(error);
  }
};

const updateProductStatus = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { isActive } = req.body; // boolean
    const adminId = req.user.userId;

    const updated = await productService.toggleProductStatus(adminId, productId, isActive);
    const message = isActive ? 'Produk berhasil diaktifkan/ditampilkan.' : 'Produk berhasil dinonaktifkan.';
    
    return successResponse(res, message, updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAdminProducts, updateProductStatus };