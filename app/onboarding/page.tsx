'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Zap } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { generateId } from '@/lib/utils';
import type { Goal, Gender, TrainingSplit } from '@/types';

/* ─────────────── Types ─────────────── */
interface OData {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  gender: Gender | '';
  goal: Goal | '';
  trainingSplit: TrainingSplit | '';
  trainingFrequency: number;
  fuelPreferences: string[];
}

/* ─────────────── Motion config ─────────────── */
const slide = {
  enter: (d: number) => ({ x: d > 0 ? 72 : -72, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d > 0 ? -72 : 72, opacity: 0 }),
};
const ease = [0.32, 0.72, 0, 1] as const;

/* ─────────────── Main ─────────────── */
export default function OnboardingPage() {
  const router = useRouter();
  const setUser = useAppStore(s => s.setUser);
  const [step, setStep] = useState(0); // 0=welcome, 1-5=form, 6=loading
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<OData>({
    name: '', age: 25, heightCm: 175, weightKg: 75,
    gender: '', goal: '', trainingSplit: '',
    trainingFrequency: 4, fuelPreferences: [],
  });

  const upd = <K extends keyof OData>(key: K, val: OData[K]) =>
    setData(d => ({ ...d, [key]: val }));

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const finish = () => {
    setUser({
      id: generateId(),
      name: data.name || 'Athlete',
      age: data.age,
      heightCm: data.heightCm,
      weightKg: data.weightKg,
      gender: (data.gender || 'other') as Gender,
      goal: (data.goal || 'maintenance') as Goal,
      trainingSplit: (data.trainingSplit || 'ppl') as TrainingSplit,
      trainingFrequency: data.trainingFrequency,
      fuelPreferences: data.fuelPreferences,
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    });
    router.push('/dashboard');
  };

  const canAdvance = [
    true,                                 // 0 welcome
    data.name.length > 0 && data.gender !== '', // 1 personal
    data.goal !== '',                     // 2 goal
    data.trainingSplit !== '',            // 3 split
    true,                                 // 4 frequency
    true,                                 // 5 preferences
  ][step] ?? true;

  /* ── Step 0: Welcome — no chrome ── */
  if (step === 0) {
    return <WelcomeScreen onStart={() => go(1)} />;
  }

  /* ── Step 6: Loading — no chrome ── */
  if (step === 6) {
    return <LoadingScreen onComplete={finish} data={data} />;
  }

  /* ── Steps 1-5 ── */
  const FORM_STEPS = 5;
  const formStep = step - 1; // 0-indexed within form steps

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header chrome */}
      <div className="px-6 pt-safe pt-14">
        {/* Back + progress */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => go(step - 1)}
            className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ChevronLeft size={18} style={{ color: 'var(--color-text-2)' }} />
          </motion.button>

          {/* Segmented progress */}
          <div className="flex gap-1.5 flex-1">
            {Array.from({ length: FORM_STEPS }).map((_, i) => (
              <motion.div
                key={i}
                className="h-1 rounded-full flex-1"
                animate={{
                  background: i < formStep
                    ? 'var(--color-green)'
                    : i === formStep
                    ? 'rgba(0,255,148,0.5)'
                    : 'rgba(255,255,255,0.08)',
                }}
                transition={{ duration: 0.4 }}
              />
            ))}
          </div>

          <span className="text-xs font-medium flex-shrink-0" style={{ color: 'var(--color-text-3)' }}>
            {formStep + 1}/{FORM_STEPS}
          </span>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-6">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease }}
          >
            {step === 1 && <PersonalStep data={data} upd={upd} />}
            {step === 2 && <GoalStep data={data} upd={upd} />}
            {step === 3 && <SplitStep data={data} upd={upd} />}
            {step === 4 && <FrequencyStep data={data} upd={upd} />}
            {step === 5 && <PreferencesStep data={data} upd={upd} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="px-6 pb-12 pt-4">
        <motion.button
          whileTap={{ scale: canAdvance ? 0.97 : 1 }}
          onClick={() => canAdvance && go(step < 5 ? step + 1 : 6)}
          className="w-full h-14 rounded-2xl font-bold text-base transition-all relative overflow-hidden"
          style={{
            background: canAdvance ? 'var(--color-green)' : 'rgba(255,255,255,0.06)',
            color: canAdvance ? '#080B12' : 'var(--color-text-3)',
            boxShadow: canAdvance ? '0 0 32px rgba(0,255,148,0.35), 0 4px 24px rgba(0,0,0,0.4)' : 'none',
          }}
        >
          {canAdvance && (
            <motion.div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            />
          )}
          <span className="relative">
            {step === 5 ? 'Build My Profile' : 'Continue'}
          </span>
        </motion.button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   STEP 0 — WELCOME
═══════════════════════════════════════ */
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Grid background */}
      <div className="absolute inset-0 dot-grid opacity-40" />

      {/* Ambient orbs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 340, height: 340,
          background: 'radial-gradient(circle, rgba(0,255,148,0.22) 0%, transparent 70%)',
          top: '-80px', left: '50%', x: '-50%',
          filter: 'blur(1px)',
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(255,107,53,0.18) 0%, transparent 70%)',
          bottom: '25%', right: '-40px',
          filter: 'blur(1px)',
        }}
        animate={{ scale: [1.1, 1, 1.1], y: [0, 18, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Content */}
      <div className="relative flex flex-col flex-1 px-7 pt-16 pb-10">
        {/* Logo row */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="flex items-center gap-2.5 mb-auto"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(0,255,148,0.12)',
              border: '1px solid rgba(0,255,148,0.25)',
              boxShadow: '0 0 16px rgba(0,255,148,0.2)',
            }}
          >
            <Zap size={18} fill="currentColor" style={{ color: 'var(--color-green)' }} />
          </div>
          <span className="font-black text-lg tracking-tight">FuelReady</span>
        </motion.div>

        {/* Main content */}
        <div className="mb-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{
              background: 'rgba(0,255,148,0.08)',
              border: '1px solid rgba(0,255,148,0.2)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--color-green)', boxShadow: '0 0 6px rgba(0,255,148,0.8)' }}
            />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-green)' }}>
              AI Powered
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.55, ease }}
            className="font-black leading-[1.0] tracking-tight mb-5"
            style={{ fontSize: 'clamp(48px, 14vw, 64px)' }}
          >
            Train
            <br />
            <span className="text-gradient-hero">smarter.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.5, ease }}
            className="text-base leading-relaxed mb-7 max-w-xs"
            style={{ color: 'var(--color-text-2)' }}
          >
            Your body already tells a story.{' '}
            <span style={{ color: 'var(--color-text-1)', fontWeight: 600 }}>FuelReady reads it</span>
            {' '}— real-time AI readiness based on meals, digestion, and energy state.
          </motion.p>

          {/* Feature chips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.5, ease }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {[
              { label: 'Readiness Score', color: 'rgba(0,255,148,0.1)', text: 'rgba(0,255,148,0.9)' },
              { label: 'Meal Timing',     color: 'rgba(255,107,53,0.1)', text: 'rgba(255,107,53,0.9)' },
              { label: 'AI Coach',        color: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.7)' },
              { label: 'Fuel Analysis',   color: 'rgba(0,212,255,0.1)', text: 'rgba(0,212,255,0.9)' },
            ].map((f, i) => (
              <motion.span
                key={f.label}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.07, duration: 0.35, ease }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: f.color, border: `1px solid ${f.text}20`, color: f.text }}
              >
                {f.label}
              </motion.span>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, ease }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="w-full h-14 rounded-2xl font-bold text-base relative overflow-hidden"
            style={{
              background: 'var(--color-green)',
              color: '#080B12',
              boxShadow: '0 0 40px rgba(0,255,148,0.4), 0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
            />
            <span className="relative">Get Started — It&apos;s Free</span>
          </motion.button>
        </div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="text-center text-xs"
          style={{ color: 'var(--color-text-3)' }}
        >
          No account needed to start
        </motion.p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   STEP 1 — PERSONAL
═══════════════════════════════════════ */
function PersonalStep({ data, upd }: { data: OData; upd: <K extends keyof OData>(k: K, v: OData[K]) => void }) {
  return (
    <div className="pb-4">
      <StepHeader
        tag="Step 1"
        title="Who are you?"
        subtitle="Your profile powers the readiness engine."
      />

      {/* Name */}
      <div className="mb-5">
        <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>
          Name
        </label>
        <input
          type="text"
          value={data.name}
          onChange={e => upd('name', e.target.value)}
          placeholder="Your name"
          autoFocus
          className="w-full h-13 px-4 rounded-2xl text-base font-semibold transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--color-text-1)',
          }}
        />
      </div>

      {/* Gender */}
      <div className="mb-5">
        <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>
          Gender
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['male', 'female', 'other'] as const).map(g => (
            <button
              key={g}
              onClick={() => upd('gender', g)}
              className="py-3 rounded-2xl text-sm font-semibold capitalize relative overflow-hidden transition-all"
              style={{
                background: data.gender === g ? 'rgba(0,255,148,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${data.gender === g ? 'rgba(0,255,148,0.45)' : 'rgba(255,255,255,0.08)'}`,
                color: data.gender === g ? 'var(--color-green)' : 'var(--color-text-2)',
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Age slider */}
      <SliderField
        label="Age" value={data.age} min={14} max={65} unit="yrs"
        onChange={v => upd('age', v)}
        color="var(--color-green)"
      />

      {/* Height */}
      <SliderField
        label="Height" value={data.heightCm} min={145} max={215} unit="cm"
        onChange={v => upd('heightCm', v)}
        color="rgba(0,212,255,0.9)"
      />

      {/* Weight */}
      <SliderField
        label="Weight" value={data.weightKg} min={40} max={160} unit="kg"
        onChange={v => upd('weightKg', v)}
        color="var(--color-orange)"
      />
    </div>
  );
}

/* ═══════════════════════════════════════
   STEP 2 — GOAL
═══════════════════════════════════════ */
function GoalStep({ data, upd }: { data: OData; upd: <K extends keyof OData>(k: K, v: OData[K]) => void }) {
  const goals: { value: Goal; label: string; desc: string; tag: string; accent: string; bg: string; icon: string }[] = [
    {
      value: 'cutting',
      label: 'Cutting',
      desc: 'Prioritise fat loss while preserving hard-earned muscle mass.',
      tag: 'Calorie deficit',
      accent: 'var(--color-red)',
      bg: 'rgba(255,59,92,0.07)',
      icon: '🔥',
    },
    {
      value: 'lean_bulk',
      label: 'Lean Bulk',
      desc: 'Build quality muscle with controlled calories. Stay lean.',
      tag: 'Slight surplus',
      accent: 'var(--color-green)',
      bg: 'rgba(0,255,148,0.07)',
      icon: '📈',
    },
    {
      value: 'maintenance',
      label: 'Maintenance',
      desc: 'Fuel peak performance. Recomp body composition over time.',
      tag: 'Performance',
      accent: 'rgba(0,212,255,0.9)',
      bg: 'rgba(0,212,255,0.07)',
      icon: '⚡',
    },
  ];

  return (
    <div className="pb-4">
      <StepHeader
        tag="Step 2"
        title="Your goal"
        subtitle="Readiness scoring adapts to your specific phase."
      />

      <div className="space-y-3">
        {goals.map((g, i) => {
          const active = data.goal === g.value;
          return (
            <motion.button
              key={g.value}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => upd('goal', g.value)}
              className="w-full p-5 rounded-3xl text-left relative overflow-hidden transition-all"
              style={{
                background: active ? g.bg : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${active ? g.accent + '60' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              {/* Selection indicator */}
              {active && (
                <motion.div
                  layoutId="goal-active"
                  className="absolute inset-0 rounded-3xl"
                  style={{ boxShadow: `inset 0 0 0 1.5px ${g.accent}60` }}
                />
              )}

              <div className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-xl"
                  style={{ background: active ? g.bg : 'rgba(255,255,255,0.05)' }}
                >
                  {g.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="font-black text-base"
                      style={{ color: active ? g.accent : 'var(--color-text-1)' }}
                    >
                      {g.label}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: active ? g.accent + '20' : 'rgba(255,255,255,0.05)',
                        color: active ? g.accent : 'var(--color-text-3)',
                      }}
                    >
                      {g.tag}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-2)' }}>{g.desc}</p>
                </div>
              </div>

              {/* Check */}
              {active && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: g.accent }}
                >
                  <svg viewBox="0 0 10 8" className="w-2.5 h-2.5">
                    <path d="M1 4l2.5 2.5L9 1" stroke="#080B12" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   STEP 3 — TRAINING SPLIT
═══════════════════════════════════════ */
function SplitStep({ data, upd }: { data: OData; upd: <K extends keyof OData>(k: K, v: OData[K]) => void }) {
  return (
    <div className="pb-4">
      <StepHeader
        tag="Step 3"
        title="Your training split"
        subtitle="FuelReady adapts energy recommendations to how each session demands fuel."
      />

      <div className="space-y-4">
        {/* PPL Card */}
        <SplitCard
          value="ppl"
          selected={data.trainingSplit === 'ppl'}
          onSelect={() => upd('trainingSplit', 'ppl')}
          title="Push · Pull · Legs"
          desc="Three dedicated sessions, each targeting specific muscle groups with maximum intensity."
          visual={<PPLVisual />}
          tags={[
            { label: 'Push', color: 'var(--color-green)' },
            { label: 'Pull', color: 'var(--color-orange)' },
            { label: 'Legs', color: 'var(--color-red)' },
          ]}
          accent="var(--color-green)"
        />

        {/* Full Body Card */}
        <SplitCard
          value="full_body"
          selected={data.trainingSplit === 'full_body'}
          onSelect={() => upd('trainingSplit', 'full_body')}
          title="Full Body"
          desc="Train everything each session. High frequency, balanced stimulus across all muscle groups."
          visual={<FullBodyVisual />}
          tags={[
            { label: '3-4× / week', color: 'rgba(0,212,255,0.9)' },
            { label: 'High frequency', color: 'rgba(255,255,255,0.5)' },
          ]}
          accent="rgba(0,212,255,0.9)"
        />
      </div>
    </div>
  );
}

function SplitCard({
  selected, onSelect, title, desc, visual, tags, accent,
}: {
  value?: TrainingSplit; selected: boolean; onSelect: () => void;
  title: string; desc: string; visual: React.ReactNode;
  tags: { label: string; color: string }[]; accent: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="w-full p-5 rounded-3xl text-left relative overflow-hidden transition-all"
      style={{
        background: selected ? `${accent}0C` : 'rgba(255,255,255,0.03)',
        border: `1.5px solid ${selected ? `${accent}50` : 'rgba(255,255,255,0.07)'}`,
        boxShadow: selected ? `0 0 30px ${accent}12, inset 0 0 0 1.5px ${accent}30` : 'none',
      }}
    >
      {/* Visual */}
      <div className="mb-4 h-16 flex items-end gap-2.5">{visual}</div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3
            className="font-black text-lg mb-1.5"
            style={{ color: selected ? accent : 'var(--color-text-1)' }}
          >
            {title}
          </h3>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-2)' }}>{desc}</p>
          <div className="flex flex-wrap gap-2">
            {tags.map(t => (
              <span
                key={t.label}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: `${t.color}18`, color: t.color, border: `1px solid ${t.color}30` }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>

        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: accent, boxShadow: `0 0 12px ${accent}60` }}
          >
            <svg viewBox="0 0 10 8" className="w-2.5 h-2.5">
              <path d="M1 4l2.5 2.5L9 1" stroke="#080B12" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

function PPLVisual() {
  const bars = [
    { h: '100%', color: 'var(--color-green)',  label: 'P' },
    { h: '80%',  color: 'var(--color-orange)', label: 'P' },
    { h: '90%',  color: 'var(--color-red)',    label: 'L' },
  ];
  return (
    <>
      {bars.map((b, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
          <div className="w-full rounded-xl overflow-hidden flex items-end" style={{ height: 52 }}>
            <motion.div
              className="w-full rounded-xl"
              style={{ height: b.h, background: `linear-gradient(to top, ${b.color}22, ${b.color})` }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            />
          </div>
          <span className="text-[10px] font-black" style={{ color: b.color }}>{b.label}</span>
        </div>
      ))}
    </>
  );
}

function FullBodyVisual() {
  return (
    <div className="relative w-full flex items-center justify-center" style={{ height: 64 }}>
      {[52, 38, 26].map((size, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size, height: size,
            border: `1.5px solid ${['rgba(0,212,255,0.7)', 'rgba(0,212,255,0.4)', 'rgba(0,212,255,0.2)'][i]}`,
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
      <div
        className="w-4 h-4 rounded-full"
        style={{
          background: 'rgba(0,212,255,0.9)',
          boxShadow: '0 0 12px rgba(0,212,255,0.8)',
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════
   STEP 4 — FREQUENCY
═══════════════════════════════════════ */
function FrequencyStep({ data, upd }: { data: OData; upd: <K extends keyof OData>(k: K, v: OData[K]) => void }) {
  const options = [
    { val: 3, label: '3×', sub: 'per week', dots: 3 },
    { val: 4, label: '4×', sub: 'per week', dots: 4 },
    { val: 5, label: '5×', sub: 'per week', dots: 5 },
    { val: 6, label: '6×', sub: 'per week', dots: 6 },
  ];

  return (
    <div className="pb-4">
      <StepHeader
        tag="Step 4"
        title="Training frequency"
        subtitle="How often you train shapes recovery and readiness windows."
      />

      <div className="grid grid-cols-2 gap-3">
        {options.map((o, i) => {
          const active = data.trainingFrequency === o.val;
          return (
            <motion.button
              key={o.val}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => upd('trainingFrequency', o.val)}
              className="p-5 rounded-3xl flex flex-col items-start relative overflow-hidden transition-all"
              style={{
                background: active ? 'rgba(0,255,148,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${active ? 'rgba(0,255,148,0.45)' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: active ? '0 0 24px rgba(0,255,148,0.12)' : 'none',
              }}
            >
              {/* Week dots */}
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 7 }).map((_, di) => (
                  <div
                    key={di}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      background: di < o.val
                        ? (active ? 'var(--color-green)' : 'rgba(255,255,255,0.3)')
                        : 'rgba(255,255,255,0.08)',
                      boxShadow: di < o.val && active ? '0 0 4px rgba(0,255,148,0.6)' : 'none',
                    }}
                  />
                ))}
              </div>

              <span
                className="font-black text-3xl leading-none mb-0.5"
                style={{ color: active ? 'var(--color-green)' : 'var(--color-text-1)' }}
              >
                {o.label}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>{o.sub}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   STEP 5 — FUEL PREFERENCES
═══════════════════════════════════════ */
const PREFS = [
  { id: 'carbs-better',   icon: '⚡', text: 'I perform better with carbs' },
  { id: 'fat-heavy',      icon: '🧱', text: 'High-fat meals slow me down' },
  { id: 'dairy-issue',    icon: '🥛', text: 'Dairy affects my digestion' },
  { id: 'need-energy',    icon: '🔋', text: 'I need energy before training' },
  { id: 'light-meals',    icon: '🥗', text: 'I prefer light meals before workouts' },
  { id: 'timing-2h',      icon: '🕑', text: 'I feel best 2h after eating' },
  { id: 'fasted-ok',      icon: '⏱️', text: 'I can train fasted occasionally' },
  { id: 'full-stomach',   icon: '😣', text: 'Full stomach kills my performance' },
];

function PreferencesStep({ data, upd }: { data: OData; upd: <K extends keyof OData>(k: K, v: OData[K]) => void }) {
  const toggle = (id: string) => {
    const next = data.fuelPreferences.includes(id)
      ? data.fuelPreferences.filter(p => p !== id)
      : [...data.fuelPreferences, id];
    upd('fuelPreferences', next);
  };

  return (
    <div className="pb-4">
      <StepHeader
        tag="Step 5"
        title="Your fuel style"
        subtitle="Select everything that resonates. Your AI coach personalises recommendations."
      />

      <div className="grid grid-cols-1 gap-2.5">
        {PREFS.map((p, i) => {
          const active = data.fuelPreferences.includes(p.id);
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.055 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggle(p.id)}
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all"
              style={{
                background: active ? 'rgba(0,255,148,0.07)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${active ? 'rgba(0,255,148,0.4)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <span className="text-xl w-8 text-center">{p.icon}</span>
              <span
                className="text-sm font-medium flex-1"
                style={{ color: active ? 'var(--color-text-1)' : 'var(--color-text-2)' }}
              >
                {p.text}
              </span>
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                style={{
                  borderColor: active ? 'var(--color-green)' : 'rgba(255,255,255,0.15)',
                  background: active ? 'var(--color-green)' : 'transparent',
                }}
              >
                {active && (
                  <svg viewBox="0 0 10 8" className="w-2.5 h-2.5">
                    <path d="M1 4l2.5 2.5L9 1" stroke="#080B12" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {data.fuelPreferences.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs mt-4"
          style={{ color: 'var(--color-green)' }}
        >
          {data.fuelPreferences.length} preference{data.fuelPreferences.length > 1 ? 's' : ''} selected
        </motion.p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   STEP 6 — AI LOADING (cinematic)
═══════════════════════════════════════ */
const LOADING_MSGS = [
  'Analyzing your training style...',
  'Building your fuel profile...',
  'Calibrating digestion model...',
  'Optimizing readiness engine...',
  'Personalizing AI coach...',
  'Your profile is ready.',
];

function LoadingScreen({ onComplete, data }: { onComplete: () => void; data: OData }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const pctVal = useMotionValue(0);

  useEffect(() => {
    // Climb percentage
    const controls = animate(pctVal, 100, {
      duration: LOADING_MSGS.length * 0.8,
      ease: 'easeInOut',
      onUpdate: v => setPct(Math.round(v)),
    });

    // Cycle messages
    const intervals = LOADING_MSGS.map((_, i) =>
      setTimeout(() => setMsgIdx(i), i * 800)
    );

    const doneTimer = setTimeout(() => {
      setDone(true);
    }, LOADING_MSGS.length * 800 + 400);

    return () => {
      controls.stop();
      intervals.forEach(clearTimeout);
      clearTimeout(doneTimer);
    };
  }, []); // eslint-disable-line

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Background orb */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(0,255,148,0.1) 0%, transparent 70%)',
        }}
        animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbit rings */}
      {[160, 120, 88].map((size, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size, height: size,
            border: `1px solid rgba(0,255,148,${0.25 - i * 0.06})`,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 6 + i * 4, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* Scan line */}
      <div className="absolute pointer-events-none overflow-hidden" style={{ width: 160, height: 160, borderRadius: '50%' }}>
        <div
          className="w-full h-8 animate-scan"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,255,148,0.12), transparent)' }}
        />
      </div>

      {/* Center score */}
      <div
        className="relative w-28 h-28 rounded-full flex flex-col items-center justify-center mb-10"
        style={{
          background: 'rgba(0,255,148,0.06)',
          border: '1px solid rgba(0,255,148,0.2)',
          boxShadow: done ? '0 0 40px rgba(0,255,148,0.3)' : '0 0 20px rgba(0,255,148,0.15)',
        }}
      >
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            >
              <svg viewBox="0 0 32 32" className="w-10 h-10" fill="none">
                <circle cx="16" cy="16" r="14" stroke="rgba(0,255,148,0.3)" strokeWidth="2" />
                <path d="M9 16l4.5 4.5L23 11" stroke="#00FF94" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          ) : (
            <motion.span
              key={pct}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-black text-2xl leading-none"
              style={{ color: 'var(--color-green)' }}
            >
              {pct}
            </motion.span>
          )}
        </AnimatePresence>
        {!done && (
          <span className="text-[10px] mt-0.5" style={{ color: 'rgba(0,255,148,0.6)' }}>%</span>
        )}
      </div>

      {/* Messages */}
      <div className="text-center mb-10">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="text-sm font-semibold mb-3"
            style={{ color: msgIdx === LOADING_MSGS.length - 1 ? 'var(--color-green)' : 'var(--color-text-2)' }}
          >
            {LOADING_MSGS[msgIdx]}
          </motion.p>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-48 h-1 rounded-full mx-auto overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--color-green)' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Enter button */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease }}
            className="text-center"
          >
            <p className="text-base font-semibold mb-5" style={{ color: 'var(--color-text-1)' }}>
              Welcome, <span style={{ color: 'var(--color-green)' }}>{data.name || 'Athlete'}</span>
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onComplete}
              className="h-14 px-10 rounded-2xl font-bold text-base relative overflow-hidden"
              style={{
                background: 'var(--color-green)',
                color: '#080B12',
                boxShadow: '0 0 40px rgba(0,255,148,0.4)',
              }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
              <span className="relative">Enter FuelReady →</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════
   SHARED — SliderField
═══════════════════════════════════════ */
function SliderField({
  label, value, min, max, unit, onChange, color,
}: {
  label: string; value: number; min: number; max: number;
  unit: string; onChange: (v: number) => void; color: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>
          {label}
        </label>
        <span className="font-black text-base" style={{ color }}>
          {value} <span className="text-xs font-medium" style={{ color: 'var(--color-text-3)' }}>{unit}</span>
        </span>
      </div>
      <div className="relative h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}60` }}
        />
        <input
          type="range"
          min={min} max={max}
          value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        {/* Thumb indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2"
          style={{
            left: `calc(${pct}% - 8px)`,
            background: 'var(--color-bg)',
            borderColor: color,
            boxShadow: `0 0 8px ${color}80`,
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SHARED — StepHeader
═══════════════════════════════════════ */
function StepHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle: string }) {
  return (
    <div className="mb-7">
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[11px] font-bold uppercase tracking-widest"
        style={{ color: 'var(--color-green)' }}
      >
        {tag}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-2xl font-black mt-1 mb-2"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-text-2)' }}
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
