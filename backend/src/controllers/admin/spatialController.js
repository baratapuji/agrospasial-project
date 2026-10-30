const spatialService = require('../../services/admin/spatialService');
const { successResponse } = require('../../utils/response');

const createAsset = async (req, res, next) => {
  try {
    const { shopId, assetType, geom, areaHectares } = req.body;
    const asset = await spatialService.saveSpatialAsset(shopId, assetType, geom, areaHectares);
    return successResponse(res, 'Aset spasial lahan berhasil disimpan.', asset, 201);
  } catch (error) {
    next(error);
  }
};

const getLayers = async (req, res, next) => {
  try {
    const layers = await spatialService.getAllMapLayers();
    return successResponse(res, 'Data layer WebGIS berhasil dimuat.', layers);
  } catch (error) {
    next(error);
  }
};

const getSpatialAssets = async (req, res, next) => {
  try {
    const assets = await spatialService.getAllSpatialAssets();
    return successResponse(res, 'Daftar aset spasial berhasil diambil.', assets);
  } catch (error) {
    next(error);
  }
};

const removeSpatialAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;

    await spatialService.deleteSpatialAsset(adminId, id);
    return successResponse(res, 'Aset spasial berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

const verifySpatialAsset = async (req, res, next) => {
  try {
    const { id } = req.params; // ID spatial asset
    const { isVerified } = req.body; // boolean (true/false)
    const adminId = req.user.userId;

    const result = await spatialService.updateSpatialVerification(adminId, id, isVerified);
    const message = isVerified ? 'Koordinat dan lahan berhasil divalidasi/disetujui.' : 'Validasi lahan ditolak.';
    
    return successResponse(res, message, result);
  } catch (error) {
    next(error);
  }
};

module.exports = { createAsset, getLayers, getSpatialAssets, removeSpatialAsset, verifySpatialAsset };