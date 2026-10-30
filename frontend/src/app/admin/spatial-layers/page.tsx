'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapPin, Trash2, Store, Loader2, Map, AlertCircle } from 'lucide-react';

// Dynamic import komponen peta admin
const AdminMapViewer = dynamic(() => import('@/components/map/AdminMapViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[450px] w-full animate-pulse flex-col items-center justify-center rounded-2xl bg-surface border border-line text-muted">
      <Map className="mb-3 size-8 opacity-50" />
      <p className="text-sm font-medium">Memuat Peta Spasial...</p>
    </div>
  ),
});

export default function AdminSpatialLayersPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    fetchAssets(token);
  }, [router]);

  const fetchAssets = async (token: string) => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/spatial/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setAssets(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat aset spasial:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus aset spasial ini dari peta? Tindakan ini tidak dapat dibatalkan.')) return;
    
    const token = localStorage.getItem('token');
    setActionLoadingId(id);

    try {
      await axios.delete(`http://localhost:5000/api/spatial/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (token) fetchAssets(token);
    } catch (err) {
      alert('Gagal menghapus aset spasial.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Halaman */}
      <div>
        <h1 className="font-display text-3xl font-bold text-fg">Aset Spasial & Pemetaan</h1>
        <p className="mt-1 text-sm text-muted">Pantau dan validasi sebaran lahan serta lokasi toko mitra secara real-time.</p>
      </div>

      {/* Peta Interaktif Admin */}
      <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-fg">
              <MapPin className="size-5 text-kunyit-500" /> Visualisasi Sebaran Wilayah
            </h2>
            <p className="mt-1 text-sm text-muted">Peta interaktif titik toko (Point) dan lahan pertanian (Polygon).</p>
          </div>
        </div>
        
        {/* Container Peta dengan rounded & border */}
        <div className="overflow-hidden rounded-2xl border border-line shadow-inner">
          <AdminMapViewer assets={assets} />
        </div>
      </div>

      {/* Tabel Daftar Aset Spasial */}
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-line p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-fg">
              <Map className="size-5 text-kunyit-500" /> Layer Spasial Terdaftar
            </h2>
            <p className="mt-1 text-sm text-muted">Daftar koordinat dan poligon yang diunggah oleh mitra.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-kunyit-400/10 px-3 py-1.5 text-xs font-bold text-kunyit-600 dark:text-kunyit-400">
            {assets.length} Aset Total
          </span>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted">
            <Loader2 className="mb-4 size-8 animate-spin text-kunyit-500" />
            <p>Memuat data spasial...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full border border-line bg-surface/50">
              <AlertCircle className="size-8 text-muted" />
            </div>
            <h3 className="font-display text-xl font-bold text-fg">Belum Ada Aset Spasial</h3>
            <p className="mt-1 text-sm text-muted">Saat ini belum ada mitra yang mengunggah batas lahan atau lokasi toko.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface/50 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-6 py-4">Tipe Aset</th>
                  <th className="px-6 py-4">Toko Mitra</th>
                  <th className="px-6 py-4">Luas Area</th>
                  <th className="px-6 py-4">GeoJSON</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {assets.map((item) => (
                  <tr key={item.id} className="transition hover:bg-surface/50">
                    
                    {/* Tipe Aset Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${
                        item.asset_type === 'POINT' 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                          : 'bg-kunyit-400/10 text-kunyit-600 dark:text-kunyit-400'
                      }`}>
                        {item.asset_type}
                      </span>
                    </td>

                    {/* Toko Mitra */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-bold text-fg">
                        <Store className="size-4 text-kunyit-500" /> 
                        {item.shop?.name || 'Toko Tanpa Nama'}
                      </div>
                    </td>

                    {/* Luas Area */}
                    <td className="px-6 py-4 font-semibold text-fg">
                      {item.area_hectares ? `${item.area_hectares} Ha` : <span className="text-muted">-</span>}
                    </td>

                    {/* GeoJSON Info (Dibuat kotak kode) */}
                    <td className="px-6 py-4">
                      <div className="max-w-[200px] truncate rounded-lg border border-line bg-bg px-3 py-1.5 font-mono text-[11px] text-muted">
                        {JSON.stringify(item.geom)}
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={actionLoadingId === item.id}
                        className="rounded-xl p-2 text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                        title="Hapus Aset Spasial"
                      >
                        {actionLoadingId === item.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
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