import { Leaf } from 'lucide-react';

const ITEMS = ['Padi', 'Kopi', 'Karet', 'Sawit', 'Kayu manis', 'Jagung', 'Pinang', 'Durian', 'Cabai', 'Kelapa'];

export default function Marquee() {
  // Duplikasi array 3x agar aman saat di-scroll di layar ultrawide
  const row = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div 
      aria-hidden 
      className="marquee relative flex overflow-hidden border-y border-line bg-surface/30 py-4"
    >
      {/* 1. Efek Fade di Kiri & Kanan (Clean Look) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent md:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent md:w-32" />

      <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap font-display text-sm font-semibold uppercase tracking-[0.2em] text-padi-900/60 dark:text-padi-100/50 md:text-base md:gap-12">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-8 md:gap-12">
            {t}
            {/* 2. Pemisah: Ikon Daun yang subtle dengan warna Kunyit */}
            <Leaf className="size-3.5 text-kunyit-500/80" strokeWidth={2.5} />
          </span>
        ))}
      </div>
    </div>
  );
}