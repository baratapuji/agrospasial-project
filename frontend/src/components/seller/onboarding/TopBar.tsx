import Link from 'next/link';
import { Sprout } from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';
import LogoutButton from '@/components/common/LogoutButton';

export default function TopBar() {
  return (
    <div className="mx-auto mb-8 flex max-w-4xl items-center justify-between">
      <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-fg">
        <span className="grid size-8 place-items-center rounded-lg bg-tile text-kunyit-400"><Sprout className="size-[18px]" aria-hidden /></span>
        AgroSpasial
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LogoutButton />
      </div>
    </div>
  );
}