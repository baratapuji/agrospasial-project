const midtransClient = require('midtrans-client');
const prisma = require('../../config/prisma');
const { TIERS } = require('../../config/tiers');

const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// Cadangan bila config/tiers.js tidak punya field "commission"
const COMMISSION_FALLBACK = { SILVER: 0.05, GOLD: 0.03, LUXURY: 0.015 };
const commissionOf = (tier) => TIERS[tier]?.commission ?? COMMISSION_FALLBACK[tier] ?? 0.05;

const isPaid = (tx, fraud) => tx === 'settlement' || (tx === 'capture' && (!fraud || fraud === 'accept'));
const isFailed = (tx) => ['cancel', 'deny', 'expire', 'failure'].includes(tx);

// Pembelian paket toko (order_id diawali "TIER-")
async function handleTier(n) {
  const purchase = await prisma.tierPurchase.findUnique({ where: { order_id: n.order_id } });
  if (!purchase) return console.warn(`[Webhook] TierPurchase ${n.order_id} tidak ditemukan`);

  if (isPaid(n.transaction_status, n.fraud_status) && purchase.status !== 'paid') {
    await prisma.$transaction([
      prisma.tierPurchase.update({ where: { id: purchase.id }, data: { status: 'paid' } }),
      prisma.shop.update({
        where: { id: purchase.shop_id },
        data: { tier: purchase.tier, commission_rate: commissionOf(purchase.tier) },
      }),
      // Dibeli saat onboarding: lanjutkan otomatis ke langkah 3
      prisma.shop.updateMany({ where: { id: purchase.shop_id, onboarding_step: 2 }, data: { onboarding_step: 3 } }),
    ]);
    console.log(`[Webhook] Toko ${purchase.shop_id} di-upgrade ke ${purchase.tier}`);
  } else if (isFailed(n.transaction_status) && purchase.status === 'pending') {
    await prisma.tierPurchase.update({ where: { id: purchase.id }, data: { status: 'failed' } });
  }
}

// Pesanan produk pembeli (Order.order_number)
async function handleShopOrder(n) {
  const order = await prisma.order.findUnique({ where: { order_number: n.order_id } });
  if (!order) return console.warn(`[Webhook] Order ${n.order_id} tidak ditemukan`);

  const next = isPaid(n.transaction_status, n.fraud_status) ? 'paid' : isFailed(n.transaction_status) ? 'canceled' : null;
  await prisma.$transaction([
    prisma.payment.upsert({
      where: { order_id: order.id },
      create: { order_id: order.id, midtrans_id: n.transaction_id, payment_method: n.payment_type, gross_amount: n.gross_amount, status: n.transaction_status, webhook_payload: n },
      update: { midtrans_id: n.transaction_id, payment_method: n.payment_type, status: n.transaction_status, webhook_payload: n },
    }),
    ...(next && order.status === 'pending' ? [prisma.order.update({ where: { id: order.id }, data: { status: next } })] : []),
  ]);
}

// Tanya status langsung ke Midtrans untuk pembelian tier yang masih pending (cadangan bila webhook terlambat)
async function syncTierPurchases(shopId) {
  const pending = await prisma.tierPurchase.findMany({
    where: { shop_id: shopId, status: 'pending' },
    orderBy: { created_at: 'desc' },
    take: 5,
  });
  for (const purchase of pending) {
    try {
      const n = await coreApi.transaction.status(purchase.order_id);
      await handleTier(n);
    } catch (err) {
      // 404 = transaksi belum ada di Midtrans (popup ditutup sebelum memilih metode bayar), wajar
      if (err.httpStatusCode !== 404) {
        console.warn('[Sync]', purchase.order_id, err.message);
      }
    }
  }
}

const handleMidtransNotification = async (body) => {
  // Midtrans memverifikasi notifikasi dengan mengambil status asli dari server mereka
  const n = await coreApi.transaction.notification(body);
  console.log(`[Webhook] ${n.order_id} -> ${n.transaction_status}`);

  if (n.order_id.startsWith('TIER-')) await handleTier(n);
  else await handleShopOrder(n);

  return { status: 'OK' };
};

module.exports = { handleMidtransNotification, syncTierPurchases };