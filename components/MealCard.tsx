'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Clock, Zap, Beef, Wheat, Droplets } from 'lucide-react';
import { useState } from 'react';
import type { FoodEntry } from '@/types';
import { formatTime, minutesSince } from '@/lib/utils';

interface MealCardProps {
  entry: FoodEntry;
  onRemove?: (id: string) => void;
}

const HEAVINESS_COLORS = {
  light: { bg: 'rgba(0,255,148,0.08)', text: '#00FF94', label: 'Light' },
  medium: { bg: 'rgba(255,107,53,0.08)', text: '#FF6B35', label: 'Medium' },
  heavy: { bg: 'rgba(255,59,92,0.08)', text: '#FF3B5C', label: 'Heavy' },
};

function MacroBadge({ icon: Icon, value, unit, color }: { icon: any; value: number; unit: string; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <Icon size={11} style={{ color }} />
      <span className="text-xs font-semibold" style={{ color }}>{value}{unit}</span>
    </div>
  );
}

export default function MealCard({ entry, onRemove }: MealCardProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [removing, setRemoving] = useState(false);
  const { analysis } = entry;
  const hw = HEAVINESS_COLORS[analysis.heaviness];
  const minsAgo = minutesSince(entry.timestamp);
  const timeLabel = minsAgo < 1 ? 'Just now' : minsAgo < 60 ? `${minsAgo}m ago` : `${Math.floor(minsAgo / 60)}h ${minsAgo % 60}m ago`;

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
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) handleRemove();
          }}
          onDrag={(_, info) => setSwipeX(info.offset.x)}
          className="relative overflow-hidden rounded-2xl mb-3 cursor-grab active:cursor-grabbing"
        >
          {/* Delete background */}
          <div
            className="absolute inset-0 flex items-center justify-end pr-4 rounded-2xl"
            style={{ background: 'rgba(255,59,92,0.15)', opacity: Math.abs(swipeX) / 80 }}
          >
            <Trash2 size={20} className="text-red" />
          </div>

          {/* Card content */}
          <div className="glass rounded-2xl p-4 relative">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-1 text-sm leading-snug truncate">{entry.text}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-1">
                    <Clock size={11} style={{ color: 'var(--color-text-3)' }} />
                    <span className="text-[11px]" style={{ color: 'var(--color-text-3)' }}>{formatTime(entry.timestamp)} · {timeLabel}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: hw.bg, color: hw.text }}
                >
                  {hw.label}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--color-text-3)' }}>
                  ~{analysis.estimatedCalories} cal
                </span>
              </div>
            </div>

            {/* Macros row */}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
              <MacroBadge icon={Beef} value={analysis.proteinG} unit="g P" color="#00FF94" />
              <MacroBadge icon={Wheat} value={analysis.carbsG} unit="g C" color="#FF6B35" />
              <MacroBadge icon={Droplets} value={analysis.fatG} unit="g F" color="#8B92A5" />

              {/* Digestion bar */}
              <div className="flex-1 ml-auto">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>Digestion</span>
                  <div className="w-16 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: analysis.heaviness === 'heavy' ? 'var(--color-red)' : analysis.heaviness === 'medium' ? 'var(--color-orange)' : 'var(--color-green)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${100 - analysis.digestionLoadScore}%` }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                    />
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
