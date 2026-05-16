'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { TimelinePoint } from '@/types';

const TYPE_COLORS: Record<TimelinePoint['type'], string> = {
  now: '#8B92A5',
  improving: '#FF6B35',
  peak: '#00FF94',
  declining: '#4A5168',
};

const TYPE_LABELS: Record<TimelinePoint['type'], string> = {
  now: 'Now',
  improving: 'Rising',
  peak: 'Peak',
  declining: 'Fading',
};

interface Props {
  points: TimelinePoint[];
  optimalMinutes?: number;
}

export default function WorkoutTimeline({ points, optimalMinutes }: Props) {
  const maxScore = useMemo(() => Math.max(...points.map(p => p.score), 1), [points]);
  const peakPoint = useMemo(() => {
    const peaks = points.filter(p => p.type === 'peak');
    return peaks.length > 0 ? peaks.reduce((a, b) => (a.score > b.score ? a : b)) : null;
  }, [points]);

  if (points.length === 0) return null;

  return (
    <div className="rounded-3xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-3)' }}>
            Readiness Timeline
          </p>
          {peakPoint && (
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-green)' }}>
              Peak at +{peakPoint.minutesFromNow}min — score {peakPoint.score}
            </p>
          )}
        </div>
        {optimalMinutes !== undefined && (
          <div
            className="px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: 'rgba(0,255,148,0.12)', color: 'var(--color-green)' }}
          >
            Train in {optimalMinutes}m
          </div>
        )}
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-2 mb-3" style={{ height: 72 }}>
        {points.map((point, i) => {
          const heightPct = (point.score / 100) * 100;
          const color = TYPE_COLORS[point.type];
          const isPeak = point.type === 'peak';

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="relative w-full flex items-end" style={{ height: 60 }}>
                {/* Glow behind peak bar */}
                {isPeak && (
                  <div
                    className="absolute inset-x-0 bottom-0 rounded-t-lg opacity-30 blur-sm"
                    style={{
                      height: `${heightPct}%`,
                      background: color,
                    }}
                  />
                )}
                <motion.div
                  className="w-full rounded-t-lg relative"
                  style={{
                    background: isPeak
                      ? `linear-gradient(180deg, ${color} 0%, ${color}80 100%)`
                      : `${color}60`,
                    border: isPeak ? `1px solid ${color}80` : 'none',
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                >
                  {isPeak && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.07 + 0.4 }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                      style={{
                        background: color,
                        boxShadow: `0 0 8px ${color}`,
                      }}
                    />
                  )}
                </motion.div>
              </div>
              <span className="text-[9px] font-bold" style={{ color: point.minutesFromNow === 0 ? 'var(--color-text-2)' : color }}>
                {point.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Score labels */}
      <div className="flex gap-2 mb-3">
        {points.map((point, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[9px] font-semibold" style={{ color: TYPE_COLORS[point.type] }}>
              {point.score}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
        {(['now', 'improving', 'peak'] as const).map(type => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[type] }} />
            <span className="text-[9px] font-medium" style={{ color: 'var(--color-text-3)' }}>
              {TYPE_LABELS[type]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
