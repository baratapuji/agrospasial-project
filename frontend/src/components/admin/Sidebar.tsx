'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sprout, LogOut, ChevronDown, X } from 'lucide-react';
import { ADMIN_MENUS } from '@/config/admin-menu'; // Sesuaikan path

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  // Otomatis buka accordion jika path saat ini cocok dengan sub-menu
  useEffect(() => {
    const activeParents = ADMIN_MENUS.filter(menu => 
      menu.children?.some(child => pathname.startsWith(child.href))
    ).map(menu => menu.title);
    
    setOpenAccordions(prev => Array.from(new Set([...prev, ...activeParents])));
  }, [pathname]);

  const toggleAccordion = (title: string) => {
    setOpenAccordions(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };

  return (
    <>
      {/* 1. Backdrop untuk Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-padi-950/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      {/* 2. Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface border-r border-line transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        
        {/* Header Sidebar */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-line shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid size-10 place-items-center rounded-xl bg-padi-950 text-kunyit-400">
              <Sprout className="size-6" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-fg block leading-none">AgroSpasial</span>
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Control Center</span>
            </div>
          </Link>
          
          {/* Tombol Close (Mobile Only) */}
          <button onClick={onClose} className="md:hidden text-muted hover:text-fg">
            <X className="size-6" />
          </button>
        </div>

        {/* Menu List (Scrollable) */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-line">
          {ADMIN_MENUS.map((menu) => {
            const hasChildren = menu.children && menu.children.length > 0;
            const isChildActive = menu.children?.some(child => pathname.startsWith(child.href));
            const isParentActive = pathname === menu.href || isChildActive;
            const isOpen = openAccordions.includes(menu.title);

            return (
              <div key={menu.title} className="flex flex-col">
                {/* Parent Item */}
                {hasChildren ? (
                  <button
                    onClick={() => toggleAccordion(menu.title)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all group ${
                      isParentActive || isOpen
                        ? 'bg-kunyit-400/5 text-kunyit-600 dark:text-kunyit-400' 
                        : 'text-muted hover:bg-surface/80 hover:text-fg'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <menu.icon className={`size-5 transition-colors ${isParentActive || isOpen ? 'text-kunyit-500' : 'text-muted group-hover:text-fg'}`} />
                      {menu.title}
                    </div>
                    <ChevronDown className={`size-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    href={menu.href!}
                    onClick={() => { if(window.innerWidth < 768) onClose() }}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all group ${
                      isParentActive
                        ? 'bg-kunyit-400 text-padi-950 shadow-md shadow-kunyit-500/20' 
                        : 'text-muted hover:bg-surface/80 hover:text-fg'
                    }`}
                  >
                    <menu.icon className={`size-5 ${isParentActive ? 'text-padi-950' : 'text-muted group-hover:text-fg'}`} />
                    {menu.title}
                  </Link>
                )}

                {/* Sub-Menu (Accordion Body) */}
                {hasChildren && (
                  <div className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}
                  `}>
                    <div className="ml-[1.65rem] border-l-2 border-line pl-3 py-1 space-y-1">
                      {menu.children!.map((child) => {
                        const isActive = pathname === child.href;
                        return (
                          <Link
                            key={child.title}
                            href={child.href}
                            onClick={() => { if(window.innerWidth < 768) onClose() }}
                            className={`block rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                              isActive
                                ? 'bg-kunyit-400/10 text-kunyit-600 dark:text-kunyit-400'
                                : 'text-muted hover:text-fg hover:bg-surface/50'
                            }`}
                          >
                            {child.title}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-line shrink-0">
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition-all hover:bg-red-500/10"
          >
            <LogOut className="size-5" />
            Keluar Sistem
          </Link>
        </div>
      </aside>
    </>
  );
}