'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  CheckCircle2, XCircle, MapPin, Store, 
  Loader2, Map, ShieldAlert 
} from 'lucide-react';

const AdminMapViewer = dynamic(() => import('@/components/map/AdminMapViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full animate-pulse flex-col items-center justify-center rounded-2xl bg-surface border border-line text-muted">
      <Map className="mb-3 size-8 opacity-50" />
      <p className="text-sm font-medium">Memuat Peta Validasi...</p>
    </div>
  ),
});

export default function AdminSpatialValidatePage() {
  const router = useRouter();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
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
      console.error('Gagal memuat data koordinat:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (assetId: string, isVerified: boolean) => {
    const token = localStorage.getItem('token');
    setActionLoadingId(assetId);
    
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/spatial/admin/verify/${assetId}`,
        { isVerified },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        // alert(isVerified ? 'Lahan & Toko berhasil disetujui!' : 'Status lahan ditolak.');
        if (token) fetchAssets(token);
      }
    } catch (err) {
      alert('Gagal memproses validasi koordinat.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Hitung total pending berdasarkan shop yang belum verified
  const pendingCount = assets.filter(a => !a.shop?.is_verified).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Halaman */}
      <div>
        <h1 className="font-display text-3xl font-bold text-fg">Validasi Koordinat</h1>
        <p className="mt-1 text-sm text-muted">Periksa letak titik toko dan batas poligon lahan sebelum memberikan verifikasi.</p>
      </div>

      {/* Peta Pratinjau */}
      <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm relative z-0">
        <div className="mb-5">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-fg">
            <MapPin className="size-5 text-kunyit-500" /> Pratinjau Spasial Wilayah Mitra
          </h2>
          <p className="mt-1 text-sm text-muted">Peta interaktif titik toko (Point) dan lahan pertanian (Polygon).</p>
        </div>
        
        {/* Container Peta - relative z-0 agar tidak menimpa navbar */}
        <div className="overflow-hidden rounded-2xl border border-line shadow-inner relative z-0">
          <AdminMapViewer assets={assets} />
        </div>
      </div>

      {/* Tabel Daftar Pengajuan Koordinat */}
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-line p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-fg">
              <ShieldAlert className="size-5 text-kunyit-500" /> Daftar Koordinat Lahan
            </h2>
            <p className="mt-1 text-sm text-muted">Daftar pengajuan spasial yang memerlukan peninjauan admin.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-kunyit-400/10 px-3 py-1.5 text-xs font-bold text-kunyit-600 dark:text-kunyit-400">
            {pendingCount} Menunggu Validasi
          </span>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted">
            <Loader2 className="mb-4 size-8 animate-spin text-kunyit-500" />
            <p>Memuat data koordinat...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full border border-line bg-surface/50">
              <MapPin className="size-8 text-muted" />
            </div>
            <h3 className="font-display text-xl font-bold text-fg">Belum Ada Pengajuan</h3>
            <p className="mt-1 text-sm text-muted">Saat ini tidak ada koordinat lahan yang perlu divalidasi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface/50 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-6 py-4">Toko / Pemilik</th>
                  <th className="px-6 py-4">Tipe Aset</th>
                  <th className="px-6 py-4">Luas Lahan</th>
                  <th className="px-6 py-4 text-center">Status Toko</th>
                  <th className="px-6 py-4 text-center">Aksi Validasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {assets.map((item) => (
                  <tr key={item.id} className="transition hover:bg-surface/50">
                    
                    {/* Toko / Pemilik */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-bold text-fg">
                        <Store className="size-4 text-kunyit-500" />
                        <div>
                          <div>{item.shop?.name || 'Toko Tanpa Nama'}</div>
                          <div className="text-xs font-normal text-muted">{item.shop?.owner?.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Tipe Aset */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${
                        item.asset_type === 'POINT' 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                          : 'bg-kunyit-400/10 text-kunyit-600 dark:text-kunyit-400'
                      }`}>
                        {item.asset_type}
                      </span>
                    </td>

                    {/* Luas Lahan */}
                    <td className="px-6 py-4 font-semibold text-fg">
                      {item.area_hectares ? `${item.area_hectares} Ha` : <span className="text-muted">-</span>}
                    </td>

                    {/* Status Verifikasi Toko */}
                    <td className="px-6 py-4 text-center">
                      {item.shop?.is_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" /> Terverifikasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <ShieldAlert className="size-3" /> Belum Verifikasi
                        </span>
                      )}
                    </td>

                    {/* Aksi Validasi */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleVerification(item.id, true)}
                          disabled={actionLoadingId === item.id}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                        >
                          {actionLoadingId === item.id ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />} 
                          Setujui
                        </button>
                        <button
                          onClick={() => handleVerification(item.id, false)}
                          disabled={actionLoadingId === item.id}
                          className="flex items-center gap-1.5 rounded-xl bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-500/20 disabled:opacity-50 dark:text-red-400"
                        >
                          {actionLoadingId === item.id ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />} 
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