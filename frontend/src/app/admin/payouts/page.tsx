'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, Store, Clock, Loader2, 
  Wallet, CheckCircle2 
} from 'lucide-react';

export default function AdminPayoutsPage() {
  const router = useRouter();
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchPayouts(token);
  }, [router]);

  const fetchPayouts = async (token: string) => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/shops/admin/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setShops(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat log pencairan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayout = (shopId: string) => {
    setActionLoadingId(shopId);
    // Simulasi proses pencairan
    setTimeout(() => {
      alert('Fitur transfer pencairan dana otomatis via gateway sedang disiapkan.');
      setActionLoadingId(null);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Halaman */}
      <div>
        <h1 className="font-display text-3xl font-bold text-fg">Pencairan Dana</h1>
        <p className="mt-1 text-sm text-muted">Kelola saldo dompet mitra dan proses penarikan dana hasil penjualan.</p>
      </div>

      {/* Tabel Saldo & Payout */}
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-line p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-fg">
              <Wallet className="size-5 text-kunyit-500" /> Dompet Saldo Mitra
            </h2>
            <p className="mt-1 text-sm text-muted">Pastikan rekening tujuan valid sebelum memproses pencairan.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-kunyit-400/10 px-3 py-1.5 text-xs font-bold text-kunyit-600 dark:text-kunyit-400">
            {shops.length} Toko Terdaftar
          </span>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted">
            <Loader2 className="mb-4 size-8 animate-spin text-kunyit-500" />
            <p>Memuat data saldo...</p>
          </div>
        ) : shops.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full border border-line bg-surface/50">
              <DollarSign className="size-8 text-muted" />
            </div>
            <h3 className="font-display text-xl font-bold text-fg">Belum Ada Data</h3>
            <p className="mt-1 text-sm text-muted">Saat ini belum ada saldo mitra yang terdaftar untuk dicairkan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface/50 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-6 py-4">Nama Toko</th>
                  <th className="px-6 py-4">Pemilik</th>
                  <th className="px-6 py-4">Saldo Dompet</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {shops.map((shop) => (
                  <tr key={shop.id} className="transition hover:bg-surface/50">
                    
                    {/* Nama Toko */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-bold text-fg">
                        <Store className="size-4 text-kunyit-500" /> {shop.name}
                      </div>
                    </td>

                    {/* Pemilik */}
                    <td className="px-6 py-4 text-muted">
                      {shop.owner?.email || '-'}
                    </td>

                    {/* Saldo */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-fg">
                        Rp {Number(shop.wallet_balance || 0).toLocaleString('id-ID')}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                        <Clock className="size-3" /> Siap Dicairkan
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handlePayout(shop.id)}
                        disabled={actionLoadingId === shop.id}
                        className="mx-auto flex items-center justify-center gap-1.5 rounded-xl bg-kunyit-400 px-4 py-1.5 text-xs font-bold text-padi-950 transition-all hover:bg-kunyit-500 disabled:opacity-50"
                      >
                        {actionLoadingId === shop.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="size-3.5" />
                        )}
                        Proses Payout
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}