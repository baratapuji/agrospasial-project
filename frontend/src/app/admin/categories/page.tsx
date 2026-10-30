'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Tag, Loader2, PackageX } from 'lucide-react';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    fetchCategories();
  }, [router]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await axios.post(
        'http://localhost:5000/api/categories',
        { name, slug },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setName('');
        setSlug('');
        fetchCategories();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambah kategori.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini? Produk yang terkait mungkin akan terpengaruh.')) return;
    const token = localStorage.getItem('token');
    
    try {
      await axios.delete(`http://localhost:5000/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (err) {
      alert('Gagal menghapus kategori.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Halaman */}
      <div>
        <h1 className="font-display text-3xl font-bold text-fg">Kategori Komoditas</h1>
        <p className="mt-1 text-sm text-muted">Kelola klasifikasi produk pangan dan pertanian di platform.</p>
      </div>

      {/* Form Tambah Kategori */}
      <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
        <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-bold text-fg">
          <Tag className="size-5 text-kunyit-500" /> Tambah Kategori Baru
        </h2>
        
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">Nama Kategori</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
              }}
              placeholder="Contoh: Pupuk & Organik"
              className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-fg outline-none transition-all placeholder:text-muted/50 focus:border-kunyit-500 focus:ring-2 focus:ring-kunyit-500/20"
            />
          </div>
          
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">Slug (Otomatis)</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="pupuk-organik"
              className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-mono text-muted outline-none transition-all placeholder:text-muted/30 focus:border-kunyit-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              disabled={actionLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-kunyit-400 py-2.5 px-4 text-sm font-bold text-padi-950 shadow-sm transition-all hover:bg-kunyit-500 hover:shadow-[0_0_20px_rgba(242,182,50,0.3)] disabled:opacity-70"
            >
              {actionLoading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} 
              Simpan Kategori
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Daftar Kategori */}
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <div className="border-b border-line p-6 font-display text-lg font-bold text-fg">
          Daftar Kategori Aktif
        </div>
        
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted">
            <Loader2 className="mb-4 size-8 animate-spin text-kunyit-500" />
            <p>Memuat kategori...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full bg-surface/50 border border-line">
              <PackageX className="size-8 text-muted" />
            </div>
            <h3 className="font-display text-xl font-bold text-fg">Belum Ada Kategori</h3>
            <p className="mt-1 text-sm text-muted">Silakan tambahkan kategori pertama Anda melalui form di atas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface/50 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-6 py-4">Nama Kategori</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Produk Terkait</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {categories.map((cat) => (
                  <tr key={cat.id} className="transition hover:bg-surface/50">
                    <td className="px-6 py-4 font-bold text-fg">{cat.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-muted">/{cat.slug}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-kunyit-400/10 px-2.5 py-1 text-xs font-bold text-kunyit-600 dark:text-kunyit-400">
                        {cat._count?.products || 0} Produk
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="size-4" />
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