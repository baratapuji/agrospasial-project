'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, XCircle, Store, UserCheck, 
  Loader2, AlertCircle 
} from 'lucide-react';

export default function AdminPendingSellersPage() {
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
    fetchPendingShops(token);
  }, [router]);

  const fetchPendingShops = async (token: string) => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/shops/admin/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setShops(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat pengajuan mitra:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (shopId: string, isVerified: boolean) => {
    const token = localStorage.getItem('token');
    setActionLoadingId(shopId); // Set loading untuk baris ini saja
    
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/shops/admin/verify/${shopId}`,
        { isVerified },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert(isVerified ? 'Mitra berhasil disetujui!' : 'Mitra ditolak.');
        if (token) fetchPendingShops(token);
      }
    } catch (err) {
      alert('Gagal memproses verifikasi mitra.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Halaman */}
      <div>
        <h1 className="font-display text-3xl font-bold text-fg">Verifikasi Mitra</h1>
        <p className="mt-1 text-sm text-muted">Tinjau pengajuan pendaftaran toko tani baru sebelum mereka dapat berjualan.</p>
      </div>

      {/* Tabel Pengajuan Mitra */}
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-line p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-fg">
              <UserCheck className="size-5 text-kunyit-500" /> Antrean Pendaftaran
            </h2>
            <p className="mt-1 text-sm text-muted">Pastikan data toko dan kepemilikan lahan sudah sesuai.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <AlertCircle className="size-3.5" /> {shops.length} Menunggu
          </span>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted">
            <Loader2 className="mb-4 size-8 animate-spin text-kunyit-500" />
            <p>Memuat data pengajuan...</p>
          </div>
        ) : shops.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full border border-line bg-emerald-500/10">
              <CheckCircle2 className="size-8 text-emerald-500" />
            </div>
            <h3 className="font-display text-xl font-bold text-fg">Semua Bersih!</h3>
            <p className="mt-1 text-sm text-muted">Tidak ada pendaftaran mitra baru yang menunggu verifikasi saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface/50 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-6 py-4">Nama Toko</th>
                  <th className="px-6 py-4">Email Pemilik</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4 text-center">Aset Spasial</th>
                  <th className="px-6 py-4 text-center">Tindakan</th>
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

                    {/* Email Pemilik */}
                    <td className="px-6 py-4 text-muted">
                      {shop.owner?.email || '-'}
                    </td>

                    {/* Deskripsi */}
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-muted" title={shop.description}>
                        {shop.description || '-'}
                      </div>
                    </td>

                    {/* Aset Spasial */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                        {shop.spatial_assets?.length || 0} Terdaftar
                      </span>
                    </td>

                    {/* Aksi Verifikasi */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleVerify(shop.id, true)}
                          disabled={actionLoadingId === shop.id}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                        >
                          {actionLoadingId === shop.id ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />} 
                          Setujui
                        </button>
                        <button
                          onClick={() => handleVerify(shop.id, false)}
                          disabled={actionLoadingId === shop.id}
                          className="flex items-center gap-1.5 rounded-xl bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-500/20 disabled:opacity-50 dark:text-red-400"
                        >
                          {actionLoadingId === shop.id ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />} 
                          Tolak
                        </button>
                      </div>
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