const categoryService = require('../../services/admin/categoryService');
const { successResponse } = require('../../utils/response');

const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    return successResponse(res, 'Daftar kategori berhasil diambil.', categories);
  } catch (error) {
    next(error);
  }
};

const addCategory = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    const adminId = req.user.userId;

    const newCategory = await categoryService.createCategory(adminId, name, slug);
    return successResponse(res, 'Kategori komoditas berhasil ditambahkan.', newCategory, 201);
  } catch (error) {
    next(error);
  }
};

const removeCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;

    await categoryService.deleteCategory(adminId, id);
    return successResponse(res, 'Kategori berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, addCategory, removeCategory };