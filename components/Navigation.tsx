'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, UtensilsCrossed, Zap, History, Settings, Sparkles } from 'lucide-react';

const TABS = [
  { href: '/dashboard', icon: Home,           label: 'Home' },
  { href: '/log',       icon: UtensilsCrossed, label: 'Log' },
  { href: '/fuel',      icon: Sparkles,        label: 'Fuel' },
  { href: '/train',     icon: Zap,             label: 'Train' },
  { href: '/history',   icon: History,         label: 'History' },
  { href: '/settings',  icon: Settings,        label: 'Settings' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      <div
        className="glass border-t border-[rgba(255,255,255,0.06)] safe-bottom"
        style={{ background: 'rgba(8,11,18,0.88)', backdropFilter: 'blur(28px)' }}
      >
        <div className="flex items-center justify-around px-1 pt-2 pb-1">
          {TABS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center gap-0.5 px-2 py-2 rounded-2xl transition-colors"
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'rgba(0,255,148,0.08)', border: '1px solid rgba(0,255,148,0.15)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <div
                  className="relative z-10 transition-all"
                  style={{
                    color: active ? 'var(--color-green)' : 'var(--color-text-3)',
                    filter: active ? 'drop-shadow(0 0 5px rgba(0,255,148,0.6))' : 'none',
                    transform: active ? 'translateY(-1px)' : 'translateY(0)',
                  }}
                >
                  <Icon size={20} />
                </div>

                <span
                  className="relative z-10 text-[9px] font-medium transition-colors"
                  style={{ color: active ? 'var(--color-green)' : 'var(--color-text-3)' }}
                >
                  {label}
                </span>

                {active && (
                  <motion.div
                    layoutId="nav-dot"
                    className="relative z-10 rounded-full"
                    style={{ width: 3, height: 3, background: 'var(--color-green)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
