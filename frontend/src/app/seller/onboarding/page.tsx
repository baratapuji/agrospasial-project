'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  Store, ShieldCheck, MapPin, CheckCircle2, ArrowRight, ArrowLeft, 
  Sparkles, Award, Layers, Building2, Loader2, CreditCard 
} from 'lucide-react';

// Deklarasi global untuk Midtrans Snap
declare global {
  interface Window {
    snap: any;
  }
}

export default function SellerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Profil, 2: Pilih Tier, 3: Spasial
  const [loading, setLoading] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);

  // Form Step 1
  const [shopName, setShopName] = useState('');
  const [shopDesc, setShopDesc] = useState('');

  // Form Step 2: Tier Toko
  const [selectedTier, setSelectedTier] = useState<'SILVER' | 'GOLD' | 'LUXURY'>('SILVER');

  // Form Step 3: Spasial
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchInitialData(token);
  }, [router]);

  const fetchInitialData = async (token: string) => {
    try {
      const res = await axios.get('http://localhost:5000/api/seller/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && res.data.data.shop) {
        const shop = res.data.data.shop;
        setShopId(shop.id);
        setShopName(shop.name || '');
        setShopDesc(shop.description || '');
        if (shop.onboarding_step > 1) {
          setStep(shop.onboarding_step);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data toko:', err);
    }
  };

  // Step 1: Simpan Profil Toko
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/seller/onboarding/shop',
        { name: shopName, description: shopDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setShopId(res.data.data.id);
        setStep(2);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan profil toko.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Pilih Tier & Integrasi Midtrans untuk Gold / Luxury
  const handleStep2 = async () => {
    if (!shopId) return;
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      // Jika pilih SILVER (Gratis), langsung update tier dan lanjut ke step 3
      if (selectedTier === 'SILVER') {
        await axios.patch(
          'http://localhost:5000/api/seller/onboarding/tier',
          { shopId, tierType: 'SILVER' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStep(3);
        setLoading(false);
        return;
      }

      // Jika pilih GOLD atau LUXURY, buat transaksi pembayaran via Midtrans
      // Harga contoh: Gold = Rp 50.000, Luxury = Rp 150.000
      const price = selectedTier === 'GOLD' ? 50000 : 150000;

      const resPayment = await axios.post(
        'http://localhost:5000/api/payments/create-tier-charge',
        { shopId, tierType: selectedTier, amount: price },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const snapToken = resPayment.data.data.snapToken;

      // Panggil Midtrans Snap Popup
      window.snap.pay(snapToken, {
        onSuccess: async function (result: any) {
          alert('Pembayaran Berhasil! Tier Anda telah ditingkatkan.');
          // Update tier di database setelah bayar sukses
          await axios.patch(
            'http://localhost:5000/api/seller/onboarding/tier',
            { shopId, tierType: selectedTier },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setStep(3);
        },
        onPending: function (result: any) {
          alert('Menunggu pembayaran Anda...');
          console.log(result);
        },
        onError: function (result: any) {
          alert('Pembayaran gagal. Silakan coba lagi.');
          console.log(result);
        },
        onClose: function () {
          alert('Anda menutup popup pembayaran sebelum selesai.');
        }
      });

    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal memproses pilihan tier/pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Selesaikan Spasial & Onboarding
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const geomPoint = { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] };
      await axios.post(
        'http://localhost:5000/api/seller/spatial',
        { assetType: 'POINT', geom: geomPoint },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await axios.post(
        'http://localhost:5000/api/seller/onboarding/finish',
        { shopId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert('Proses onboarding selesai! Toko Anda menunggu verifikasi Admin.');
        router.push('/seller/dashboard');
      }
    } catch (err) {
      alert('Gagal menyelesaikan proses onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-4 py-1.5 rounded-full mb-3">
            <Sparkles className="w-4 h-4 text-emerald-600" /> Onboarding Mitra Tani AgroSpasial
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Siapkan Toko & Lahan Pertanian Anda</h1>
          <p className="text-slate-500 text-sm mt-2">Selesaikan 3 langkah singkat di bawah ini.</p>
        </div>

        {/* Stepper Wizard Indicator */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>1</div>
            <span className="text-xs sm:text-sm">Profil Toko</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-200 mx-4"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>2</div>
            <span className="text-xs sm:text-sm">Pilih Tier & Bayar</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-200 mx-4"></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>3</div>
            <span className="text-xs sm:text-sm">Lokasi Spasial</span>
          </div>
        </div>

        {/* STEP 1: PROFIL */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" /> Informasi Dasar Toko / Kelompok Tani
            </h2>
            <form onSubmit={handleStep1} className="space-y-5 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Toko</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Contoh: Kelompok Tani Makmur"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Deskripsi</label>
                <textarea
                  rows={4}
                  required
                  value={shopDesc}
                  onChange={(e) => setShopDesc(e.target.value)}
                  placeholder="Komoditas utama..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Lanjut ke Pemilihan Tier <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: PILIH TIER DENGAN HARGA & MIDTRANS */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" /> Pilih Paket & Badge Kemitraan Toko
            </h2>
            <p className="text-slate-500 text-sm mb-6">Pilih paket Gold atau Luxury untuk integrasi pembayaran otomatis via Midtrans Sandbox.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Silver */}
              <div
                onClick={() => setSelectedTier('SILVER')}
                className={`cursor-pointer rounded-2xl p-6 border-2 transition-all relative ${
                  selectedTier === 'SILVER' ? 'border-emerald-600 bg-emerald-50/30 ring-2' : 'border-slate-200'
                }`}
              >
                <div className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full w-fit mb-3">SILVER</div>
                <div className="text-lg font-extrabold text-slate-800">Free Starter</div>
                <div className="text-2xl font-black text-emerald-700 my-2">Rp 0 <span className="text-xs text-slate-500">/ selamanya</span></div>
                <p className="text-xs text-slate-500 mt-2">Komisi 5% • Batas 4 Produk</p>
              </div>

              {/* Gold */}
              <div
                onClick={() => setSelectedTier('GOLD')}
                className={`cursor-pointer rounded-2xl p-6 border-2 transition-all relative ${
                  selectedTier === 'GOLD' ? 'border-amber-500 bg-amber-50/30 ring-2' : 'border-slate-200'
                }`}
              >
                <div className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full w-fit mb-3">GOLD POPULER</div>
                <div className="text-lg font-extrabold text-slate-800">Growth Farmer</div>
                <div className="text-2xl font-black text-amber-600 my-2">Rp 50.000 <span className="text-xs text-slate-500">/ bulan</span></div>
                <p className="text-xs text-slate-500 mt-2">Komisi 3% • Batas 8 Produk + 3 Highlight</p>
              </div>

              {/* Luxury */}
              <div
                onClick={() => setSelectedTier('LUXURY')}
                className={`cursor-pointer rounded-2xl p-6 border-2 transition-all relative ${
                  selectedTier === 'LUXURY' ? 'border-purple-600 bg-purple-50/30 ring-2' : 'border-slate-200'
                }`}
              >
                <div className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-1 rounded-full w-fit mb-3">LUXURY PRO</div>
                <div className="text-lg font-extrabold text-slate-800">Eksklusif Pro</div>
                <div className="text-2xl font-black text-purple-700 my-2">Rp 150.000 <span className="text-xs text-slate-500">/ bulan</span></div>
                <p className="text-xs text-slate-500 mt-2">Komisi 1.5% • Batas 12 Produk + Banner</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 border border-slate-300 text-slate-700 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali
              </button>
              <button
                type="button"
                onClick={handleStep2}
                disabled={loading}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-4 h-4" /> {selectedTier === 'SILVER' ? 'Lanjut Tanpa Bayar' : `Bayar & Upgrade (${selectedTier})`}</>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SPASIAL */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Tentukan Koordinat Titik Toko Tani
            </h2>
            <form onSubmit={handleStep3} className="space-y-5 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Latitude</label>
                  <input
                    type="text"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="-4.8214"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Longitude</label>
                  <input
                    type="text"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="104.8856"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Selesaikan Onboarding <ShieldCheck className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}