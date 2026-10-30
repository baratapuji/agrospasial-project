'use client';

import ThemeToggle from '@/components/common/ThemeToggle'; // Sesuaikan path
import { Bell, Search, Menu } from 'lucide-react';

interface NavbarProps {
  adminName: string;
  onMenuClick: () => void;
}

export default function AdminNavbar({ adminName, onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur-md md:px-10">
      
      <div className="flex items-center gap-4">
        {/* Tombol Hamburger (Hanya Mobile) */}
        <button 
          onClick={onMenuClick}
          className="grid size-10 place-items-center rounded-xl border border-line bg-surface text-fg hover:bg-surface/80 md:hidden"
        >
          <Menu className="size-5" />
        </button>

        {/* Search Bar */}
        <div className="hidden w-full max-w-sm items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 md:flex">
          <Search className="size-4 text-muted" />
          <input 
            type="text" 
            placeholder="Cari data mitra atau pengguna..." 
            className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted/60"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        <button className="relative grid size-10 place-items-center rounded-full text-muted hover:bg-surface transition">
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-kunyit-500 ring-2 ring-bg" />
        </button>
        
        <ThemeToggle />
        
        <div className="flex items-center gap-3 border-l border-line pl-3 md:pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-fg leading-tight">{adminName}</p>
            <p className="text-xs font-medium text-muted">Super Admin</p>
          </div>
          <div className="grid size-10 place-items-center rounded-full bg-padi-900 font-bold text-padi-50 shadow-inner">
            {adminName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}