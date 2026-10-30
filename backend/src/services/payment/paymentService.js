const crypto = require('crypto');
const midtransClient = require('midtrans-client');
const prisma = require('../../config/prisma');
const { TIERS } = require('../../config/tiers');

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// Dev: arahkan notifikasi ke URL tunnel Cloudflare tanpa mengubah dashboard (butuh midtrans-client >= 1.2.1)
if (process.env.MIDTRANS_NOTIFICATION_URL) {
  snap.httpClient.http_client.defaults.headers.common['X-Override-Notification'] = process.env.MIDTRANS_NOTIFICATION_URL;
}

const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });

const createTierTransaction = async (shopId, tierType, user) => {
  // 1. Harga ditentukan server, bukan dari body request
  const tierKey = String(tierType).toUpperCase();
  const tier = TIERS[tierKey];
  if (!tier) throw fail('Paket tidak dikenal.', 400);

  // 2. Pastikan toko ada dan milik user (admin boleh semua)
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) throw fail('Toko tidak ditemukan.', 404);
  const userId = user.id ?? user.userId ?? user.sub; // nama field tergantung isi payload JWT
  if (user.role !== 'admin' && shop.owner_id !== userId) {
    console.warn('[Tier] Ditolak:', { userId, owner_id: shop.owner_id, shopId, userKeys: Object.keys(user) });
    throw fail('Bukan toko milikmu.', 403);
  }

  // 3. order_id hanya pengenal unik (maks 50 karakter); data lengkap disimpan di database
  const orderId = `TIER-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  let transaction;
  try {
    transaction = await snap.createTransaction({
      transaction_details: { order_id: orderId, gross_amount: tier.price },
      customer_details: { first_name: user.name || 'Mitra Tani', email: user.email },
      item_details: [{ id: `tier-${tierKey.toLowerCase()}`, price: tier.price, quantity: 1, name: `Upgrade Paket Toko ${tierKey}` }],
    });
  } catch (error) {
    console.error('Midtrans Error:', error.message);
    throw fail('Gagal membuat transaksi pembayaran Midtrans.', 502);
  }

  await prisma.tierPurchase.create({
    data: { order_id: orderId, shop_id: shopId, user_id: userId, tier: tierKey, amount: tier.price, snap_token: transaction.token },
  });

  return { orderId, snapToken: transaction.token, redirectUrl: transaction.redirect_url };
};

module.exports = { createTierTransaction };