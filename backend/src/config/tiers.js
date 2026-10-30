// Sumber kebenaran harga & komisi paket. Harga disamakan dengan kartu paket di frontend.
const TIERS = {
  GOLD: { price: 50000, commission: 0.03 },
  LUXURY: { price: 150000, commission: 0.015 },
};

module.exports = { TIERS };