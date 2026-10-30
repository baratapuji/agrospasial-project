'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, XCircle, Clock, Store, 
  Users, AlertCircle, Loader2, ArrowUpRight 
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalUsers: 0, totalSellers: 0, pendingSellers: 0, totalShops: 0 });
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // ID seller yang sedang diproses

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }

    loadDashboardData(token);
  }, [router]);

  const loadDashboardData = async (token: string) => {
    try {
      setLoading(true);
      const [statsRes, sellersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/pending-sellers', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (sellersRes.data.success) setPendingList(sellersRes.data.data);
    } catch (err) {
      console.error('Gagal memuat data dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (sellerId: string, isApproved: boolean) => {
    const token = localStorage.getItem('token');
    setActionLoading(sellerId);
    
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/admin/verify-seller/${sellerId}`,
        { isApproved },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        // Hapus dari list tanpa perlu fetch ulang semua data
        setPendingList((prev) => prev.filter((s) => s.id !== sellerId));
        // Opsional: Update stats secara lokal
        setStats(prev => ({
          ...prev,
          pendingSellers: prev.pendingSellers - 1,
          totalSellers: isApproved ? prev.totalSellers + 1 : prev.totalSellers
        }));
      }
    } catch (err) {
      console.error('Gagal verifikasi:', err);
      alert('Terjadi kesalahan saat memproses verifikasi.');
    } finally {
      setActionLoading(null);
    }
  };

  const statCards = [
    { title: 'Antrean Verifikasi', value: stats.pendingSellers, icon: Clock, color: 'text-kunyit-500', bg: 'bg-kunyit-400/10' },
    { title: 'Mitra Aktif', value: stats.totalSellers, icon: Store, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Total Toko', value: stats.totalShops, icon: Store, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Total Pembeli', value: stats.totalUsers, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Halaman */}
      <div>
        <h1 className="font-display text-3xl font-bold text-fg">Ikhtisar Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Pantau aktivitas platform dan kelola verifikasi mitra.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <div key={i} className="rounded-3xl border border-line bg-surface p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted">{card.title}</span>
              <div className={`grid size-10 place-items-center rounded-xl ${card.bg} ${card.color}`}>
                <card.icon className="size-5" />
              </div>
            </div>
            <div className="mt-4 font-display text-4xl font-extrabold text-fg">
              {loading ? '-' : card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabel Verifikasi */}
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-line p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-fg">
              <AlertCircle className="size-5 text-kunyit-500" /> Pengajuan Mitra Baru
            </h2>
            <p className="mt-1 text-sm text-muted">Tinjau kelayakan mitra sebelum memberikan akses pemetaan lahan.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-kunyit-400/10 px-3 py-1.5 text-xs font-bold text-kunyit-600 dark:text-kunyit-400">
            {pendingList.length} Menunggu
          </span>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted">
            <Loader2 className="mb-4 size-8 animate-spin text-kunyit-500" />
            <p>Memuat data pengajuan...</p>
          </div>
        ) : pendingList.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full bg-emerald-500/10">
              <CheckCircle className="size-8 text-emerald-500" />
            </div>
            <h3 className="font-display text-xl font-bold text-fg">Semua Bersih!</h3>
            <p className="mt-1 max-w-sm text-sm text-muted">Tidak ada pendaftaran mitra baru yang menunggu verifikasi saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface/50 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-6 py-4">Nama Mitra</th>
                  <th className="px-6 py-4">Kontak</th>
                  <th className="px-6 py-4">Tanggal Daftar</th>
                  <th className="px-6 py-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {pendingList.map((seller) => (
                  <tr key={seller.id} className="transition hover:bg-surface/50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-fg">{seller.profile?.full_name || 'Tanpa Nama'}</p>
                      <p className="text-xs text-muted">{seller.email}</p>
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {seller.profile?.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {new Date(seller.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleVerify(seller.id, true)}
                          disabled={actionLoading === seller.id}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                        >
                          {actionLoading === seller.id ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />} 
                          Setujui
                        </button>
                        <button
                          onClick={() => handleVerify(seller.id, false)}
                          disabled={actionLoading === seller.id}
                          className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
                        >
                          {actionLoading === seller.id ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />} 
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