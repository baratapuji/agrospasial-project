'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  ArrowRight, 
  Loader2, 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle'; // Sesuaikan path-nya

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      const { token, user } = res.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'seller') {
        // Cek apakah seller sudah menyelesaikan onboarding / memilih paket
        if (user.onboarding_step && user.onboarding_step < 4) {
          router.push('/seller/onboarding'); // Wajib pilih paket & onboarding dulu!
        } else {
          router.push('/seller/dashboard');
        }
      } else {
        router.push('/');
      }
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Periksa kembali email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg">
      {/* =========================================
          SISI KIRI: VISUAL & INTERAKTIF (Hanya Desktop)
      ========================================= */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-padi-950 p-12 lg:flex">
        {/* Background Animasi & Grid */}
        <div aria-hidden className="absolute inset-0 z-0">
          <div className="absolute -left-1/4 top-0 size-[600px] rounded-full bg-padi-500/20 blur-[120px]" />
          <div className="absolute -right-1/4 bottom-0 size-[500px] rounded-full bg-kunyit-400/10 blur-[100px]" />
          <div 
            className="absolute inset-0 opacity-[0.05]" 
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} 
          />
        </div>

        {/* Konten Kiri */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold text-padi-50 transition hover:opacity-80">
            <div className="grid size-10 place-items-center rounded-xl bg-kunyit-400 text-padi-950">
              <MapPin className="size-6" />
            </div>
            AgroSpasial
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl font-extrabold leading-tight text-padi-50">
            Kelola lahan, panen keuntungan.
          </h1>
          <p className="mt-4 text-lg text-padi-100/70">
            Masuk untuk memantau sebaran lahan mitra, mengelola produk, dan bertransaksi langsung dengan pembeli.
          </p>
        </div>

        <div className="relative z-10 text-sm text-padi-100/50">
          &copy; 2026 AgroSpasial. Hak cipta dilindungi.
        </div>
      </div>

      {/* =========================================
          SISI KANAN: FORM LOGIN
      ========================================= */}
      <div className="relative flex w-full flex-col justify-between bg-bg lg:w-1/2">
        
        {/* Navbar Atas: Back & Theme Toggle */}
        <header className="flex items-center justify-between px-6 py-6 sm:px-10">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-fg"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Kembali ke Beranda
          </Link>
          <ThemeToggle />
        </header>

        {/* Area Form Utama */}
        <main className="flex flex-1 flex-col justify-center px-6 sm:px-10 lg:px-20 xl:px-32">
          <div className="mx-auto w-full max-w-sm">
            
            <div className="mb-8 text-center lg:text-left">
              <h2 className="font-display text-3xl font-extrabold text-fg">Masuk ke Akun</h2>
              <p className="mt-2 text-sm text-muted">
                Silakan masukkan kredensial Anda untuk melanjutkan.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Input Email */}
              <div>
                <label className="block text-sm font-semibold text-fg">Email</label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted">
                    <Mail className="size-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-4 text-sm text-fg outline-none transition-all placeholder:text-muted/50 focus:border-kunyit-500 focus:ring-2 focus:ring-kunyit-500/20"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              {/* Input Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-fg">Password</label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-kunyit-500 hover:text-kunyit-400 transition">
                    Lupa sandi?
                  </Link>
                </div>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted">
                    <Lock className="size-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-11 text-sm text-fg outline-none transition-all placeholder:text-muted/50 focus:border-kunyit-500 focus:ring-2 focus:ring-kunyit-500/20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted hover:text-fg transition"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-kunyit-400 py-3.5 px-4 text-sm font-bold text-padi-950 shadow-sm transition-all hover:bg-kunyit-500 hover:shadow-[0_0_20px_rgba(242,182,50,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kunyit-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    Masuk <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Link Daftar */}
            <p className="mt-8 text-center text-sm text-muted">
              Belum punya akun?{' '}
              <Link href="/register" className="font-bold text-kunyit-500 hover:text-kunyit-400 transition">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </main>

        {/* Footer Bawah (Mobile Only / Minimalist) */}
        <footer className="px-6 py-6 text-center text-xs text-muted sm:px-10 lg:hidden">
          &copy; 2026 AgroSpasial.
        </footer>
      </div>
    </div>
  );
}