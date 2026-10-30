const prisma = require('../../config/prisma');

const getAllSettings = async () => {
  return await prisma.appSetting.findMany();
};

const upsertSetting = async (key, value) => {
  return await prisma.appSetting.upsert({
    where: { setting_key: key },
    update: { setting_value: value },
    create: { setting_key: key, setting_value: value },
  });
};

module.exports = { getAllSettings, upsertSetting };