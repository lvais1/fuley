'use client';

import React from 'react';

type DoodleProps = { size?: number };

export function FriedEgg({ size = 56 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M14 36c-4-2-6-8-3-13s10-7 15-5 9 2 13 5 7 9 4 14-10 6-15 5-10 0-14-6z"
            stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" fill="rgba(255,255,255,0.04)" strokeLinejoin="round"/>
      <circle cx="33" cy="32" r="9" fill="#FF6B35" opacity="0.92"/>
      <circle cx="30" cy="29" r="2.5" fill="rgba(255,255,255,0.5)"/>
    </svg>
  );
}

export function RiceBowl({ size = 56 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M22 14c2-3 0-5 1-8M30 13c2-4-1-5 1-9M38 14c2-3 0-5 1-8"
            stroke="#00FF94" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      <path d="M10 30h44c0 12-10 22-22 22S10 42 10 30z"
            stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" fill="rgba(255,255,255,0.04)" strokeLinejoin="round"/>
      <ellipse cx="32" cy="30" rx="22" ry="3" stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" fill="#00FF94" fillOpacity="0.18"/>
      <ellipse cx="24" cy="28" rx="2" ry="1" fill="white"/>
      <ellipse cx="32" cy="29.5" rx="2" ry="1" fill="white"/>
      <ellipse cx="40" cy="28" rx="2" ry="1" fill="white"/>
      <ellipse cx="28" cy="30.5" rx="2" ry="1" fill="white"/>
      <ellipse cx="36" cy="30.5" rx="2" ry="1" fill="white"/>
    </svg>
  );
}

export function ChickenLeg({ size = 56 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M40 18c8 0 14 6 14 14s-6 14-14 14c-3 0-6-1-8-3l-8 8c-2 2-6 2-8 0s-2-6 0-8l8-8c-2-2-3-5-3-8 0-8 6-14 14-14 1.5 0 3 .2 5 1z"
            stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" fill="#FF6B35" fillOpacity="0.5" strokeLinejoin="round"/>
      <path d="M16 48l-4 4M18 50l-2 2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="42" cy="32" r="2" fill="rgba(255,255,255,0.4)"/>
    </svg>
  );
}

export function Banana({ size = 56 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M14 14c0 18 14 32 32 32 4 0 8-1 12-2-2 3-7 6-14 6-18 0-32-14-32-32 0-1 1-3 2-4z"
            stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" fill="#FFD93D" fillOpacity="0.85" strokeLinejoin="round"/>
      <path d="M14 14c0-2 0-4-1-5l4-1c1 1 1 4 0 6" stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" strokeLinejoin="round" fill="rgba(0,0,0,0.3)"/>
    </svg>
  );
}

export function ProteinShake({ size = 56 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="18" y="8" width="28" height="10" rx="3" stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" fill="rgba(255,255,255,0.06)"/>
      <path d="M16 18h32l-3 36c0 2-2 4-4 4H23c-2 0-4-2-4-4l-3-36z"
            stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" fill="rgba(255,255,255,0.04)" strokeLinejoin="round"/>
      <path d="M18 32h28l-2 22c0 1-1 2-2 2H22c-1 0-2-1-2-2l-2-22z" fill="#00D4FF" fillOpacity="0.55"/>
      <path d="M20 36c3 0 4-2 7-2s4 2 7 2 4-2 7-2 4 2 5 2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" fill="none"/>
    </svg>
  );
}

export function Toast({ size = 56 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M10 22c0-4 4-8 8-8s4 2 14 2 6-2 14-2 8 4 8 8v22c0 4-4 8-8 8H18c-4 0-8-4-8-8V22z"
            stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" fill="#FF6B35" fillOpacity="0.45" strokeLinejoin="round"/>
      <path d="M18 30c2 0 3 2 5 2s3-2 5-2M22 38c2 0 3 2 5 2s3-2 5-2M30 28c2 0 3 2 5 2s3-2 5-2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" fill="none"/>
    </svg>
  );
}

export function Apple({ size = 56 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M32 18c-3-4-12-3-14 4-2 6 0 18 6 24s14 6 16-2c2 8 10 8 16 2s8-18 6-24c-2-7-11-8-14-4-2 3-6 5-8 5s-6-2-8-5z"
            stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" fill="#FF3B5C" fillOpacity="0.7" strokeLinejoin="round"/>
      <path d="M32 18c0-4 2-8 4-10M30 14c-1-2-3-3-5-3" stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export function Yogurt({ size = 56 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M14 22h36l-3 30c0 2-2 4-4 4H21c-2 0-4-2-4-4l-3-30z"
            stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" fill="rgba(255,255,255,0.06)" strokeLinejoin="round"/>
      <rect x="12" y="18" width="40" height="8" rx="3" stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" fill="rgba(255,255,255,0.04)"/>
      <ellipse cx="32" cy="28" rx="14" ry="3" fill="#00FF94" fillOpacity="0.7"/>
      <circle cx="26" cy="32" r="1.4" fill="#FF3B5C"/>
      <circle cx="34" cy="34" r="1.4" fill="#FF3B5C"/>
      <circle cx="38" cy="30" r="1.4" fill="#FF3B5C"/>
    </svg>
  );
}

export function Salad({ size = 56 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M10 30h44c0 10-10 22-22 22S10 40 10 30z"
            stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" fill="rgba(255,255,255,0.04)" strokeLinejoin="round"/>
      <ellipse cx="32" cy="30" rx="22" ry="3" stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" fill="#00FF94" fillOpacity="0.18"/>
      <circle cx="20" cy="28" r="3" fill="#00FF94" opacity="0.8"/>
      <circle cx="30" cy="26" r="4" fill="#00FF94" opacity="0.7"/>
      <circle cx="40" cy="28" r="3" fill="#00FF94" opacity="0.8"/>
      <circle cx="26" cy="30" r="2" fill="#FF3B5C"/>
      <circle cx="36" cy="29" r="2" fill="#FF3B5C"/>
    </svg>
  );
}

export function Pasta({ size = 56 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M10 32h44c0 10-10 20-22 20S10 42 10 32z"
            stroke="rgba(255,255,255,0.9)" strokeWidth="2.2" fill="rgba(255,255,255,0.04)" strokeLinejoin="round"/>
      <path d="M14 30c4-2 6-6 4-12s2-6 6-2-2 14 4 14M24 30c4-2 6-6 4-12s2-6 6-2-2 14 4 14M34 30c4-2 6-6 4-12s2-6 6-2-2 14 4 14"
            stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9"/>
      <circle cx="26" cy="34" r="2" fill="#FF3B5C"/>
      <circle cx="36" cy="34" r="2" fill="#FF3B5C"/>
    </svg>
  );
}

export function FuelyMark({ size = 40, mood = 'happy' }: { size?: number; mood?: 'happy' | 'wait' | 'hungry' }) {
  const eye = mood === 'hungry' ? '#FF3B5C' : mood === 'wait' ? '#FF6B35' : '#080B12';
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M22 4L8 22h8l-2 14 14-18h-8l2-14z" fill="#00FF94"/>
      <circle cx="14.5" cy="20" r="1.4" fill={eye}/>
      <circle cx="20.5" cy="20" r="1.4" fill={eye}/>
      {mood === 'happy' && <path d="M15 23.5q2.5 1.5 5 0" stroke={eye} strokeWidth="1.1" strokeLinecap="round" fill="none"/>}
      {mood === 'wait' && <path d="M15.5 23.5h4" stroke={eye} strokeWidth="1.1" strokeLinecap="round" fill="none"/>}
      {mood === 'hungry' && <path d="M15.5 24q2-2 4 0" stroke={eye} strokeWidth="1.1" strokeLinecap="round" fill="none"/>}
    </svg>
  );
}

// ─── Workout icons ───────────────────────────────────────────────

export function PushIcon({ size = 32 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4l-2 4 2 6 2-6-2-4z" fill="#00FF94" opacity="0.7"/>
      <rect x="4" y="14" width="24" height="4" rx="2" fill="#00FF94" opacity="0.9"/>
      <rect x="2" y="11" width="3" height="10" rx="1" fill="#00FF94"/>
      <rect x="27" y="11" width="3" height="10" rx="1" fill="#00FF94"/>
    </svg>
  );
}

export function PullIcon({ size = 32 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M6 4h20" stroke="#FF6B35" strokeWidth="2.4" strokeLinecap="round"/>
      <circle cx="16" cy="10" r="2.5" fill="#FF6B35"/>
      <path d="M16 12v6M12 14l4 4 4-4M14 28l2-6 2 6" stroke="#FF6B35" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function LegsIcon({ size = 32 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="6" r="3" fill="#FF3B5C"/>
      <path d="M16 10v6l-4 8M16 16l4 8M11 24l-1 4M21 24l1 4" stroke="#FF3B5C" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export function FullBodyIcon({ size = 32 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="6" r="3" fill="#00D4FF"/>
      <path d="M16 10v10M8 14l8-2 8 2M12 28l4-8 4 8" stroke="#00D4FF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function CardioIcon({ size = 32 }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M4 16l5 0 2-5 4 10 3-7 2 2h8" stroke="#FF3B5C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function WorkoutIcon({ type, size = 16 }: { type: string; size?: number }) {
  const map: Record<string, React.ReactNode> = {
    push:      <PushIcon size={size}/>,
    pull:      <PullIcon size={size}/>,
    legs:      <LegsIcon size={size}/>,
    full_body: <FullBodyIcon size={size}/>,
    cardio:    <CardioIcon size={size}/>,
  };
  return <>{map[type] || map.full_body}</>;
}

export function pickArt(text: string): React.ComponentType<DoodleProps> {
  const t = text.toLowerCase();
  if (/(toast|bread)/.test(t)) return Toast;
  if (/egg/.test(t)) return FriedEgg;
  if (/chicken/.test(t)) return ChickenLeg;
  if (/(rice|bowl)/.test(t)) return RiceBowl;
  if (/(banana|fruit)/.test(t)) return Banana;
  if (/(shake|protein|smoothie)/.test(t)) return ProteinShake;
  if (/apple/.test(t)) return Apple;
  if (/(yogurt|berr|oatmeal)/.test(t)) return Yogurt;
  if (/(salad|tuna|veg)/.test(t)) return Salad;
  if (/(pasta|noodle)/.test(t)) return Pasta;
  return RiceBowl;
}
