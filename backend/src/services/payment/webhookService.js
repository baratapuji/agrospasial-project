const midtransClient = require('midtrans-client');
const prisma = require('../../config/prisma');
const { TIERS } = require('../../config/tiers');

const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

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
        data: { tier: purchase.tier, commission_rate: TIERS[purchase.tier].commission },
      }),
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

const handleMidtransNotification = async (body) => {
  // Midtrans memverifikasi notifikasi dengan mengambil status asli dari server mereka
  const n = await coreApi.transaction.notification(body);
  console.log(`[Webhook] ${n.order_id} -> ${n.transaction_status}`);

  if (n.order_id.startsWith('TIER-')) await handleTier(n);
  else await handleShopOrder(n);

  return { status: 'OK' };
};

module.exports = { handleMidtransNotification };