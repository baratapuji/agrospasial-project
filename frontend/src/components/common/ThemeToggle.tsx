'use client';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const toggle = () => {
    const dark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
  };
  return (
    <button onClick={toggle} aria-label="Ganti tema terang atau gelap" className="grid size-10 place-items-center rounded-full text-fg ring-1 ring-line transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-kunyit-500">
      <Sun className="hidden size-[18px] dark:block" aria-hidden />
      <Moon className="size-[18px] dark:hidden" aria-hidden />
    </button>
  );
}