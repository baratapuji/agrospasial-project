import type { Metadata } from 'next';
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--f-display' });
const body = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--f-body' });

export const metadata: Metadata = {
  title: 'AgroSpasial: peta lahan & hasil tani langsung dari petani',
  description: 'Lihat sebaran lahan garapan dan toko mitra di peta, lalu beli hasil tani tanpa tengkulak.',
};

// Pasang tema sebelum render agar tidak berkedip
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      {/* suppressHydrationWarning: ekstensi browser sering menambah atribut ke <body> */}
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key="Mid-client-UXWDae7yeKYtv1V4"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}