import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/common/Reveal';

export default function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-3 pb-20 md:px-8">
      <Reveal from="scale">
        <div className="relative overflow-hidden rounded-[2rem] bg-padi-950 ring-1 ring-white/10">
          {/* 1. Subtle Grid Pattern (Tema WebGIS / Peta) */}
          <div 
            aria-hidden 
            className="pointer-events-none absolute inset-0 opacity-[0.15]" 
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }} 
          />
          
          {/* 2. Efek Glow Halus di sudut (tidak menutupi konten) */}
          <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full bg-kunyit-400/20 blur-[80px]" />
          <div aria-hidden className="absolute -bottom-20 -left-20 size-64 rounded-full bg-padi-500/20 blur-[80px]" />

          {/* 3. Konten: Split Layout (Kiri Teks, Kanan Tombol) */}
          <div className="relative z-10 flex flex-col items-start justify-between gap-8 px-6 py-12 md:flex-row md:items-center md:px-14 md:py-16">
            
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-extrabold leading-tight text-padi-50 md:text-4xl lg:text-[2.75rem]">
                Punya lahan atau hasil panen?
              </h2>
              <p className="mt-3 text-base text-padi-100/70 md:text-lg">
                Daftarkan diri sebagai mitra. Setelah diverifikasi admin, lahan dan produkmu langsung muncul di peta.
              </p>
            </div>

            <div className="shrink-0">
              <Link 
                href="/register" 
                className="group inline-flex items-center gap-2 rounded-full bg-kunyit-400 px-8 py-4 font-semibold text-padi-950 transition-all hover:bg-kunyit-500 hover:shadow-[0_0_20px_rgba(242,182,50,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Daftar sebagai mitra
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

          </div>
        </div>
      </Reveal>
    </section>
  );
}