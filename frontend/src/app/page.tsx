import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Marquee from '@/components/home/Marquee';
import MapExplorer from '@/components/home/MapExplorer';
import Steps from '@/components/home/Steps';
import Benefits from '@/components/home/Benefits';
import CTA from '@/components/home/CTA';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <MapExplorer />
        <Steps />
        <Benefits />
        <CTA />
      </main>
      <Footer />
    </>
  );
}