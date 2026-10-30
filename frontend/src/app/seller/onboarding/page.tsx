'use client';

import Script from 'next/script';
import { Loader2, Sparkles } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import TopBar from '@/components/seller/onboarding/TopBar';
import Stepper from '@/components/seller/onboarding/Stepper';
import StepProfile from '@/components/seller/onboarding/StepProfile';
import StepTier from '@/components/seller/onboarding/StepTier';
import StepSpatial from '@/components/seller/onboarding/StepSpatial';

const SNAP_URL = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

const noticeStyle = {
  error: 'bg-red-500/10 text-red-600 ring-red-500/30 dark:text-red-400',
  info: 'bg-kunyit-400/15 text-fg ring-kunyit-500/40',
  success: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/30 dark:text-emerald-400',
} as const;

export default function SellerOnboardingPage() {
  const ob = useOnboarding();

  if (!ob.ready) {
    return (
      <main className="min-h-screen bg-bg px-4 py-6 sm:px-6 lg:px-8">
        <TopBar />
        <p className="mt-24 flex items-center justify-center gap-2 text-sm text-muted"><Loader2 className="size-4 animate-spin" aria-hidden /> Memuat data onboarding…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg px-4 py-6 sm:px-6 lg:px-8">
      <Script src={SNAP_URL} data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} strategy="afterInteractive" />

      <TopBar />

      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-kunyit-400/20 px-4 py-1.5 text-xs font-bold text-fg">
            <Sparkles className="size-4 text-kunyit-500" aria-hidden /> Onboarding mitra tani AgroSpasial
          </span>
          <h1 className="font-display text-3xl font-extrabold text-fg sm:text-4xl">Siapkan toko & lahan pertanian Anda</h1>
          <p className="mt-2 text-sm text-muted">Selesaikan 3 langkah singkat. Kemajuanmu tersimpan, aman jika halaman di-refresh.</p>
        </header>

        <Stepper step={ob.step} />

        {ob.notice && (
          <p role={ob.notice.type === 'error' ? 'alert' : 'status'} className={`mb-5 rounded-xl px-4 py-3 text-sm ring-1 ${noticeStyle[ob.notice.type]}`}>
            {ob.notice.text}
          </p>
        )}

        {ob.step === 1 && (
          <StepProfile initialName={ob.shop?.name ?? ''} initialDesc={ob.shop?.description ?? ''} busy={ob.busy} onSubmit={ob.submitProfile} />
        )}
        {ob.step === 2 && (
          <StepTier
            selected={ob.selectedTier} onSelect={ob.setSelectedTier} busy={ob.busy} verifying={ob.verifying}
            pendingTier={ob.pendingTier} onSubmit={ob.submitTier} onBack={ob.goBack} onVerify={ob.verifyPending}
          />
        )}
        {ob.step === 3 && ob.shop && (
          <StepSpatial tier={ob.shop.tier} shopName={ob.shop.name} draft={ob.draft} onChange={ob.setDraft} busy={ob.busy} onSubmit={ob.submitSpatial} />
        )}
      </div>
    </main>
  );
}