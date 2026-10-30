import { MapPinned, ShieldCheck, ShoppingBasket } from 'lucide-react';
import Reveal from '@/components/common/Reveal';

const items = [
  { icon: ShieldCheck, title: 'Setiap mitra diverifikasi admin', text: 'Produsen dan penjual dicek dulu sebelum produknya tampil di peta dan toko.' },
  { icon: MapPinned, title: 'Batas lahan digambar presisi', text: 'Poligon lahan garapan membantu menghitung potensi panen tiap daerah.' },
  { icon: ShoppingBasket, title: 'Bayar langsung ke petani', text: 'Pesan dan bayar secara elektronik tanpa perantara tengkulak.' },
];

export default function Benefits() {
  return (
    <section id="keunggulan" className="mx-auto grid max-w-7xl scroll-mt-20 gap-12 px-5 py-20 md:grid-cols-[1fr_1.3fr] md:gap-20 md:px-8 md:py-28">
      
      {/* Kiri: Sticky Heading & Deskripsi Singkat */}
      <Reveal from="left" className="md:sticky md:top-28 md:self-start">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-kunyit-400/10 px-3.5 py-1.5 text-sm font-semibold text-kunyit-600 dark:text-kunyit-400">
          <span className="size-2 rounded-full bg-kunyit-500" />
          Keunggulan Utama
        </div>
        <h2 className="font-display text-3xl font-bold leading-[1.15] text-fg md:text-4xl lg:text-[2.75rem]">
          Hasil tani yang bisa dilacak sampai ke lahannya.
        </h2>
        <p className="mt-5 max-w-sm leading-relaxed text-muted">
          Kami memotong rantai distribusi yang panjang agar petani mendapat harga layak dan pembeli mendapat kualitas terbaik.
        </p>
      </Reveal>

      {/* Kanan: List Card Modern (Bukan lagi bergaris-garis) */}
      <ul className="flex flex-col gap-5">
        {items.map(({ icon: Icon, title, text }, i) => (
          <li key={title}>
            <Reveal delay={i * 90}>
              {/* Desain Card: Border halus, bg transparan, hover naik sedikit */}
              <div className="group relative flex flex-col gap-5 rounded-3xl border border-line bg-surface/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-surface hover:shadow-[0_20px_40px_-20px_rgba(18,48,31,0.1)] sm:flex-row sm:items-start sm:p-7">
                
                {/* Ikon dengan ukuran lebih proporsional */}
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-padi-900 text-kunyit-400 transition-all duration-300 group-hover:scale-105 group-hover:bg-kunyit-400 group-hover:text-padi-950 dark:bg-padi-800">
                  <Icon className="size-6" aria-hidden />
                </span>
                
                {/* Teks */}
                <div>
                  <h3 className="font-display text-xl font-bold text-fg">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">
                    {text}
                  </p>
                </div>
                
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

    </section>
  );
}