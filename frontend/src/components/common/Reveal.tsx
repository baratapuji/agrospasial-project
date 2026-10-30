'use client';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/** Muncul saat masuk layar, memudar saat keluar; animasi ulang bila di-scroll balik. */
export default function Reveal({ children, delay = 0, className = '', from = 'up' }: {
  children: ReactNode; delay?: number; className?: string; from?: 'up' | 'left' | 'scale';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(true); return; }
    const io = new IntersectionObserver(([e]) => setShown(e.isIntersecting), { threshold: 0.12, rootMargin: '-6% 0px -6% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = from === 'left' ? '-translate-x-10' : from === 'scale' ? 'scale-95 translate-y-6' : 'translate-y-10';
  const style: CSSProperties = { transitionDelay: shown ? `${delay}ms` : '0ms' };
  return (
    <div ref={ref} style={style} className={`transition-all duration-700 ease-out will-change-transform ${shown ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : `opacity-0 ${hidden}`} ${className}`}>
      {children}
    </div>
  );
}