'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useMemo } from 'react';
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
    glow: 'rgba(0,255,148,0.22)',
    trackColor: 'rgba(0,255,148,0.12)',
    label: 'READY',
    mood: 'happy' as const,
  },
  WAIT: {
    color: '#FF6B35',
    glow: 'rgba(255,107,53,0.22)',
    trackColor: 'rgba(255,107,53,0.12)',
    label: 'WAIT',
    mood: 'wait' as const,
  },
  EAT_FIRST: {
    color: '#FF3B5C',
    glow: 'rgba(255,59,92,0.22)',
    trackColor: 'rgba(255,59,92,0.12)',
    label: 'EAT FIRST',
    mood: 'hungry' as const,
  },
};

const SIZE_CONFIG = {
  sm:  { outer: 120, inner: 88,  stroke: 5,  fontSize: 34, labelSize: 9,  face: 22 },
  md:  { outer: 180, inner: 138, stroke: 7,  fontSize: 52, labelSize: 10, face: 28 },
  lg:  { outer: 252, inner: 188, stroke: 10, fontSize: 78, labelSize: 11, face: 36 },
};

export default function ReadinessOrb({ score, status, size = 'lg', pulse = true }: ReadinessOrbProps) {
  const config = STATUS_CONFIG[status];
  const dim = SIZE_CONFIG[size];
  // Prototype: r = outer/2 - stroke - 6
  const radius = (dim.outer / 2) - dim.stroke - 6;
  const circumference = 2 * Math.PI * radius;

  const filterId = useMemo(() => `fuely-orb-${Math.random().toString(36).slice(2, 8)}`, []);
  const gradId = `${filterId}-grad`;
  const glowId = `${filterId}-glow`;

  const displayScore = useMotionValue(0);
  const roundedScore = useTransform(displayScore, v => Math.round(v));

  useEffect(() => {
    const controls = animate(displayScore, score, { duration: 1.2, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [score, displayScore]);

  const dashOffset = circumference - (score / 100) * circumference;
  const bezelR = dim.outer / 2 - 2;

  // 40 tick marks
  const ticks = Array.from({ length: 40 }, (_, i) => {
    const angle = (i / 40) * Math.PI * 2;
    const major = i % 10 === 0;
    const inset = major ? 13 : 6;
    const x1 = dim.outer / 2 + (radius - dim.stroke / 2 - 3) * Math.cos(angle);
    const y1 = dim.outer / 2 + (radius - dim.stroke / 2 - 3) * Math.sin(angle);
    const x2 = dim.outer / 2 + (radius - dim.stroke / 2 - inset) * Math.cos(angle);
    const y2 = dim.outer / 2 + (radius - dim.stroke / 2 - inset) * Math.sin(angle);
    return { x1, y1, x2, y2, major };
  });

  return (
    <div
      style={{
        position: 'relative',
        width: dim.outer,
        height: dim.outer,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Ambient glow */}
      {pulse && (
        <div
          style={{
            position: 'absolute',
            inset: -dim.outer * 0.18,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${config.glow} 0%, transparent 60%)`,
            animation: 'fuely-pulse 3.4s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Soft inner aura */}
      <div
        style={{
          position: 'absolute',
          width: dim.inner + 14,
          height: dim.inner + 14,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${config.color}26 0%, transparent 60%)`,
          animation: 'fuely-breathe 4.5s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Slowly rotating dot bezel */}
      <svg
        width={dim.outer}
        height={dim.outer}
        style={{
          position: 'absolute',
          inset: 0,
          animation: 'fuely-tick-spin 80s linear infinite',
          pointerEvents: 'none',
        }}
      >
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x = dim.outer / 2 + bezelR * Math.cos(angle);
          const y = dim.outer / 2 + bezelR * Math.sin(angle);
          const isMajor = i % 3 === 0;
          return (
            <circle
              key={i}
              cx={x} cy={y}
              r={isMajor ? 2.6 : 1.6}
              fill={config.color}
              opacity={isMajor ? 0.65 : 0.25}
            />
          );
        })}
      </svg>

      {/* Progress ring + tick marks */}
      <svg
        width={dim.outer}
        height={dim.outer}
        style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)', pointerEvents: 'none' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.color} />
            <stop offset="100%" stopColor={config.color} stopOpacity="0.65" />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={dim.outer / 2} cy={dim.outer / 2} r={radius}
          fill="none" stroke={config.trackColor} strokeWidth={dim.stroke}
        />

        {/* Tick marks behind progress */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={config.color}
            strokeWidth={t.major ? 1.4 : 0.7}
            strokeLinecap="round"
            opacity={t.major ? 0.45 : 0.1}
          />
        ))}

        {/* Progress arc */}
        <motion.circle
          cx={dim.outer / 2} cy={dim.outer / 2} r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={dim.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          filter={`url(#${glowId})`}
        />
      </svg>

      {/* FuelyMark — floating sticker at top-right */}
      {size === 'lg' && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 22,
            width: dim.face + 8,
            height: dim.face + 8,
            borderRadius: '50%',
            background: `${config.color}18`,
            border: `1.5px solid ${config.color}50`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(8deg)',
            animation: 'fuely-float 4s ease-in-out infinite',
            boxShadow: `0 6px 16px ${config.color}30`,
            zIndex: 10,
          }}
        >
          <FuelyMark size={dim.face} mood={config.mood} />
        </div>
      )}

      {/* Inner glass core */}
      <motion.div
        style={{
          position: 'relative',
          width: dim.inner,
          height: dim.inner,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.035)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255,255,255,0.075)',
          boxShadow: `inset 0 0 40px rgba(0,0,0,0.4), 0 0 1px ${config.color}40`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        animate={pulse ? { scale: [1, 1.01, 1] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* SCORE label */}
        <div style={{
          fontSize: 9,
          color: config.color,
          opacity: 0.5,
          letterSpacing: '0.24em',
          fontWeight: 600,
          marginBottom: 2,
          fontFamily: 'ui-monospace, monospace',
        }}>
          SCORE
        </div>

        {/* Big score number */}
        <motion.span
          style={{
            fontSize: dim.fontSize,
            lineHeight: 1,
            fontWeight: 600,
            color: config.color,
            letterSpacing: '-0.04em',
            fontVariantNumeric: 'tabular-nums',
            fontFamily: 'ui-monospace, monospace',
            textShadow: `0 0 20px ${config.color}55, 0 0 2px ${config.color}`,
          }}
        >
          {roundedScore}
        </motion.span>

        {/* Status pill */}
        <div style={{
          fontSize: dim.labelSize,
          color: config.color,
          fontWeight: 700,
          letterSpacing: '0.22em',
          marginTop: 10,
          padding: '4px 12px',
          borderRadius: 99,
          background: `${config.color}15`,
          border: `1px solid ${config.color}30`,
          fontFamily: 'ui-monospace, monospace',
        }}>
          {config.label}
        </div>
      </motion.div>
    </div>
  );
}
