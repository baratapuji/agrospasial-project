const settingService = require('../../services/admin/settingService');
const { successResponse } = require('../../utils/response');

const getSettings = async (req, res, next) => {
  try {
    const settings = await settingService.getAllSettings();
    return successResponse(res, 'Pengaturan sistem berhasil diambil.', settings);
  } catch (error) {
    next(error);
  }
};

const updateSetting = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    const setting = await settingService.upsertSetting(key, value);
    return successResponse(res, 'Pengaturan berhasil diperbarui.', setting);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSetting };