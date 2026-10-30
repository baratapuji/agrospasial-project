import { ArrowLeft, Award, CreditCard, Loader2, RefreshCw } from 'lucide-react';
import type { Tier } from '@/services/onboarding';

const CARDS: Array<{ id: Tier; badge: string; name: string; price: string; per: string; perks: string; border: string; badgeCls: string; priceCls: string }> = [
  { id: 'SILVER', badge: 'SILVER', name: 'Free Starter', price: 'Rp 0', per: '/ selamanya', perks: 'Komisi 5% • 4 produk • Titik lokasi',
    border: 'border-emerald-600', badgeCls: 'bg-slate-200 text-slate-800 dark:bg-white/10 dark:text-slate-200', priceCls: 'text-emerald-700 dark:text-emerald-400' },
  { id: 'GOLD', badge: 'GOLD POPULER', name: 'Growth Farmer', price: 'Rp 50.000', per: '/ bulan', perks: 'Komisi 3% • 8 produk + 3 highlight • Titik lokasi',
    border: 'border-amber-500', badgeCls: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300', priceCls: 'text-amber-600 dark:text-amber-400' },
  { id: 'LUXURY', badge: 'LUXURY PRO', name: 'Eksklusif Pro', price: 'Rp 150.000', per: '/ bulan', perks: 'Komisi 1,5% • 12 produk + banner • Titik & poligon lahan',
    border: 'border-purple-500', badgeCls: 'bg-purple-100 text-purple-800 dark:bg-purple-400/15 dark:text-purple-300', priceCls: 'text-purple-700 dark:text-purple-300' },
];

interface Props {
  selected: Tier;
  onSelect: (t: Tier) => void;
  busy: boolean;
  verifying: boolean;
  pendingTier: Tier | null;
  onSubmit: () => void;
  onBack: () => void;
  onVerify: () => void;
}

export default function StepTier({ selected, onSelect, busy, verifying, pendingTier, onSubmit, onBack, onVerify }: Props) {
  return (
    <section className="rounded-3xl bg-surface p-6 ring-1 ring-line sm:p-8">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold text-fg">
        <Award className="size-5 text-kunyit-500" aria-hidden /> Pilih paket & badge kemitraan toko
      </h2>
      <p className="mb-6 mt-1 text-sm text-muted">Paket Gold dan Luxury dibayar lewat Midtrans (sandbox). Poligon lahan hanya untuk Luxury.</p>

      <div className="mb-8 grid gap-4 md:grid-cols-3" role="radiogroup" aria-label="Paket toko">
        {CARDS.map((c) => (
          <button key={c.id} type="button" role="radio" aria-checked={selected === c.id} onClick={() => onSelect(c.id)}
            className={`rounded-2xl border-2 p-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kunyit-500 ${selected === c.id ? `${c.border} bg-bg shadow-lg` : 'border-line hover:bg-bg'}`}>
            <span className={`mb-3 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${c.badgeCls}`}>{c.badge}</span>
            <p className="font-display text-lg font-bold text-fg">{c.name}</p>
            <p className={`my-2 font-display text-2xl font-extrabold ${c.priceCls}`}>{c.price} <span className="text-xs font-normal text-muted">{c.per}</span></p>
            <p className="text-xs leading-relaxed text-muted">{c.perks}</p>
          </button>
        ))}
      </div>

      {pendingTier && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-kunyit-400/15 p-4 text-sm text-fg ring-1 ring-kunyit-500/40">
          <span>Pembayaran paket <strong>{pendingTier}</strong> belum terkonfirmasi.</span>
          <button type="button" onClick={onVerify} disabled={verifying} className="inline-flex items-center gap-2 rounded-full bg-btn px-4 py-2 text-xs font-semibold text-btn-fg disabled:opacity-60">
            <RefreshCw className={`size-3.5 ${verifying ? 'animate-spin' : ''}`} aria-hidden /> Cek status pembayaran
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex w-1/3 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-fg ring-1 ring-line hover:bg-bg">
          <ArrowLeft className="size-4" aria-hidden /> Kembali
        </button>
        <button type="button" onClick={onSubmit} disabled={busy || verifying} className="flex w-2/3 items-center justify-center gap-2 rounded-xl bg-btn py-3.5 text-sm font-bold text-btn-fg transition hover:opacity-90 disabled:opacity-60">
          {busy || verifying ? <Loader2 className="size-5 animate-spin" aria-label="Memproses" /> : <><CreditCard className="size-4" aria-hidden /> {selected === 'SILVER' ? 'Lanjut tanpa bayar' : `Bayar & upgrade (${selected})`}</>}
        </button>
      </div>
    </section>
  );
}