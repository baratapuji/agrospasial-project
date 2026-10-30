'use client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

// Sesuaikan dengan kunci yang disimpan halaman login-mu
const AUTH_KEYS = ['token', 'refreshToken', 'refresh_token', 'user'];

export default function LogoutButton() {
  const router = useRouter();

  const logout = () => {
    try { AUTH_KEYS.forEach((k) => localStorage.removeItem(k)); } catch { /* penyimpanan diblokir */ }
    router.replace('/login');
  };

  return (
    <button
      type="button"
      onClick={logout}
      className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-fg ring-1 ring-line transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kunyit-500"
    >
      <LogOut className="size-4" aria-hidden />
      <span className="hidden sm:inline">Keluar</span>
      <span className="sr-only sm:hidden">Keluar</span>
    </button>
  );
}