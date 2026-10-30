import { 
  LayoutDashboard, Users, Map, ShoppingBag, 
  Wallet, ShieldAlert 
} from 'lucide-react';

export const ADMIN_MENUS = [
  {
    title: 'Dashboard Utama',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
    children: null,
  },
  {
    title: 'Pengguna & Verifikasi',
    icon: Users,
    children: [
      { title: 'Verifikasi Mitra', href: '/admin/sellers/pending' },
      { title: 'Manajemen Akun', href: '/admin/users' },
    ],
  },
  {
    title: 'Aset Spasial & Peta',
    icon: Map,
    children: [
      { title: 'Monitoring Lahan', href: '/admin/spatial-layers' },
      { title: 'Validasi Koordinat', href: '/admin/spatial-layers/validation' },
    ],
  },
  {
    title: 'Katalog & Kategori',
    icon: ShoppingBag,
    children: [
      { title: 'Kategori Komoditas', href: '/admin/categories' },
      { title: 'Moderasi Produk', href: '/admin/products' },
    ],
  },
  {
    title: 'Keuangan & Transaksi',
    icon: Wallet,
    children: [
      { title: 'Rekap Pembayaran', href: '/admin/transactions' },
      { title: 'Log Pencairan Dana', href: '/admin/payouts' },
    ],
  },
  {
    title: 'Log & Keamanan',
    icon: ShieldAlert,
    children: [
      { title: 'Audit Trail', href: '/admin/audit-logs' },
      { title: 'Pengaturan CMS', href: '/admin/settings' },
    ],
  },
];