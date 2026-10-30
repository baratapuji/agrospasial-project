'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasPolygon, polygonAreaHectares, toPointGeom, toPolygonGeom, type SpatialDraft } from '@/lib/geo';
import * as api from '@/services/onboarding';
import type { OnboardingShop, Tier } from '@/services/onboarding';

declare global {
  interface Window { snap?: { pay: (token: string, options: Record<string, unknown>) => void } }
}

export type Notice = { type: 'error' | 'info' | 'success'; text: string } | null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const draftKey = (shopId: string) => `agro:onboarding:draft:${shopId}`;
const PENDING_KEY = 'agro:onboarding:pending';

function readJSON<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : null; } catch { return null; }
}
function writeJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* penyimpanan penuh/diblokir */ }
}

export function useOnboarding() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [shop, setShop] = useState<OnboardingShop | null>(null);
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<Tier>('SILVER');
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pendingTier, setPendingTier] = useState<Tier | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [draft, setDraft] = useState<SpatialDraft>({ point: null, polygon: null });
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Terapkan data dari server -> langkah yang tampil
  const applyShop = useCallback((s: OnboardingShop | null) => {
    setShop(s);
    if (!s) { setStep(1); return; }
    if (s.onboarding_step > 3) { router.replace('/seller/dashboard'); return; }
    setStep(Math.min(Math.max(s.onboarding_step, 1), 3));
    setSelectedTier(s.tier);
  }, [router]);

  // Tanyakan status pembayaran sampai tier berubah (webhook bisa terlambat)
  const verifyPayment = useCallback(async (shopId: string, tier: Tier, attempts = 10) => {
    setVerifying(true);
    setNotice({ type: 'info', text: 'Memverifikasi pembayaran…' });
    for (let i = 0; i < attempts; i++) {
      try { await api.syncTier(shopId); } catch { /* transaksi belum tercatat di Midtrans */ }
      const s = await api.getStatus().catch(() => null);
      if (s && s.tier === tier) {
        try { localStorage.removeItem(PENDING_KEY); } catch { /* abaikan */ }
        setPendingTier(null);
        applyShop({ ...s, onboarding_step: Math.max(s.onboarding_step, 3) });
        setNotice({ type: 'success', text: `Paket ${tier} aktif. Lanjutkan menentukan lokasi.` });
        setVerifying(false);
        return true;
      }
      await sleep(1500);
    }
    setVerifying(false);
    setNotice({ type: 'info', text: 'Pembayaran belum terkonfirmasi. Jika sudah membayar, tekan "Cek status pembayaran" sebentar lagi.' });
    return false;
  }, [applyShop]);

  // Muat status saat halaman dibuka / di-refresh
  useEffect(() => {
    if (!localStorage.getItem('token')) { router.replace('/login'); return; }
    (async () => {
      try {
        const s = await api.getStatus();
        applyShop(s);
        const pending = readJSON<{ shopId: string; tier: Tier }>(PENDING_KEY);
        if (s && pending?.shopId === s.id && s.onboarding_step <= 2 && s.tier !== pending.tier) {
          setPendingTier(pending.tier);
          void verifyPayment(s.id, pending.tier, 4);
        }
      } catch (e) {
        if (api.isUnauthorized(e)) router.replace('/login');
        else setNotice({ type: 'error', text: api.errorMessage(e, 'Gagal memuat data onboarding.') });
      } finally {
        setReady(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draf lokasi (titik/poligon) tersimpan agar tidak hilang saat refresh
  useEffect(() => {
    if (!shop?.id) return;
    const saved = readJSON<SpatialDraft>(draftKey(shop.id));
    if (saved) setDraft(saved);
    setDraftLoaded(true);
  }, [shop?.id]);

  useEffect(() => {
    if (shop?.id && draftLoaded) writeJSON(draftKey(shop.id), draft);
  }, [draft, draftLoaded, shop?.id]);

  const run = async (fn: () => Promise<void>, fallback: string) => {
    setBusy(true);
    setNotice(null);
    try { await fn(); } catch (e) { setNotice({ type: 'error', text: api.errorMessage(e, fallback) }); } finally { setBusy(false); }
  };

  const submitProfile = (name: string, description: string) =>
    run(async () => {
      await api.saveShop({ name, description });
      const s = await api.getStatus();
      applyShop(s ? { ...s, onboarding_step: Math.max(s.onboarding_step, 2) } : s);
    }, 'Gagal menyimpan profil toko.');

  const submitTier = () =>
    run(async () => {
      if (!shop) return;
      if (selectedTier === 'SILVER') {
        await api.chooseSilver(shop.id);
        const s = await api.getStatus();
        applyShop(s ? { ...s, onboarding_step: Math.max(s.onboarding_step, 3) } : s);
        return;
      }
      const tier = selectedTier;
      const snapToken = await api.createTierCharge(shop.id, tier);
      if (!window.snap) throw new Error('Midtrans belum siap. Muat ulang halaman lalu coba lagi.');
      setPendingTier(tier);
      writeJSON(PENDING_KEY, { shopId: shop.id, tier });
      window.snap.pay(snapToken, {
        onSuccess: () => void verifyPayment(shop.id, tier),
        onPending: () => void verifyPayment(shop.id, tier),
        onError: () => setNotice({ type: 'error', text: 'Pembayaran gagal. Silakan coba lagi.' }),
        onClose: () => setNotice({ type: 'info', text: 'Popup ditutup. Jika sudah membayar, tekan "Cek status pembayaran".' }),
      });
    }, 'Gagal memproses pilihan paket.');

  const submitSpatial = () =>
    run(async () => {
      if (!shop) return;
      if (!draft.point) throw new Error('Tentukan titik toko terlebih dahulu.');
      await api.saveSpatial({ assetType: 'POINT', geom: toPointGeom(draft.point) });
      if (shop.tier === 'LUXURY' && hasPolygon(draft) && draft.polygon) {
        await api.saveSpatial({
          assetType: 'POLYGON',
          geom: toPolygonGeom(draft.polygon),
          areaHectares: Number(polygonAreaHectares(draft.polygon).toFixed(4)),
        });
      }
      await api.finishOnboarding(shop.id);
      try { localStorage.removeItem(draftKey(shop.id)); } catch { /* abaikan */ }
      router.replace('/seller/dashboard');
    }, 'Gagal menyelesaikan proses onboarding.');

  return {
    ready, shop, step, selectedTier, setSelectedTier, busy, verifying, notice, pendingTier, draft, setDraft,
    submitProfile, submitTier, submitSpatial,
    goBack: () => setStep(1),
    verifyPending: () => { if (shop && pendingTier) void verifyPayment(shop.id, pendingTier); },
  };
}