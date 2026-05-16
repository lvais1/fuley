'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Zap, ChevronDown, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import ReadinessOrb from '@/components/ReadinessOrb';
import BreakdownCard from '@/components/BreakdownCard';
import { useAppStore } from '@/lib/store';
import { calculateReadiness } from '@/lib/readiness-engine';
import { getWorkoutLabel, getWorkoutEmoji } from '@/lib/utils';
import type { ReadinessResult, WorkoutType, ReadinessStatus } from '@/types';

const STATUS_STYLES: Record<ReadinessStatus, {
  bg: string; border: string; headerBg: string; badge: string;
}> = {
  READY: {
    bg: 'rgba(0,255,148,0.04)',
    border: 'rgba(0,255,148,0.2)',
    headerBg: 'rgba(0,255,148,0.08)',
    badge: 'rgba(0,255,148,0.12)',
  },
  WAIT: {
    bg: 'rgba(255,107,53,0.04)',
    border: 'rgba(255,107,53,0.2)',
    headerBg: 'rgba(255,107,53,0.08)',
    badge: 'rgba(255,107,53,0.12)',
  },
  EAT_FIRST: {
    bg: 'rgba(255,59,92,0.04)',
    border: 'rgba(255,59,92,0.2)',
    headerBg: 'rgba(255,59,92,0.08)',
    badge: 'rgba(255,59,92,0.12)',
  },
};

const STATUS_COLOR: Record<ReadinessStatus, string> = {
  READY: 'var(--color-green)',
  WAIT: 'var(--color-orange)',
  EAT_FIRST: 'var(--color-red)',
};

const STATUS_COLOR_RAW: Record<ReadinessStatus, string> = {
  READY: '#00FF94',
  WAIT: '#FF6B35',
  EAT_FIRST: '#FF3B5C',
};

const BURST_PARTICLES = [
  { angle: 0,   dist: 68, size: 5 },
  { angle: 24,  dist: 55, size: 3 },
  { angle: 48,  dist: 76, size: 4 },
  { angle: 72,  dist: 62, size: 6 },
  { angle: 96,  dist: 72, size: 3 },
  { angle: 120, dist: 58, size: 5 },
  { angle: 144, dist: 80, size: 4 },
  { angle: 168, dist: 65, size: 3 },
  { angle: 192, dist: 70, size: 6 },
  { angle: 216, dist: 55, size: 4 },
  { angle: 240, dist: 76, size: 3 },
  { angle: 264, dist: 62, size: 5 },
  { angle: 288, dist: 72, size: 4 },
  { angle: 312, dist: 58, size: 3 },
  { angle: 336, dist: 68, size: 5 },
];

export default function TrainPage() {
  const router = useRouter();
  const { user, foodEntries, todayWorkoutType, lastReadiness, setLastReadiness, completeWorkout, stats } = useAppStore();
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [workoutDone, setWorkoutDone] = useState(false);
  const [selectedType, setSelectedType] = useState<WorkoutType>(todayWorkoutType);

  const WORKOUT_TYPES: WorkoutType[] = ['push', 'pull', 'legs', 'full_body', 'cardio'];

  const ANALYSIS_PHASES = [
    'Scanning food log...',
    'Calculating digestion load...',
    'Checking carb availability...',
    'Analyzing energy stores...',
    'Computing readiness score...',
  ];

  useEffect(() => {
    if (!user) router.replace('/onboarding');
  }, [user, router]);

  const runAnalysis = async () => {
    if (!user) return;
    setIsAnalyzing(true);
    setResult(null);
    setShowBreakdown(false);
    setAnalysisPhase(0);

    for (let i = 0; i < ANALYSIS_PHASES.length; i++) {
      await new Promise(r => setTimeout(r, 250));
      setAnalysisPhase(i);
    }

    await new Promise(r => setTimeout(r, 150));
    const res = calculateReadiness(foodEntries, selectedType, user);
    setResult(res);
    setLastReadiness(res);
    setIsAnalyzing(false);
  };

  if (!user) return null;

  const styles = result ? STATUS_STYLES[result.status] : STATUS_STYLES.READY;

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--color-bg)' }}>
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-[100px] opacity-15"
            style={{ background: STATUS_COLOR[result.status] }}
          />
        )}
      </div>

      <div className="relative px-5 pt-14">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard">
            <motion.div whileTap={{ scale: 0.92 }} className="w-9 h-9 rounded-2xl flex items-center justify-center glass">
              <ArrowLeft size={18} style={{ color: 'var(--color-text-2)' }} />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-xl font-black">Can I Train Now?</h1>
            <p className="text-xs" style={{ color: 'var(--color-text-2)' }}>AI readiness analysis</p>
          </div>
        </div>

        {/* Workout type selector */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-3)' }}>
            Workout type
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {WORKOUT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => { setSelectedType(type); setResult(null); }}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: selectedType === type ? 'rgba(0,255,148,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedType === type ? 'rgba(0,255,148,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: selectedType === type ? 'var(--color-green)' : 'var(--color-text-2)',
                }}
              >
                {getWorkoutEmoji(type)} {getWorkoutLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Analysis button / result */}
        <AnimatePresence mode="wait">
          {!result && !isAnalyzing && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center py-10"
            >
              <motion.div
                className="relative mb-8"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div
                  className="w-40 h-40 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(0,255,148,0.06)',
                    border: '2px solid rgba(0,255,148,0.2)',
                    boxShadow: '0 0 40px rgba(0,255,148,0.1)',
                  }}
                >
                  <Zap size={60} style={{ color: 'var(--color-green)' }} />
                </div>
              </motion.div>

              <p className="text-base font-medium mb-6 text-center" style={{ color: 'var(--color-text-2)' }}>
                Analyze your {getWorkoutLabel(selectedType)} readiness based on your food log
              </p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={runAnalysis}
                className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
                style={{
                  background: 'var(--color-green)',
                  color: '#080B12',
                  boxShadow: '0 0 30px rgba(0,255,148,0.35)',
                }}
              >
                <Zap size={20} />
                Analyze Now
              </motion.button>
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-10"
            >
              <div className="relative mb-8">
                {/* Spinning rings */}
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border"
                    style={{
                      borderColor: `rgba(0,255,148,${0.3 - i * 0.08})`,
                      width: 120 + i * 30,
                      height: 120 + i * 30,
                      margin: -(i * 15),
                    }}
                    animate={{ rotate: 360 * (i % 2 === 0 ? 1 : -1) }}
                    transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: 'linear' }}
                  />
                ))}
                <div
                  className="w-30 h-30 rounded-full flex items-center justify-center relative"
                  style={{
                    width: 120,
                    height: 120,
                    background: 'rgba(0,255,148,0.08)',
                    border: '1px solid rgba(0,255,148,0.2)',
                  }}
                >
                  <Zap size={40} style={{ color: 'var(--color-green)' }} />
                </div>
              </div>

              <div className="text-center">
                <motion.p
                  key={analysisPhase}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium mb-4"
                  style={{ color: 'var(--color-green)' }}
                >
                  {ANALYSIS_PHASES[analysisPhase]}
                </motion.p>

                <div className="w-48 h-1 rounded-full mx-auto bg-[rgba(255,255,255,0.06)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--color-green)' }}
                    animate={{ width: `${((analysisPhase + 1) / ANALYSIS_PHASES.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {result && !isAnalyzing && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Orb */}
              <div className="flex justify-center mb-5">
                <ReadinessOrb score={result.score} status={result.status} size="lg" pulse />
              </div>

              {/* Headline + Explanation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-3xl mb-4"
                style={{ background: styles.bg, border: `1px solid ${styles.border}` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{getWorkoutEmoji(result.workoutType)}</span>
                  <span
                    className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: styles.badge, color: STATUS_COLOR[result.status] }}
                  >
                    {result.status === 'READY' ? '✓ Ready' : result.status === 'WAIT' ? '⏱ Wait' : '⚡ Eat First'}
                  </span>
                </div>
                <h2 className="text-lg font-black mb-2">{result.headline}</h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
                  {result.explanation}
                </p>
              </motion.div>

              {/* Wait time */}
              {result.status === 'WAIT' && result.waitMinutes > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 p-4 rounded-2xl mb-4"
                  style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,107,53,0.15)' }}
                  >
                    <Clock size={20} style={{ color: 'var(--color-orange)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--color-text-3)' }}>Optimal window opens in</p>
                    <p className="text-lg font-black" style={{ color: 'var(--color-orange)' }}>
                      {result.waitMinutes} minutes
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Pre/Post workout */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="space-y-3 mb-4"
              >
                <CoachCard
                  title="Pre-workout"
                  content={result.preWorkoutSuggestion}
                  icon="⚡"
                  color={STATUS_COLOR[result.status]}
                />
                <CoachCard
                  title="Post-workout"
                  content={result.postWorkoutSuggestion}
                  icon="🔄"
                  color="var(--color-text-2)"
                />
              </motion.div>

              {/* Breakdown toggle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl glass mb-3"
                >
                  <span className="text-sm font-semibold">Score breakdown</span>
                  <motion.div animate={{ rotate: showBreakdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} style={{ color: 'var(--color-text-2)' }} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showBreakdown && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-4"
                    >
                      <BreakdownCard breakdown={result.breakdown} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="flex gap-3 mb-4"
              >
                {!workoutDone ? (
                  <button
                    onClick={() => {
                      completeWorkout();
                      setWorkoutDone(true);
                    }}
                    disabled={result.status === 'EAT_FIRST'}
                    className="flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: result.status === 'READY' ? 'var(--color-green)' : 'rgba(255,255,255,0.06)',
                      color: result.status === 'READY' ? '#080B12' : 'var(--color-text-2)',
                      opacity: result.status === 'EAT_FIRST' ? 0.4 : 1,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    Workout Done
                  </button>
                ) : (
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: 'rgba(0,255,148,0.12)', color: 'var(--color-green)', border: '1px solid rgba(0,255,148,0.3)' }}
                  >
                    <CheckCircle2 size={16} />
                    Logged!
                  </motion.div>
                )}

                <button
                  onClick={() => setResult(null)}
                  className="h-12 px-4 rounded-2xl glass text-sm font-semibold transition-all"
                  style={{ color: 'var(--color-text-2)' }}
                >
                  Re-analyze
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Navigation />

      {workoutDone && result && (
        <WorkoutCelebration color={STATUS_COLOR_RAW[result.status]} />
      )}
    </div>
  );
}

function WorkoutCelebration({ color }: { color: string }) {
  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-40">
      {BURST_PARTICLES.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.dist;
        const ty = Math.sin(rad) * p.dist;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: color,
              boxShadow: `0 0 ${p.size + 3}px ${color}`,
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x: tx, y: ty, scale: 1, opacity: 0 }}
            transition={{ duration: 0.65, delay: i * 0.018, ease: [0.25, 1, 0.5, 1] }}
          />
        );
      })}
    </div>
  );
}

function CoachCard({ title, content, icon, color }: { title: string; content: string; icon: string; color: string }) {
  return (
    <div
      className="p-4 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
          {title}
        </span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
        {content}
      </p>
    </div>
  );
}
