import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto bg-padi-950 text-padi-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="font-display text-lg font-bold">AgroSpasial</p>
        <nav className="flex gap-6 text-sm text-padi-100/70" aria-label="Footer">
          <Link href="/login" className="hover:text-white">Masuk</Link>
          <Link href="/register" className="hover:text-white">Daftar akun</Link>
        </nav>
        <p suppressHydrationWarning className="text-sm text-padi-100/50">
          © 2026 AgroSpasial
        </p>
      </div>
    </footer>
  );
}