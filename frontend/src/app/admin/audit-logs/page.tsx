'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  History, User, Loader2, ShieldAlert, 
  Terminal, Clock, Fingerprint 
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchLogs(token);
  }, [router]);

  const fetchLogs = async (token: string) => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/audit/admin/logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat log audit:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Halaman */}
      <div>
        <h1 className="font-display text-3xl font-bold text-fg">Audit Trail</h1>
        <p className="mt-1 text-sm text-muted">Rekam jejak digital setiap tindakan administratif yang dilakukan di platform.</p>
      </div>

      {/* Tabel Log Audit */}
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-line p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-fg">
              <History className="size-5 text-kunyit-500" /> Log Keamanan Sistem
            </h2>
            <p className="mt-1 text-sm text-muted">Data ini bersifat <b>read-only</b> dan tidak dapat diubah.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
            <Terminal className="size-3.5" /> {logs.length} Aktivitas
          </span>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted">
            <Loader2 className="mb-4 size-8 animate-spin text-kunyit-500" />
            <p>Memuat log aktivitas...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full border border-line bg-surface/50">
              <ShieldAlert className="size-8 text-muted" />
            </div>
            <h3 className="font-display text-xl font-bold text-fg">Belum Ada Log</h3>
            <p className="mt-1 text-sm text-muted">Belum ada aktivitas administratif yang tercatat di sistem.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface/50 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-6 py-4">Waktu (Timestamp)</th>
                  <th className="px-6 py-4">Admin Eksekutor</th>
                  <th className="px-6 py-4">Aksi Sistem</th>
                  <th className="px-6 py-4">Target ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="transition hover:bg-surface/50">
                    
                    {/* Timestamp */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-mono text-xs text-muted">
                        <Clock className="size-3.5 opacity-50" />
                        {new Date(log.created_at).toLocaleString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* Admin Eksekutor */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-bold text-fg">
                        <div className="grid size-6 place-items-center rounded-full bg-padi-900 text-[10px] text-padi-50">
                          {log.admin?.email?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        {log.admin?.email || 'System Admin'}
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-xs font-semibold text-fg">
                        {log.action}
                      </span>
                    </td>

                    {/* Target ID */}
                    <td className="px-6 py-4">
                      {log.target_id ? (
                        <div className="flex items-center gap-1.5 font-mono text-xs text-muted max-w-[200px] truncate" title={log.target_id}>
                          <Fingerprint className="size-3.5 shrink-0 opacity-50" />
                          {log.target_id}
                        </div>
                      ) : (
                        <span className="text-muted opacity-50">-</span>
                      )}
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