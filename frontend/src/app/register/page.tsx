'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, User, Store, Lock, Mail, Phone, 
  ArrowRight, ArrowLeft, Eye, EyeOff, Loader2, 
  Sprout, ShieldCheck 
} from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle'; // Sesuaikan path

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        ...formData,
        role,
      });

      setMessage({ text: res.data.message, type: 'success' });

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.',
        type: 'error',
      });
      setLoading(false); // Jangan lupa set loading false jika error
    } 
  };

  return (
    <div className="flex min-h-screen bg-bg">
      {/* =========================================
          SISI KIRI: VISUAL (Hanya Desktop)
      ========================================= */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-padi-950 p-12 lg:flex">
        <div aria-hidden className="absolute inset-0 z-0">
          <div className="absolute -left-1/4 top-0 size-[600px] rounded-full bg-padi-500/20 blur-[120px]" />
          <div className="absolute -right-1/4 bottom-0 size-[500px] rounded-full bg-kunyit-400/10 blur-[100px]" />
          <div 
            className="absolute inset-0 opacity-[0.05]" 
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} 
          />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold text-padi-50 transition hover:opacity-80">
            <div className="grid size-10 place-items-center rounded-xl bg-kunyit-400 text-padi-950">
              <MapPin className="size-6" />
            </div>
            AgroSpasial
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl font-extrabold leading-tight text-padi-50 mb-8">
            Mulai perjalanan agribisnis Anda.
          </h1>
          
          <ul className="space-y-6 text-padi-100/80">
            <li className="flex items-center gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
                <Sprout className="size-5 text-kunyit-400" />
              </div>
              <p>Akses ke ribuan komoditas langsung dari petani.</p>
            </li>
            <li className="flex items-center gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
                <ShieldCheck className="size-5 text-kunyit-400" />
              </div>
              <p>Transaksi aman dengan verifikasi mitra oleh admin.</p>
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-sm text-padi-100/50">
          &copy; 2026 AgroSpasial.
        </div>
      </div>

      {/* =========================================
          SISI KANAN: FORM REGISTER
      ========================================= */}
      <div className="relative flex w-full flex-col justify-between bg-bg lg:w-1/2">
        
        {/* Navbar Atas */}
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

        {/* Area Form */}
        <main className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            
            <div className="mb-8 text-center lg:text-left">
              <h2 className="font-display text-3xl font-extrabold text-fg">Buat Akun Baru</h2>
              <p className="mt-2 text-sm text-muted">
                Sudah punya akun?{' '}
                <Link href="/login" className="font-bold text-kunyit-500 hover:text-kunyit-400 transition">
                  Masuk di sini
                </Link>
              </p>
            </div>

            {/* Pilihan Role (Segmented Control Modern) */}
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-surface p-1.5 ring-1 ring-line">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  role === 'buyer'
                    ? 'bg-kunyit-400 text-padi-950 shadow-sm'
                    : 'text-muted hover:text-fg hover:bg-surface/80'
                }`}
              >
                <User className="size-4" /> Pembeli
              </button>
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  role === 'seller'
                    ? 'bg-kunyit-400 text-padi-950 shadow-sm'
                    : 'text-muted hover:text-fg hover:bg-surface/80'
                }`}
              >
                <Store className="size-4" /> Mitra/Penjual
              </button>
            </div>

            {/* Info Mitra */}
            {role === 'seller' && (
              <div className="mb-6 animate-in fade-in slide-in-from-top-2 rounded-xl border border-kunyit-500/30 bg-kunyit-400/10 p-4 text-sm text-kunyit-700 dark:text-kunyit-400">
                💡 <strong>Catatan Mitra:</strong> Akun Anda perlu diverifikasi Admin sebelum dapat mendaftarkan lahan dan menjual komoditas.
              </div>
            )}

            {/* Status Message */}
            {message && (
              <div className={`mb-6 rounded-xl border p-3.5 text-sm font-medium ${
                message.type === 'success'
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nama Lengkap */}
              <div>
                <label className="block text-sm font-semibold text-fg">Nama Lengkap</label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted">
                    <User className="size-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-4 text-sm text-fg outline-none transition-all placeholder:text-muted/50 focus:border-kunyit-500 focus:ring-2 focus:ring-kunyit-500/20"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>

              {/* Nomor HP */}
              <div>
                <label className="block text-sm font-semibold text-fg">Nomor Telepon / WhatsApp</label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted">
                    <Phone className="size-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-4 text-sm text-fg outline-none transition-all placeholder:text-muted/50 focus:border-kunyit-500 focus:ring-2 focus:ring-kunyit-500/20"
                    placeholder="081234567890"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-fg">Email Address</label>
                <div className="relative mt-1.5">
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

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-fg">Password</label>
                <div className="relative mt-1.5">
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
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-kunyit-400 py-3.5 px-4 text-sm font-bold text-padi-950 shadow-sm transition-all hover:bg-kunyit-500 hover:shadow-[0_0_20px_rgba(242,182,50,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kunyit-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    Daftar Sekarang <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

          </div>
        </main>

        {/* Footer Bawah Mobile */}
        <footer className="px-6 py-6 text-center text-xs text-muted sm:px-10 lg:hidden">
          &copy; 2026 AgroSpasial.
        </footer>
      </div>
    </div>
  );
}