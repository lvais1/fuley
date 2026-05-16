'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useAppStore(s => s.settings);

  useEffect(() => {
    const root = document.documentElement;

    // Apply direction
    root.setAttribute('dir', settings.language === 'he' ? 'rtl' : 'ltr');
    root.setAttribute('lang', settings.language);

    // Apply theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = settings.theme === 'dark' || (settings.theme === 'system' && prefersDark);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [settings.theme, settings.language]);

  return <>{children}</>;
}
