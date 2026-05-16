'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const user = useAppStore(s => s.user);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(user?.onboardingComplete ? '/dashboard' : '/onboarding');
    }, 1200);
    return () => clearTimeout(timer);
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
        style={{ background: 'var(--color-green)' }}
      />

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Logo mark */}
        <motion.div
          className="w-20 h-20 rounded-3xl flex items-center justify-center relative"
          style={{
            background: 'rgba(0,255,148,0.12)',
            border: '1.5px solid rgba(0,255,148,0.3)',
            boxShadow: '0 0 40px rgba(0,255,148,0.2)',
          }}
          animate={{ boxShadow: ['0 0 40px rgba(0,255,148,0.2)', '0 0 60px rgba(0,255,148,0.4)', '0 0 40px rgba(0,255,148,0.2)'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Zap size={40} className="fill-current" style={{ color: 'var(--color-green)' }} />
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-gradient-green">Fuel</span>
            <span style={{ color: 'var(--color-text-1)' }}>Ready</span>
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--color-text-3)' }}>
            AI Workout Readiness Coach
          </p>
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-1.5 mt-4"
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--color-green)' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
