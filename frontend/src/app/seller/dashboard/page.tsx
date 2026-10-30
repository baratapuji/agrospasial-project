'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  Store, Package, MapPin, DollarSign, PlusCircle, 
  ShieldCheck, LogOut, Award, AlertCircle, Loader2 
} from 'lucide-react';

export default function SellerDashboardPage() {
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  // Form State untuk Tambah Produk
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productUnit, setProductUnit] = useState('Kg');
  const [productWeight, setProductWeight] = useState('1000');
  const [productDesc, setProductDesc] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isHighlight, setIsHighlight] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchDashboardData(token);
    fetchCategories(token);
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    try {
      const res = await axios.get('http://localhost:5000/api/seller/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const shopData = res.data.data.shop;
        
        // Proteksi: Jika belum selesai onboarding (< 4), arahkan kembali ke onboarding
        if (!shopData || shopData.onboarding_step < 4) {
          router.push('/seller/onboarding');
          return;
        }

        setShop(shopData);
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        router.push('/seller/onboarding');
        return;
      }
      console.error('Gagal memuat dashboard seller:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (token: string) => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      if (res.data.success) {
        setCategories(res.data.data);
        if (res.data.data.length > 0) setSelectedCategory(res.data.data[0].id);
      }
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/seller/products',
        {
          name: productName,
          price: productPrice,
          stock: productStock,
          unitType: productUnit,
          weightGrams: productWeight,
          description: productDesc,
          categoryId: selectedCategory,
          isHighlight: isHighlight,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert('Produk komoditas berhasil ditambahkan!');
        setProductName('');
        setProductPrice('');
        setProductStock('');
        setProductDesc('');
        setIsHighlight(false);
        if (token) fetchDashboardData(token);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan produk. Periksa batas kuota tier Anda.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium">Memuat Dashboard Mitra Tani...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-12">
      {/* Navbar Atas */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-bold text-emerald-700 text-lg">
          <Store className="w-6 h-6" /> AgroSpasial Seller Center
        </div>
        <button 
          onClick={handleLogout} 
          className="text-rose-600 hover:text-rose-700 flex items-center gap-1.5 text-sm font-semibold transition"
        >
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        
        {/* Banner Status Verifikasi & Tier */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-kunyit-400 text-padi-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                Tier: {shop?.tier}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${shop?.is_verified ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                {shop?.is_verified ? '✓ Toko Terverifikasi Admin' : '⏳ Menunggu Verifikasi Admin'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold">{shop?.name}</h1>
            <p className="text-emerald-200 text-sm mt-1">{shop?.description || 'Belum ada deskripsi toko.'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 text-right">
            <div className="text-xs text-emerald-200 uppercase font-bold">Komisi Platform</div>
            <div className="text-xl font-black text-kunyit-400">{shop?.commission_rate ? shop.commission_rate * 100 : 5}% per transaksi</div>
          </div>
        </div>

        {/* Ringkasan Statistik Kartu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-emerald-100 text-emerald-700 rounded-xl">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Total Produk</div>
              <div className="font-bold text-slate-800 text-xl">{shop?.products?.length || 0} Komoditas</div>
              <span className="text-xs text-slate-500">Batas sesuai tier aktif</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-blue-100 text-blue-700 rounded-xl">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Saldo Dompet</div>
              <div className="font-bold text-slate-800 text-xl">Rp {Number(shop?.wallet_balance || 0).toLocaleString()}</div>
              <span className="text-xs text-slate-500">Siap ditarik</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-purple-100 text-purple-700 rounded-xl">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Aset Spasial Peta</div>
              <div className="font-bold text-slate-800 text-xl">{shop?.spatial_assets?.length || 0} Titik/Lahan</div>
              <span className="text-xs text-slate-500">Terdaftar di WebGIS</span>
            </div>
          </div>
        </div>

        {/* Kelola Produk & Form Tambah Produk */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Tambah Produk */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1 h-fit">
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" /> Tambah Komoditas Baru
            </h3>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Komoditas</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Contoh: Beras Organik Ciherang 5kg"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="65000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stok</label>
                  <input
                    type="number"
                    required
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    placeholder="50"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Satuan Unit</label>
                  <input
                    type="text"
                    required
                    value={productUnit}
                    onChange={(e) => setProductUnit(e.target.value)}
                    placeholder="Kg / Karung / Ikat"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Berat (Grams)</label>
                  <input
                    type="number"
                    required
                    value={productWeight}
                    onChange={(e) => setProductWeight(e.target.value)}
                    placeholder="1000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="highlight"
                  checked={isHighlight}
                  onChange={(e) => setIsHighlight(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="highlight" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Jadikan Produk Highlight (Unggulan) ⭐
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi</label>
                <textarea
                  rows={3}
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  placeholder="Keterangan kualitas dan kesegaran komoditas..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan & Publikasikan Produk'}
              </button>
            </form>
          </div>

          {/* Tabel Katalog Produk Toko */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" /> Katalog Komoditas Toko Anda
            </h3>

            {shop?.products?.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
                <AlertCircle className="w-8 h-8 text-slate-300" />
                <span>Belum ada komoditas yang ditambahkan. Gunakan form di samping untuk mulai berjualan.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                      <th className="py-3 px-4">Nama Komoditas</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Harga</th>
                      <th className="py-3 px-4">Stok</th>
                      <th className="py-3 px-4 text-center">Highlight</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {shop.products.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {p.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">{p.category?.name}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-700">Rp {Number(p.price).toLocaleString()}</td>
                        <td className="py-3 px-4 text-slate-600">{p.stock} {p.unit_type}</td>
                        <td className="py-3 px-4 text-center">
                          {p.is_highlight ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">⭐ Highlight</span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {p.is_active ? 'Aktif' : 'Nonaktif'}
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

      </div>
    </main>
  );
}