'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  Users, Lock, Unlock, Loader2, 
  ShieldAlert, ShieldCheck, Store, User
} from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUsers(token);
  }, [router]);

  const fetchUsers = async (token: string) => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/users/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat data pengguna:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Ubah status akun menjadi ${newStatus.toUpperCase()}?`)) return;

    const token = localStorage.getItem('token');
    setActionLoadingId(userId); // Set loading untuk baris ini
    
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/users/admin/status/${userId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        if (token) fetchUsers(token);
      }
    } catch (err) {
      alert('Gagal mengubah status akun.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Halaman */}
      <div>
        <h1 className="font-display text-3xl font-bold text-fg">Manajemen Pengguna</h1>
        <p className="mt-1 text-sm text-muted">Kelola akses akun Admin, Mitra Penjual, dan Pembeli di platform.</p>
      </div>

      {/* Tabel Pengguna */}
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-line p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-fg">
              <Users className="size-5 text-kunyit-500" /> Daftar Seluruh Pengguna
            </h2>
            <p className="mt-1 text-sm text-muted">Pantau aktivitas dan status keamanan akun pengguna.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-kunyit-400/10 px-3 py-1.5 text-xs font-bold text-kunyit-600 dark:text-kunyit-400">
            {users.length} Pengguna Total
          </span>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted">
            <Loader2 className="mb-4 size-8 animate-spin text-kunyit-500" />
            <p>Memuat data pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full border border-line bg-surface/50">
              <Users className="size-8 text-muted" />
            </div>
            <h3 className="font-display text-xl font-bold text-fg">Belum Ada Pengguna</h3>
            <p className="mt-1 text-sm text-muted">Belum ada akun yang terdaftar di platform.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface/50 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-6 py-4">Email / Akun</th>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Aksi Kontrol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="transition hover:bg-surface/50">
                    
                    {/* Email */}
                    <td className="px-6 py-4 font-bold text-fg">{u.email}</td>
                    
                    {/* Nama Lengkap */}
                    <td className="px-6 py-4 text-muted">
                      {u.profile?.full_name || <span className="italic opacity-50">Belum diisi</span>}
                    </td>

                    {/* Role Badge */}
                    <td className="px-6 py-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                          <ShieldCheck className="size-3.5" /> Admin
                        </span>
                      ) : u.role === 'seller' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-kunyit-400/10 px-2.5 py-1 text-xs font-bold text-kunyit-600 dark:text-kunyit-400">
                          <Store className="size-3.5" /> Seller
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                          <User className="size-3.5" /> Buyer
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                        u.status_akun === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {u.status_akun === 'active' ? 'Aktif' : 'Suspended'}
                      </span>
                    </td>

                    {/* Aksi Kontrol */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleStatusChange(u.id, u.status_akun)}
                        disabled={actionLoadingId === u.id}
                        className={`mx-auto flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-50 ${
                          u.status_akun === 'active'
                            ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400'
                            : 'bg-kunyit-400 text-padi-950 hover:bg-kunyit-500'
                        }`}
                      >
                        {actionLoadingId === u.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : u.status_akun === 'active' ? (
                          <Lock className="size-3.5" />
                        ) : (
                          <Unlock className="size-3.5" />
                        )}
                        {u.status_akun === 'active' ? 'Suspend' : 'Aktifkan'}
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