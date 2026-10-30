'use client';

import { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import AdminNavbar from '@/components/admin/AdminNavbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Konten Utama */}
      <div className="relative z-0 flex min-h-screen flex-col md:pl-72">
        <AdminNavbar 
          adminName="Administrator" 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        <main className="flex-1 p-4 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}