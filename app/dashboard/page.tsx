'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Zap, Plus, ChevronRight, Flame, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import ReadinessOrb from '@/components/ReadinessOrb';
import MealCard from '@/components/MealCard';
import { useAppStore } from '@/lib/store';
import { calculateReadiness } from '@/lib/readiness-engine';
import { getWorkoutLabel, getWorkoutEmoji, minutesSince } from '@/lib/utils';
import type { ReadinessResult, WorkoutType } from '@/types';

const PPL_TYPES: WorkoutType[]       = ['push', 'pull', 'legs'];
const FULL_BODY_TYPES: WorkoutType[] = ['full_body', 'cardio'];

export default function DashboardPage() {
  const router = useRouter();
  const { user, foodEntries, todayWorkoutType, lastReadiness, stats, setTodayWorkoutType, removeFoodEntry, setLastReadiness } = useAppStore();
  const [readiness, setReadiness] = useState<ReadinessResult | null>(lastReadiness);
  const [isCalculating, setIsCalculating] = useState(false);

  // Gate: redirect to onboarding if no user
  useEffect(() => {
    if (!user) router.replace('/onboarding');
  }, [user, router]);

  const recalculate = useCallback(() => {
    setIsCalculating(true);
    setTimeout(() => {
      const result = calculateReadiness(foodEntries, todayWorkoutType, user);
      setReadiness(result);
      setLastReadiness(result);
      setIsCalculating(false);
    }, 600);
  }, [foodEntries, todayWorkoutType, user, setLastReadiness]);

  // Auto-recalculate when food or workout changes
  useEffect(() => {
    recalculate();
  }, [foodEntries.length, todayWorkoutType]); // eslint-disable-line

  if (!user) return null;

  // Today's entries only (last 8 hours shown)
  const todayMeals = foodEntries.filter(e => minutesSince(e.timestamp) <= 480).slice(0, 3);

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--color-bg)' }}>
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[120px] opacity-20"
          style={{
            background: readiness?.status === 'READY' ? 'var(--color-green)' :
              readiness?.status === 'WAIT' ? 'var(--color-orange)' : 'var(--color-red)',
          }}
        />
      </div>

      <div className="relative px-5 pt-14">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-2)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <h1 className="text-xl font-black mt-0.5">
              Hey, <span className="text-gradient-green">{user.name}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
            <Flame size={14} style={{ color: 'var(--color-orange)' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--color-text-1)' }}>
              {stats.currentStreak}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-2)' }}>streak</span>
          </div>
        </div>

        {/* Workout type selector — driven by training split */}
        <div className="mb-6">
          <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>
            Today&apos;s workout
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(user.trainingSplit === 'ppl' ? PPL_TYPES : FULL_BODY_TYPES).map(type => (
              <button
                key={type}
                onClick={() => setTodayWorkoutType(type)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: todayWorkoutType === type ? 'rgba(0,255,148,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${todayWorkoutType === type ? 'rgba(0,255,148,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: todayWorkoutType === type ? 'var(--color-green)' : 'var(--color-text-2)',
                }}
              >
                <span>{getWorkoutEmoji(type)}</span>
                {getWorkoutLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Readiness Orb */}
        <motion.div
          className="flex flex-col items-center mb-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <AnimatePresence mode="wait">
            {isCalculating ? (
              <motion.div
                key="calculating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-60 h-60 rounded-full flex flex-col items-center justify-center glass"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 rounded-full border-2 border-t-transparent mb-3"
                  style={{ borderColor: 'var(--color-green)', borderTopColor: 'transparent' }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-2)' }}>Analyzing...</span>
              </motion.div>
            ) : readiness ? (
              <motion.div key="orb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <ReadinessOrb score={readiness.score} status={readiness.status} size="lg" pulse />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="w-60 h-60 rounded-full flex flex-col items-center justify-center glass"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-5xl mb-2">🍽️</span>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-2)' }}>Log a meal first</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status message */}
          {readiness && !isCalculating && (
            <motion.div
              className="text-center mt-5 px-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-base font-semibold mb-1">{readiness.headline}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
                {readiness.explanation.length > 120
                  ? readiness.explanation.slice(0, 120) + '...'
                  : readiness.explanation}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Can I Train Now? — CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <Link href="/train">
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-base"
              style={{
                background: 'var(--color-green)',
                color: '#080B12',
                boxShadow: '0 0 30px rgba(0,255,148,0.35), 0 4px 20px rgba(0,0,0,0.4)',
              }}
            >
              <Zap size={20} />
              CAN I TRAIN NOW?
              <ChevronRight size={18} />
            </motion.div>
          </Link>
        </motion.div>

        {/* Stats row */}
        {readiness && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            <StatChip
              icon={<TrendingUp size={14} />}
              label="Weekly avg"
              value={stats.avgReadinessScore > 0 ? `${stats.avgReadinessScore}` : '--'}
              color="var(--color-green)"
            />
            <StatChip
              icon={<Flame size={14} />}
              label="Streak"
              value={`${stats.currentStreak}d`}
              color="var(--color-orange)"
            />
            <StatChip
              icon={<Zap size={14} />}
              label="Workouts"
              value={`${stats.totalWorkouts}`}
              color="var(--color-text-2)"
            />
          </motion.div>
        )}

        {/* Recent meals */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>
              Today&apos;s Fuel
            </h2>
            <Link href="/log" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--color-green)' }}>
              <Plus size={14} /> Log meal
            </Link>
          </div>

          {todayMeals.length === 0 ? (
            <EmptyMeals />
          ) : (
            <>
              {todayMeals.map(entry => (
                <MealCard key={entry.id} entry={entry} onRemove={removeFoodEntry} />
              ))}
              {foodEntries.filter(e => minutesSince(e.timestamp) <= 480).length > 3 && (
                <Link
                  href="/log"
                  className="flex items-center justify-center gap-1 py-2 text-xs font-semibold"
                  style={{ color: 'var(--color-text-2)' }}
                >
                  View all meals <ChevronRight size={14} />
                </Link>
              )}
            </>
          )}
        </motion.div>

        {/* Wait time chip */}
        {readiness?.status === 'WAIT' && readiness.waitMinutes > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 flex items-center gap-2 p-3 rounded-2xl"
            style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)' }}
          >
            <Clock size={16} style={{ color: 'var(--color-orange)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-1)' }}>
              Best window opens in{' '}
              <span className="font-bold" style={{ color: 'var(--color-orange)' }}>
                {readiness.waitMinutes} min
              </span>
            </p>
          </motion.div>
        )}
      </div>

      <Navigation />
    </div>
  );
}

function StatChip({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="glass rounded-2xl p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1" style={{ color }}>
        {icon}
        <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-3)' }}>{label}</span>
      </div>
      <span className="text-lg font-black" style={{ color }}>{value}</span>
    </div>
  );
}

function EmptyMeals() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center py-10 text-center"
    >
      <span className="text-4xl mb-3">🍽️</span>
      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>No meals logged yet</p>
      <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>Log what you ate for a readiness score</p>
    </motion.div>
  );
}
