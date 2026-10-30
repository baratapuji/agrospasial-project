'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  Sliders, Save, Loader2, 
  Store, Banknote 
} from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<any[]>([]);
  const [appName, setAppName] = useState('AgroSpasial WebGIS');
  const [platformFee, setPlatformFee] = useState('2500');
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchSettings(token);
  }, [router]);

  const fetchSettings = async (token: string) => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/settings/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setSettings(res.data.data);
        res.data.data.forEach((s: any) => {
          if (s.setting_key === 'app_name') setAppName(s.setting_value);
          if (s.setting_key === 'platform_fee') setPlatformFee(s.setting_value);
        });
      }
    } catch (err) {
      console.error('Gagal memuat pengaturan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: string) => {
    const token = localStorage.getItem('token');
    setSavingKey(key); // Set loading untuk tombol ini saja
    
    try {
      await axios.post(
        'http://localhost:5000/api/settings/admin/save',
        { key, value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Pengaturan ${key === 'app_name' ? 'Nama Platform' : 'Biaya Layanan'} berhasil disimpan!`);
    } catch (err) {
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      {/* Header Halaman */}
      <div>
        <h1 className="font-display text-3xl font-bold text-fg">Pengaturan Sistem</h1>
        <p className="mt-1 text-sm text-muted">Konfigurasi global identitas platform dan biaya layanan.</p>
      </div>

      {/* Card Container */}
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <div className="border-b border-line p-6 sm:p-8">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-fg">
            <Sliders className="size-5 text-kunyit-500" /> Konfigurasi Global
          </h2>
          <p className="mt-1 text-sm text-muted">Perubahan akan langsung diterapkan ke seluruh platform.</p>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted">
            <Loader2 className="mb-4 size-8 animate-spin text-kunyit-500" />
            <p>Memuat pengaturan...</p>
          </div>
        ) : (
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Form Nama Platform */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-fg">
                <Store className="size-4 text-muted" /> Nama Platform / Judul Aplikasi
              </label>
              <p className="text-xs text-muted mb-2">Nama ini akan muncul di Navbar dan tag judul (title) browser.</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="flex-1 rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-fg outline-none transition-all placeholder:text-muted/50 focus:border-kunyit-500 focus:ring-2 focus:ring-kunyit-500/20"
                />
                <button
                  onClick={() => handleSave('app_name', appName)}
                  disabled={savingKey === 'app_name'}
                  className="flex items-center justify-center gap-2 rounded-xl bg-kunyit-400 px-6 py-2.5 text-sm font-bold text-padi-950 shadow-sm transition-all hover:bg-kunyit-500 disabled:opacity-70"
                >
                  {savingKey === 'app_name' ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} 
                  Simpan
                </button>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-line" />

            {/* Form Biaya Platform */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-fg">
                <Banknote className="size-4 text-muted" /> Biaya Platform / Layanan (Rupiah)
              </label>
              <p className="text-xs text-muted mb-2">Biaya tetap yang ditambahkan ke setiap transaksi pesanan.</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-semibold text-muted">
                    Rp
                  </div>
                  <input
                    type="number"
                    value={platformFee}
                    onChange={(e) => setPlatformFee(e.target.value)}
                    className="w-full rounded-xl border border-line bg-bg py-2.5 pl-11 pr-4 text-sm text-fg outline-none transition-all placeholder:text-muted/50 focus:border-kunyit-500 focus:ring-2 focus:ring-kunyit-500/20"
                  />
                </div>
                <button
                  onClick={() => handleSave('platform_fee', platformFee)}
                  disabled={savingKey === 'platform_fee'}
                  className="flex items-center justify-center gap-2 rounded-xl bg-kunyit-400 px-6 py-2.5 text-sm font-bold text-padi-950 shadow-sm transition-all hover:bg-kunyit-500 disabled:opacity-70"
                >
                  {savingKey === 'platform_fee' ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} 
                  Simpan
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}