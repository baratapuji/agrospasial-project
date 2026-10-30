import axios, { isAxiosError } from 'axios';

export type Tier = 'SILVER' | 'GOLD' | 'LUXURY';

export interface OnboardingShop {
  id: string;
  name: string;
  description: string | null;
  tier: Tier;
  onboarding_step: number; // 1 profil, 2 tier, 3 spasial, 4+ selesai
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
  timeout: 15000,
});

api.interceptors.request.use((cfg) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const isUnauthorized = (e: unknown) => isAxiosError(e) && e.response?.status === 401;
export function errorMessage(e: unknown, fallback: string): string {
  if (isAxiosError(e)) {
    const msg = e.response?.data?.message;
    if (msg) return msg;
    // Tanpa pesan dari server: tampilkan penyebabnya agar mudah dilacak
    return e.response ? `${fallback} (HTTP ${e.response.status})` : `${fallback} (server tidak terjangkau)`;
  }
  return e instanceof Error ? e.message : fallback;
}

/** Sumber kebenaran langkah onboarding: selalu dari server. */
export async function getStatus(): Promise<OnboardingShop | null> {
  const { data } = await api.get('/seller/onboarding/status');
  return (data.data?.shop ?? null) as OnboardingShop | null;
}

export const saveShop = (body: { name: string; description: string }) => api.post('/seller/onboarding/shop', body);
export const chooseSilver = (shopId: string) => api.patch('/seller/onboarding/tier', { shopId, tierType: 'SILVER' });

export async function createTierCharge(shopId: string, tierType: Tier): Promise<string> {
  const { data } = await api.post('/payments/create-tier-charge', { shopId, tierType });
  return data.data.snapToken as string;
}

/** Minta backend menanyakan status pembayaran langsung ke Midtrans (tidak bergantung webhook). */
export const syncTier = (shopId: string) => api.post('/payments/tier/sync', { shopId });

export const saveSpatial = (body: { assetType: 'POINT' | 'POLYGON'; geom: unknown; areaHectares?: number }) =>
  api.post('/seller/spatial', body);

export const finishOnboarding = (shopId: string) => api.post('/seller/onboarding/finish', { shopId });