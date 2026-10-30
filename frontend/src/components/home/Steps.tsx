'use client';
import { useEffect, useRef } from 'react';
import Reveal from '@/components/common/Reveal';

const steps = [
  { title: 'Pilih komoditas', text: 'Saring peta berdasarkan padi, kopi, sawit, atau komoditas lain yang kamu cari.' },
  { title: 'Cek lahan dan toko', text: 'Buka poligon lahan untuk melihat luas garapan, nama toko, dan produk yang tersedia.' },
  { title: 'Pesan dan bayar', text: 'Masukkan ke keranjang, bayar lewat Midtrans, lalu pantau status pesanan sampai tiba.' },
];

export default function Steps() {
  const ref = useRef<HTMLOListElement>(null);

  // Garis penuntun terisi mengikuti scroll
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = (window.innerHeight * 0.65 - r.top) / r.height;
      el.style.setProperty('--fill', String(Math.max(0, Math.min(1, p))));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section id="cara-kerja" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-20 md:py-28">
      <Reveal><h2 className="font-display text-3xl font-bold leading-tight text-fg md:text-4xl">Dari peta sampai ke pintu rumah dalam tiga langkah.</h2></Reveal>
      <ol ref={ref} className="relative mt-14 space-y-14 pl-14" style={{ '--fill': 0 } as React.CSSProperties}>
        <span aria-hidden className="absolute bottom-2 left-[19px] top-2 w-px bg-line" />
        <span aria-hidden className="absolute left-[19px] top-2 bottom-2 w-px origin-top bg-kunyit-500" style={{ transform: 'scaleY(var(--fill))' }} />
        {steps.map((s, i) => (
          <li key={s.title} className="relative">
            <span className="absolute -left-14 top-0 grid size-10 place-items-center rounded-full bg-tile font-display font-bold text-kunyit-400 ring-4 ring-bg">{i + 1}</span>
            <Reveal delay={80}>
              <h3 className="font-display text-xl font-bold text-fg">{s.title}</h3>
              <p className="mt-1.5 max-w-md leading-relaxed text-muted">{s.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}