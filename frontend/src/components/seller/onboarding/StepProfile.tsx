'use client';
import { useState } from 'react';
import { ArrowRight, Building2, Loader2 } from 'lucide-react';

const field = 'w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-fg placeholder:text-muted/70 focus:outline-2 focus:outline-kunyit-500';

interface Props {
  initialName: string;
  initialDesc: string;
  busy: boolean;
  onSubmit: (name: string, description: string) => void;
}

export default function StepProfile({ initialName, initialDesc, busy, onSubmit }: Props) {
  const [name, setName] = useState(initialName);
  const [desc, setDesc] = useState(initialDesc);

  return (
    <section className="rounded-3xl bg-surface p-6 ring-1 ring-line sm:p-8">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold text-fg">
        <Building2 className="size-5 text-kunyit-500" aria-hidden /> Informasi dasar toko / kelompok tani
      </h2>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(name.trim(), desc.trim()); }} className="mt-5 space-y-5">
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted">Nama toko
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Kelompok Tani Makmur" className={`${field} mt-1 normal-case`} />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted">Deskripsi
          <textarea required rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Komoditas utama…" className={`${field} mt-1 normal-case`} />
        </label>
        <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-btn py-3.5 text-sm font-bold text-btn-fg transition hover:opacity-90 disabled:opacity-60">
          {busy ? <Loader2 className="size-5 animate-spin" aria-label="Menyimpan" /> : <>Lanjut ke pemilihan tier <ArrowRight className="size-4" aria-hidden /></>}
        </button>
      </form>
    </section>
  );
}