'use client';

import { motion } from 'framer-motion';
import type { ReadinessBreakdown } from '@/types';

interface BreakdownCardProps {
  breakdown: ReadinessBreakdown;
}

interface MetricProps {
  label: string;
  value: number;
  description: string;
  delay: number;
}

function Metric({ label, value, description, delay }: MetricProps) {
  const color = value >= 70 ? 'var(--color-green)' : value >= 40 ? 'var(--color-orange)' : 'var(--color-red)';

  return (
    <motion.div
      className="glass rounded-2xl p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-2)' }}>{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden mb-2">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: delay + 0.1, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-3)' }}>{description}</p>
    </motion.div>
  );
}

export default function BreakdownCard({ breakdown }: BreakdownCardProps) {
  const metrics = [
    {
      label: 'Digestion Clearance',
      value: breakdown.digestionLoad,
      description: 'How clear your gut is for high-intensity effort',
    },
    {
      label: 'Carb Availability',
      value: breakdown.carbAvailability,
      description: 'Usable glycogen ready for your muscles',
    },
    {
      label: 'Meal Timing',
      value: breakdown.mealTiming,
      description: 'How optimal your last meal timing is',
    },
    {
      label: 'Energy Readiness',
      value: breakdown.energyReadiness,
      description: 'Overall fuel stores and energy state',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((m, i) => (
        <Metric key={m.label} {...m} delay={i * 0.08} />
      ))}
    </div>
  );
}
