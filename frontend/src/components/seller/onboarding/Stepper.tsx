import { Check } from 'lucide-react';

const LABELS = ['Profil Toko', 'Pilih Tier & Bayar', 'Lokasi Spasial'];

export default function Stepper({ step }: { step: number }) {
  return (
    <ol className="mb-8 flex items-center rounded-2xl bg-surface p-4 ring-1 ring-line" aria-label="Langkah onboarding">
      {LABELS.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none" aria-current={active ? 'step' : undefined}>
            <span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold transition ${done || active ? 'bg-btn text-btn-fg' : 'bg-line text-muted'}`}>
              {done ? <Check className="size-4" aria-hidden /> : n}
            </span>
            <span className={`ml-2 hidden text-sm font-semibold sm:inline ${active || done ? 'text-fg' : 'text-muted'}`}>{label}</span>
            {n < LABELS.length && <span className={`mx-3 h-0.5 flex-1 rounded transition ${done ? 'bg-kunyit-500' : 'bg-line'}`} />}
          </li>
        );
      })}
    </ol>
  );
}