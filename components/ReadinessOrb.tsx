'use client';

import { motion, useSpring, useTransform, useMotionValue, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { ReadinessStatus } from '@/types';

interface ReadinessOrbProps {
  score: number;
  status: ReadinessStatus;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

const STATUS_CONFIG = {
  READY: {
    color: '#00FF94',
    glow: 'rgba(0,255,148,0.4)',
    glowDim: 'rgba(0,255,148,0.1)',
    label: 'READY',
    ringColor: '#00FF94',
    trackColor: 'rgba(0,255,148,0.12)',
  },
  WAIT: {
    color: '#FF6B35',
    glow: 'rgba(255,107,53,0.4)',
    glowDim: 'rgba(255,107,53,0.1)',
    label: 'WAIT',
    ringColor: '#FF6B35',
    trackColor: 'rgba(255,107,53,0.12)',
  },
  EAT_FIRST: {
    color: '#FF3B5C',
    glow: 'rgba(255,59,92,0.4)',
    glowDim: 'rgba(255,59,92,0.1)',
    label: 'EAT FIRST',
    ringColor: '#FF3B5C',
    trackColor: 'rgba(255,59,92,0.12)',
  },
};

const SIZE_CONFIG = {
  sm: { outer: 120, inner: 88, stroke: 6, fontSize: 28, labelSize: 10 },
  md: { outer: 180, inner: 136, stroke: 8, fontSize: 44, labelSize: 11 },
  lg: { outer: 240, inner: 188, stroke: 10, fontSize: 60, labelSize: 13 },
};

export default function ReadinessOrb({ score, status, size = 'lg', pulse = true }: ReadinessOrbProps) {
  const config = STATUS_CONFIG[status];
  const dim = SIZE_CONFIG[size];
  const radius = (dim.outer / 2) - dim.stroke;
  const circumference = 2 * Math.PI * radius;
  const scoreRef = useRef(0);

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

      {/* Outer ring track */}
      <svg
        width={dim.outer}
        height={dim.outer}
        className="absolute -rotate-90"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <defs>
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
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

        {/* Progress ring */}
        <motion.circle
          cx={dim.outer / 2}
          cy={dim.outer / 2}
          r={radius}
          fill="none"
          stroke={config.color}
          strokeWidth={dim.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
          filter="url(#glow-filter)"
        />
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
        {/* Score number */}
        <motion.span
          className="font-black leading-none tabular-nums"
          style={{ fontSize: dim.fontSize, color: config.color, lineHeight: 1 }}
        >
          {roundedScore}
        </motion.span>

        {/* Status label */}
        <motion.span
          className="font-bold tracking-widest uppercase mt-1"
          style={{
            fontSize: dim.labelSize,
            color: config.color,
            opacity: 0.85,
            letterSpacing: '0.12em',
          }}
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
