'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, Sprout, X } from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';

const links = [
  { href: '#peta', label: 'Peta' },
  { href: '#cara-kerja', label: 'Cara kerja' },
  { href: '#keunggulan', label: 'Keunggulan' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-bg/80 backdrop-blur-lg border-b border-line' : 'border-b border-transparent'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-fg">
          <span className="grid size-8 place-items-center rounded-lg bg-tile text-kunyit-400"><Sprout className="size-[18px]" aria-hidden /></span>
          AgroSpasial
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Utama">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm font-medium text-muted transition hover:text-fg">{l.label}</a>)}
          <Link href="/login" className="text-sm font-medium text-muted transition hover:text-fg">Masuk</Link>
          <ThemeToggle />
          <Link href="/register" className="rounded-full bg-btn px-5 py-2 text-sm font-semibold text-btn-fg transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kunyit-500">Daftar akun</Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button className="grid size-10 place-items-center rounded-full text-fg" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? 'Tutup menu' : 'Buka menu'}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-bg px-5 pb-5 pt-3 md:hidden" aria-label="Seluler">
          <div className="flex flex-col gap-1">
            {[...links, { href: '/login', label: 'Masuk' }].map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 font-medium text-fg hover:bg-surface">{l.label}</a>
            ))}
            <Link href="/register" className="mt-2 rounded-full bg-btn px-5 py-3 text-center font-semibold text-btn-fg">Daftar akun</Link>
          </div>
        </nav>
      )}
    </header>
  );
}