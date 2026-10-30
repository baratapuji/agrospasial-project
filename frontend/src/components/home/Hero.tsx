'use client';
import Link from 'next/link';
import { useEffect, useRef, type CSSProperties } from 'react';
import { ArrowDown, MapPin } from 'lucide-react';

const WORDS = 'Lihat lahannya, kenal petaninya, beli langsung dari kebun.'.split(' ');
const CHIPS = [
  { t: 'Padi', pos: 'right-[9%] top-[16%]', delay: '0s' },
  { t: 'Kopi', pos: 'right-[26%] top-[34%]', delay: '-2s' },
  { t: 'Karet', pos: 'right-[6%] top-[50%]', delay: '-4s' },
  { t: 'Sawit', pos: 'right-[24%] top-[68%]', delay: '-1s' },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  // Progres scroll 0..1 -> variabel CSS --p (konten memudar, latar bergeser)
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      el.style.setProperty('--p', String(Math.min(window.scrollY / (el.offsetHeight * 0.8), 1)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section ref={ref} style={{ '--p': 0 } as CSSProperties} className="relative overflow-hidden">
      {/* Aurora yang bergeser pelan */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ transform: 'translateY(calc(var(--p) * 140px))' }}>
        <div data-motion className="absolute -left-24 top-0 size-[420px] rounded-full bg-padi-500/25 blur-[90px] dark:bg-padi-500/30" style={{ animation: 'drift 14s ease-in-out infinite' }} />
        <div data-motion className="absolute right-0 top-20 size-[360px] rounded-full bg-kunyit-400/25 blur-[100px] dark:bg-kunyit-400/15" style={{ animation: 'drift 18s ease-in-out infinite reverse' }} />
      </div>

      {/* Garis kontur yang tergambar sendiri */}
      <svg aria-hidden className="pointer-events-none absolute -right-20 top-0 w-[720px] text-padi-700/30 dark:text-padi-500/25" viewBox="0 0 600 400" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ transform: 'translateY(calc(var(--p) * 70px))' }}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <path key={i} pathLength={1} data-motion d={`M-20 ${330 - i * 34} C 120 ${250 - i * 34}, 220 ${380 - i * 34}, 330 ${290 - i * 34} S 520 ${210 - i * 34}, 640 ${280 - i * 34}`} style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: `draw 2.6s ease-out ${i * 0.18}s forwards` }} />
        ))}
      </svg>

      {/* Chip komoditas mengambang */}
      {CHIPS.map((c) => (
        <span key={c.t} aria-hidden data-motion className={`absolute hidden items-center gap-1.5 rounded-full bg-surface/70 px-3.5 py-1.5 text-sm font-medium text-fg shadow-lg ring-1 ring-line backdrop-blur lg:flex ${c.pos}`} style={{ animation: `bob 6s ease-in-out ${c.delay} infinite, fadeIn 1s ease 1.2s both` }}>
          <MapPin className="size-3.5 text-kunyit-500" /> {c.t}
        </span>
      ))}

      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-14 md:px-8 md:pb-24 md:pt-24" style={{ opacity: 'calc(1 - var(--p) * 1.15)', transform: 'translateY(calc(var(--p) * -50px))' }}>
        <h1 className="max-w-4xl font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-fg sm:text-6xl lg:text-7xl" aria-label={WORDS.join(' ')}>
          {WORDS.map((w, i) => (
            <span key={i} aria-hidden className="word mr-[.25em]"><span style={{ '--d': `${0.15 + i * 0.09}s` } as CSSProperties}>{w}</span></span>
          ))}
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted" style={{ animation: 'fadeIn 1s ease 1s both' }}>
          AgroSpasial menampilkan lahan garapan dan toko mitra dalam satu peta. Pilih komoditas, cek asalnya, lalu pesan tanpa tengkulak.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3" style={{ animation: 'fadeIn 1s ease 1.2s both' }}>
          <a href="#peta" className="inline-flex items-center gap-2 rounded-full bg-kunyit-400 px-6 py-3 font-semibold text-padi-950 transition hover:bg-kunyit-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg">
            Jelajahi peta <ArrowDown className="size-4" aria-hidden />
          </a>
          <Link href="/register" className="rounded-full px-6 py-3 font-semibold text-fg ring-1 ring-line transition hover:bg-surface">Daftar sebagai mitra</Link>
        </div>
      </div>
    </section>
  );
}