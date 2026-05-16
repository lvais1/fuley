'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import type { ReadinessStatus } from '@/types';
import { FuelyMark } from '@/components/FoodDoodles';

interface ReadinessOrbProps {
  score: number;
  status: ReadinessStatus;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

const STATUS_CONFIG = {
  READY: {
    color: '#00FF94',
    glowDim: 'rgba(0,255,148,0.1)',
    label: 'READY',
    trackColor: 'rgba(0,255,148,0.12)',
    gradEnd: '#00D4FF',
    mood: 'happy' as const,
  },
  WAIT: {
    color: '#FF6B35',
    glowDim: 'rgba(255,107,53,0.1)',
    label: 'WAIT',
    trackColor: 'rgba(255,107,53,0.12)',
    gradEnd: '#FFD93D',
    mood: 'wait' as const,
  },
  EAT_FIRST: {
    color: '#FF3B5C',
    glowDim: 'rgba(255,59,92,0.1)',
    label: 'EAT FIRST',
    trackColor: 'rgba(255,59,92,0.12)',
    gradEnd: '#FF6B35',
    mood: 'hungry' as const,
  },
};

const SIZE_CONFIG = {
  sm:  { outer: 120, inner: 88,  stroke: 6,  fontSize: 28, labelSize: 10, faceSize: 20 },
  md:  { outer: 180, inner: 136, stroke: 8,  fontSize: 44, labelSize: 11, faceSize: 28 },
  lg:  { outer: 240, inner: 188, stroke: 10, fontSize: 60, labelSize: 13, faceSize: 40 },
};

export default function ReadinessOrb({ score, status, size = 'lg', pulse = true }: ReadinessOrbProps) {
  const config = STATUS_CONFIG[status];
  const dim = SIZE_CONFIG[size];
  const radius = (dim.outer / 2) - dim.stroke;
  const circumference = 2 * Math.PI * radius;

  const gradId = `ring-grad-${status}`;
  const glowId = `ring-glow-${status}`;

  const displayScore = useMotionValue(0);
  const roundedScore = useTransform(displayScore, v => Math.round(v));

  useEffect(() => {
    const controls = animate(displayScore, score, {
      duration: 1.8,
      ease: [0.25, 0.1, 0.25, 1],
    });
    return controls.stop;
  }, [score, displayScore]);

  const dashOffset = circumference - (score / 100) * circumference;
  const innerR = radius - dim.stroke / 2 - 4;

  // 40 tick marks around the ring: major every 10th (at 4 cardinal positions)
  const ticks = Array.from({ length: 40 }, (_, i) => {
    const angle = (i / 40) * Math.PI * 2;
    const isMajor = i % 10 === 0;
    const len = isMajor ? 10 : 5;
    return {
      x1: dim.outer / 2 + innerR * Math.cos(angle),
      y1: dim.outer / 2 + innerR * Math.sin(angle),
      x2: dim.outer / 2 + (innerR - len) * Math.cos(angle),
      y2: dim.outer / 2 + (innerR - len) * Math.sin(angle),
      sw: isMajor ? 1.5 : 1,
      opacity: isMajor ? 0.45 : 0.15,
    };
  });

  return (
    <div className="relative flex items-center justify-center" style={{ width: dim.outer, height: dim.outer }}>
      {/* Ambient glow */}
      {pulse && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${config.glowDim} 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* SVG ring: gradient stroke + tick marks */}
      <svg
        width={dim.outer}
        height={dim.outer}
        className="absolute"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.color} />
            <stop offset="100%" stopColor={config.gradEnd} />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge>
              <feMergeNode in="b"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={dim.outer / 2}
          cy={dim.outer / 2}
          r={radius}
          fill="none"
          stroke={config.trackColor}
          strokeWidth={dim.stroke}
        />

        {/* Progress arc with gradient */}
        <motion.circle
          cx={dim.outer / 2}
          cy={dim.outer / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={dim.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
          filter={`url(#${glowId})`}
        />

        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1}
            x2={t.x2} y2={t.y2}
            stroke={config.color}
            strokeWidth={t.sw}
            opacity={t.opacity}
          />
        ))}
      </svg>

      {/* Inner glass circle */}
      <motion.div
        className="relative flex flex-col items-center justify-center rounded-full glass"
        style={{
          width: dim.inner,
          height: dim.inner,
          boxShadow: `inset 0 0 30px rgba(0,0,0,0.4), 0 0 1px ${config.color}40`,
        }}
        animate={pulse ? { scale: [1, 1.01, 1] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Soft inner aura */}
        <div
          style={{
            position: 'absolute',
            width: '65%',
            height: '65%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${config.glowDim} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Mascot face */}
        {size !== 'sm' && (
          <div style={{ marginBottom: 4, opacity: 0.75, position: 'relative' }}>
            <FuelyMark size={dim.faceSize} mood={config.mood} />
          </div>
        )}

        {/* Score number */}
        <motion.span
          className="font-black leading-none tabular-nums relative"
          style={{
            fontSize: dim.fontSize,
            color: config.color,
            lineHeight: 1,
            textShadow: `0 0 20px ${config.color}80`,
          }}
        >
          {roundedScore}
        </motion.span>

        {/* Status label */}
        <motion.span
          className="font-bold tracking-widest uppercase mt-1 relative"
          style={{ fontSize: dim.labelSize, color: config.color, opacity: 0.85, letterSpacing: '0.12em' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ delay: 0.8 }}
        >
          {config.label}
        </motion.span>
      </motion.div>
    </div>
  );
}
