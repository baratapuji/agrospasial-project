'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, CheckCircle, XCircle, 
  Store, Loader2, PackageX 
} from 'lucide-react';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    fetchProducts(token);
  }, [router]);

  const fetchProducts = async (token: string) => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/products/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat produk:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    const token = localStorage.getItem('token');
    setActionLoadingId(productId); // Set loading untuk baris ini saja
    
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/products/admin/status/${productId}`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        if (token) fetchProducts(token);
      }
    } catch (err) {
      alert('Gagal mengubah status produk.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Halaman */}
      <div>
        <h1 className="font-display text-3xl font-bold text-fg">Moderasi Produk</h1>
        <p className="mt-1 text-sm text-muted">Tinjau dan kelola ketersediaan produk hasil tani yang dipublikasikan oleh mitra.</p>
      </div>

      {/* Tabel Produk */}
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-line p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-fg">
              <ShoppingBag className="size-5 text-kunyit-500" /> Katalog Seluruh Mitra
            </h2>
            <p className="mt-1 text-sm text-muted">Pastikan produk sesuai standar sebelum tayang di platform.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-kunyit-400/10 px-3 py-1.5 text-xs font-bold text-kunyit-600 dark:text-kunyit-400">
            {products.length} Produk Total
          </span>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted">
            <Loader2 className="mb-4 size-8 animate-spin text-kunyit-500" />
            <p>Memuat katalog produk...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full bg-surface/50 border border-line">
              <PackageX className="size-8 text-muted" />
            </div>
            <h3 className="font-display text-xl font-bold text-fg">Belum Ada Produk</h3>
            <p className="mt-1 text-sm text-muted">Saat ini belum ada mitra yang mengunggah produk.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface/50 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Toko / Mitra</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {products.map((prod) => (
                  <tr key={prod.id} className="transition hover:bg-surface/50">
                    
                    {/* Nama Produk */}
                    <td className="px-6 py-4 font-bold text-fg">{prod.name}</td>
                    
                    {/* Kategori */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-muted">
                        {prod.category?.name || 'Tanpa Kategori'}
                      </span>
                    </td>

                    {/* Toko / Mitra */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-fg">
                        <Store className="size-4 text-kunyit-500" /> {prod.shop?.name || 'Toko'}
                      </div>
                      <span className="mt-0.5 block text-xs text-muted">{prod.shop?.owner?.email}</span>
                    </td>

                    {/* Harga */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-fg">
                        Rp {prod.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs font-normal text-muted"> / {prod.unit_type}</span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      {prod.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="size-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400">
                          <XCircle className="size-3" /> Nonaktif
                        </span>
                      )}
                    </td>

                    {/* Aksi Moderasi */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(prod.id, prod.is_active)}
                        disabled={actionLoadingId === prod.id}
                        className={`mx-auto flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-50 ${
                          prod.is_active
                            ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400'
                            : 'bg-kunyit-400 text-padi-950 hover:bg-kunyit-500'
                        }`}
                      >
                        {actionLoadingId === prod.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : prod.is_active ? (
                          <XCircle className="size-3.5" />
                        ) : (
                          <CheckCircle className="size-3.5" />
                        )}
                        {prod.is_active ? 'Nonaktifkan' : 'Aktifkan'}
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