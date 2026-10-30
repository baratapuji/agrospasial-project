'use client';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Layers, MapPin, RefreshCw } from 'lucide-react';
import { useLayers } from '@/hooks/useLayers';
import CountUp from '@/components/common/CountUp';
import Reveal from '@/components/common/Reveal';

const AgroMap = dynamic(() => import('@/components/map/AgroMap'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full animate-pulse place-items-center bg-padi-900 text-padi-100/60">
      <span className="flex items-center gap-2 text-sm"><MapPin className="size-4" /> Memuat peta…</span>
    </div>
  ),
});

export default function MapExplorer() {
  const { layers, status, reload } = useLayers();
  const [active, setActive] = useState('Semua');

  const commodities = useMemo(() => {
    const set = new Set<string>();
    layers.forEach((l) => typeof l.commodity === 'string' && set.add(l.commodity));
    return ['Semua', ...set];
  }, [layers]);

  const visible = useMemo(() => (active === 'Semua' ? layers : layers.filter((l) => l.commodity === active)), [layers, active]);

  return (
    <section id="peta" className="mx-auto max-w-7xl scroll-mt-20 px-3 py-14 md:px-8">
      <Reveal from="scale">
        <div className="relative isolate h-[72vh] min-h-[500px] overflow-hidden rounded-[1.75rem] bg-padi-900 shadow-[0_40px_80px_-40px_rgba(0,0,0,.6)] ring-1 ring-line">
          {status === 'error' ? (
            <div className="grid h-full place-items-center p-6 text-center text-padi-100">
              <div>
                <p className="font-display text-xl font-bold">Peta belum bisa dimuat</p>
                <p className="mt-1 text-sm text-padi-100/70">Pastikan server backend berjalan di port 5000, lalu coba lagi.</p>
                <button onClick={reload} className="mt-4 inline-flex items-center gap-2 rounded-full bg-kunyit-400 px-5 py-2.5 text-sm font-semibold text-padi-950">
                  <RefreshCw className="size-4" aria-hidden /> Muat ulang
                </button>
              </div>
            </div>
          ) : (
            <AgroMap layers={visible} />
          )}

          {status !== 'error' && (
            <div className="absolute left-3 top-3 z-[1000] max-w-[calc(100%-1.5rem)] rounded-2xl bg-padi-950/85 p-4 text-padi-50 shadow-xl ring-1 ring-white/10 backdrop-blur-md md:left-5 md:top-5 md:w-72">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-semibold"><Layers className="size-4 text-kunyit-400" aria-hidden /> Sebaran lahan & toko</p>
                <p className="text-sm text-padi-100/70" aria-live="polite">{status === 'loading' ? '…' : <><CountUp to={visible.length} /> titik</>}</p>
              </div>
              {commodities.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter komoditas">
                  {commodities.map((c) => (
                    <button key={c} onClick={() => setActive(c)} aria-pressed={active === c}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-kunyit-400 ${active === c ? 'bg-kunyit-400 text-padi-950' : 'bg-white/10 text-padi-100 hover:bg-white/20'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs text-padi-100/60">
                {status === 'ready' && layers.length === 0 ? 'Belum ada lahan dari mitra terverifikasi untuk ditampilkan.' : 'Klik marker atau poligon untuk melihat produk.'}
              </p>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}