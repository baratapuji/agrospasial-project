const prisma = require('../../config/prisma');

// Simpan atau Perbarui Area Lahan Polygon/Point Toko
const saveSpatialAsset = async (shopId, assetType, geomJson, areaHectares) => {
  return await prisma.spatialAsset.create({
    data: {
      shop_id: shopId,
      asset_type: assetType, // 'POINT' atau 'POLYGON'
      geom: geomJson,        // Data GeoJSON dari Leaflet Draw
      area_hectares: areaHectares || null,
    },
  });
};

// Ambil seluruh layer peta untuk ditampilkan di WebGIS publik
const getAllMapLayers = async () => {
  return await prisma.spatialAsset.findMany({
    include: {
      shop: {
        select: {
          id: true,
          name: true,
          description: true,
          products: {
            where: { is_active: true },
            select: { id: true, name: true, price: true, unit_type: true },
          },
        },
      },
    },
  });
};

const getAllSpatialAssets = async () => {
  return await prisma.spatialAsset.findMany({
    include: {
      shop: {
        include: {
          owner: {
            select: { email: true, status_akun: true },
          },
        },
      },
    },
  });
};

const deleteSpatialAsset = async (adminId, assetId) => {
  return await prisma.$transaction(async (tx) => {
    const asset = await tx.spatialAsset.delete({
      where: { id: assetId },
    });

    // Catat ke Audit Trail Admin
    await tx.adminActivityLog.create({
      data: {
        admin_id: adminId,
        action: 'DELETE_SPATIAL_ASSET',
        target_id: assetId,
      },
    });

    return asset;
  });
};

// Memperbarui status verifikasi aset spasial atau toko oleh admin
const updateSpatialVerification = async (adminId, assetId, isVerified) => {
  return await prisma.$transaction(async (tx) => {
    // Cari aset spasial untuk mendapatkan shop_id terkait
    const asset = await tx.spatialAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) throw new Error('Aset spasial tidak ditemukan.');

    // Update status verifikasi toko yang memiliki aset tersebut
    const updatedShop = await tx.shop.update({
      where: { id: asset.shop_id },
      data: { is_verified: isVerified },
    });

    // Catat ke Audit Trail Admin
    await tx.adminActivityLog.create({
      data: {
        admin_id: adminId,
        action: isVerified ? 'VERIFY_SPATIAL_ASSET' : 'REJECT_SPATIAL_ASSET',
        target_id: assetId,
      },
    });

    return updatedShop;
  });
};

module.exports = { saveSpatialAsset, getAllMapLayers, getAllSpatialAssets, deleteSpatialAsset, updateSpatialVerification };