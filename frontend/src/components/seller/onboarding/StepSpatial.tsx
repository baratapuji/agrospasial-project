import { Loader2, MapPin, ShieldCheck } from 'lucide-react';
import SpatialPicker from '@/components/spatial/SpatialPicker';
import type { SpatialDraft } from '@/lib/geo';
import type { Tier } from '@/services/onboarding';

interface Props {
  tier: Tier;
  shopName: string;
  draft: SpatialDraft;
  onChange: (d: SpatialDraft) => void;
  busy: boolean;
  onSubmit: () => void;
}

export default function StepSpatial({ tier, shopName, draft, onChange, busy, onSubmit }: Props) {
  return (
    <section className="rounded-3xl bg-surface p-6 ring-1 ring-line sm:p-8">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold text-fg">
        <MapPin className="size-5 text-kunyit-500" aria-hidden /> Tentukan lokasi toko{tier === 'LUXURY' ? ' & batas lahan' : ''}
      </h2>
      <p className="mb-5 mt-1 text-sm text-muted">Pilihanmu tersimpan otomatis di perangkat ini sampai onboarding selesai.</p>

      <SpatialPicker tier={tier} value={draft} onChange={onChange} shopName={shopName} />

      <button type="button" onClick={onSubmit} disabled={busy || !draft.point} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-btn py-3.5 text-sm font-bold text-btn-fg transition hover:opacity-90 disabled:opacity-50">
        {busy ? <Loader2 className="size-5 animate-spin" aria-label="Menyimpan" /> : <>Selesaikan onboarding <ShieldCheck className="size-4" aria-hidden /></>}
      </button>
    </section>
  );
}