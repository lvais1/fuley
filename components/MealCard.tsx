'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Clock } from 'lucide-react';
import { useState } from 'react';
import type { FoodEntry } from '@/types';
import { formatTime, minutesSince } from '@/lib/utils';
import { pickArt } from '@/components/FoodDoodles';

interface MealCardProps {
  entry: FoodEntry;
  onRemove?: (id: string) => void;
}

const HEAVINESS = {
  light:  { bg: 'rgba(0,255,148,0.08)',   text: '#00FF94', label: 'Light' },
  medium: { bg: 'rgba(255,107,53,0.08)',  text: '#FF6B35', label: 'Medium' },
  heavy:  { bg: 'rgba(255,59,92,0.08)',   text: '#FF3B5C', label: 'Heavy' },
};

function Macro({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-0.5">
      <span style={{ fontSize: 10, fontWeight: 800, color, opacity: 0.65 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}g</span>
    </div>
  );
}

export default function MealCard({ entry, onRemove }: MealCardProps) {
  const [removing, setRemoving] = useState(false);
  const { analysis } = entry;
  const hw = HEAVINESS[analysis.heaviness];
  const minsAgo = minutesSince(entry.timestamp);
  const timeLabel = minsAgo < 1 ? 'Just now' : minsAgo < 60 ? `${minsAgo}m ago` : `${Math.floor(minsAgo / 60)}h ${minsAgo % 60}m ago`;

  const FoodArt = pickArt(entry.text);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove?.(entry.id), 300);
  };

  return (
    <AnimatePresence>
      {!removing && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          drag="x"
          dragConstraints={{ left: -80, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => { if (info.offset.x < -60) handleRemove(); }}
          className="relative overflow-hidden rounded-2xl mb-3 cursor-grab active:cursor-grabbing"
        >
          {/* Delete reveal */}
          <div
            className="absolute inset-0 flex items-center justify-end pr-4 rounded-2xl"
            style={{ background: 'rgba(255,59,92,0.15)' }}
          >
            <Trash2 size={20} style={{ color: 'var(--color-red)' }} />
          </div>

          {/* Card */}
          <div className="glass rounded-2xl p-3.5 relative">
            <div className="flex items-start gap-3">
              {/* Food avatar */}
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-2xl"
                style={{
                  width: 54, height: 54,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <FoodArt size={42} />
              </div>

              <div className="flex-1 min-w-0">
                {/* Top row: name + heaviness chip */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-sm leading-snug truncate" style={{ color: 'var(--color-text-1)' }}>
                    {entry.text}
                  </p>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: hw.bg, color: hw.text }}
                  >
                    {hw.label}
                  </span>
                </div>

                {/* Time + calories */}
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock size={11} style={{ color: 'var(--color-text-3)' }} />
                  <span className="text-[11px]" style={{ color: 'var(--color-text-3)' }}>
                    {formatTime(entry.timestamp)} · {timeLabel}
                  </span>
                  <span className="text-[11px] ml-auto" style={{ color: 'var(--color-text-3)' }}>
                    ~{analysis.estimatedCalories} cal
                  </span>
                </div>

                {/* Macros + digestion bar */}
                <div
                  className="flex items-center gap-2.5 pt-2"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <Macro label="P" value={analysis.proteinG}  color="#00FF94" />
                  <Macro label="C" value={analysis.carbsG}    color="#FF6B35" />
                  <Macro label="F" value={analysis.fatG}      color="#8B92A5" />
                  <div className="flex-1" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>Digestion</span>
                    <div
                      className="rounded-full overflow-hidden"
                      style={{ width: 56, height: 5, background: 'rgba(255,255,255,0.06)' }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: hw.text }}
                        initial={{ width: 0 }}
                        animate={{ width: `${100 - analysis.digestionLoadScore}%` }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
