'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, Store, Loader2, 
  Receipt, CheckCircle2, Clock
} from 'lucide-react';

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchTransactions(token);
  }, [router]);

  const fetchTransactions = async (token: string) => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/orders/admin/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat rekap transaksi:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Halaman */}
      <div>
        <h1 className="font-display text-3xl font-bold text-fg">Transaksi & Pembayaran</h1>
        <p className="mt-1 text-sm text-muted">Pantau arus kas dan riwayat pesanan yang masuk ke platform.</p>
      </div>

      {/* Tabel Transaksi */}
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-line p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-fg">
              <CreditCard className="size-5 text-kunyit-500" /> Riwayat Transaksi Masuk
            </h2>
            <p className="mt-1 text-sm text-muted">Data terintegrasi langsung dengan payment gateway (Midtrans).</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-kunyit-400/10 px-3 py-1.5 text-xs font-bold text-kunyit-600 dark:text-kunyit-400">
            {orders.length} Transaksi Total
          </span>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted">
            <Loader2 className="mb-4 size-8 animate-spin text-kunyit-500" />
            <p>Memuat rekap pembayaran...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full border border-line bg-surface/50">
              <Receipt className="size-8 text-muted" />
            </div>
            <h3 className="font-display text-xl font-bold text-fg">Belum Ada Transaksi</h3>
            <p className="mt-1 text-sm text-muted">Saat ini belum ada pesanan atau pembayaran yang tercatat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface/50 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-6 py-4">No. Pesanan</th>
                  <th className="px-6 py-4">Toko Tujuan</th>
                  <th className="px-6 py-4">Total Nominal</th>
                  <th className="px-6 py-4 text-center">Status Bayar</th>
                  <th className="px-6 py-4 text-center">Status Pesanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {orders.map((ord) => (
                  <tr key={ord.id} className="transition hover:bg-surface/50">
                    
                    {/* No. Pesanan */}
                    <td className="px-6 py-4 font-mono font-bold text-fg">
                      {ord.order_number}
                    </td>

                    {/* Toko Tujuan */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-fg">
                        <Store className="size-4 text-kunyit-500" /> 
                        {ord.shop?.name || 'Toko'}
                      </div>
                    </td>

                    {/* Total Nominal */}
                    <td className="px-6 py-4 font-bold text-fg">
                      Rp {Number(ord.total_amount).toLocaleString('id-ID')}
                    </td>

                    {/* Status Pembayaran (Midtrans) */}
                    <td className="px-6 py-4 text-center">
                      {(ord.payment?.status === 'settlement' || ord.payment?.status === 'paid') ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" /> Lunas
                        </span>
                      ) : (ord.payment?.status === 'pending' || !ord.payment) ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <Clock className="size-3" /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400">
                          {ord.payment.status}
                        </span>
                      )}
                    </td>

                    {/* Status Pesanan */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase ${
                        ord.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        ord.status === 'canceled' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                        'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}>
                        {ord.status}
                      </span>
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