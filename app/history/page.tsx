'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Trophy, TrendingUp, Target, Calendar } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAppStore } from '@/lib/store';
import { formatDate, getScoreColor } from '@/lib/utils';

const BADGE_DATA = [
  { id: 'streak3', icon: '🔥', label: '3-Day Streak', desc: 'Logged 3 days straight', threshold: 3, stat: 'currentStreak' as const },
  { id: 'streak7', icon: '💎', label: 'Week Warrior', desc: '7-day streak achieved', threshold: 7, stat: 'currentStreak' as const },
  { id: 'perfect5', icon: '⚡', label: 'Peak Performer', desc: '5 perfectly fueled workouts', threshold: 5, stat: 'perfectFueledCount' as const },
  { id: 'workouts10', icon: '🏆', label: 'Dedicated', desc: 'Completed 10 workouts', threshold: 10, stat: 'totalWorkouts' as const },
  { id: 'workouts25', icon: '👑', label: 'Elite', desc: '25 logged workouts', threshold: 25, stat: 'totalWorkouts' as const },
];

function ScoreBar({ score, delay }: { score: number; delay: number }) {
  const color = getScoreColor(score);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-8 h-20 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden flex items-end">
        <motion.div
          className="w-full rounded-full"
          style={{ background: color }}
          initial={{ height: 0 }}
          animate={{ height: `${score}%` }}
          transition={{ delay, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
      <span className="text-[10px] font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

export default function HistoryPage() {
  const { foodEntries, stats, lastReadiness } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'log'>('overview');

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekScores = stats.weeklyAvg.length > 0
    ? [...Array(7 - stats.weeklyAvg.length).fill(0), ...stats.weeklyAvg].slice(-7)
    : [0, 0, 0, 0, 0, 0, 0];

  const earnedBadges = BADGE_DATA.filter(b => {
    const val = stats[b.stat];
    return typeof val === 'number' && val >= b.threshold;
  });

  const lockedBadges = BADGE_DATA.filter(b => {
    const val = stats[b.stat];
    return typeof val !== 'number' || val < b.threshold;
  });

  // Group food entries by date
  const groupedEntries = foodEntries.reduce<Record<string, typeof foodEntries>>((acc, entry) => {
    const date = entry.timestamp.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a)).slice(0, 7);

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--color-bg)' }}>
      <div className="px-5 pt-14">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black">History</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-2)' }}>Your training & fuel record</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-6 bg-[rgba(255,255,255,0.04)]">
          {(['overview', 'log'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
              style={{
                background: activeTab === tab ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeTab === tab ? 'var(--color-text-1)' : 'var(--color-text-3)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-4">
            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              <StatCard icon={<Flame size={20} />} label="Current Streak" value={`${stats.currentStreak}d`} color="var(--color-orange)" delay={0} />
              <StatCard icon={<Trophy size={20} />} label="Best Streak" value={`${stats.longestStreak}d`} color="var(--color-green)" delay={0.05} />
              <StatCard icon={<Zap size={20} />} label="Workouts" value={`${stats.totalWorkouts}`} color="var(--color-text-2)" delay={0.1} />
              <StatCard icon={<Target size={20} />} label="Perfect Fueled" value={`${stats.perfectFueledCount}`} color="var(--color-green)" delay={0.15} />
            </motion.div>

            {/* Weekly chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} style={{ color: 'var(--color-green)' }} />
                  <span className="text-sm font-bold">Weekly Readiness</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--color-green)' }}>
                  Avg {stats.avgReadinessScore || '--'}
                </span>
              </div>

              <div className="flex items-end justify-between gap-2">
                {weekDays.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <ScoreBar score={weekScores[i] || 0} delay={0.3 + i * 0.06} />
                    <span className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>{day}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-3xl p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={16} style={{ color: 'var(--color-orange)' }} />
                <span className="text-sm font-bold">Achievements</span>
              </div>

              {earnedBadges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {earnedBadges.map((b, i) => (
                    <motion.div
                      key={b.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.35 + i * 0.08, type: 'spring', stiffness: 200 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-2xl"
                      style={{ background: 'rgba(0,255,148,0.08)', border: '1px solid rgba(0,255,148,0.2)' }}
                    >
                      <span className="text-lg">{b.icon}</span>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--color-green)' }}>{b.label}</p>
                        <p className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>{b.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {lockedBadges.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-3)' }}>
                    Locked
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {lockedBadges.map(b => {
                      const val = stats[b.stat] as number || 0;
                      const progress = Math.min(100, (val / b.threshold) * 100);
                      return (
                        <div
                          key={b.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-2xl"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <span className="text-lg opacity-30">{b.icon}</span>
                          <div>
                            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-3)' }}>{b.label}</p>
                            <div className="w-16 h-1 rounded-full bg-[rgba(255,255,255,0.06)] mt-1 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${progress}%`, background: 'var(--color-text-3)' }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {earnedBadges.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-3)' }}>
                  Log meals and complete workouts to earn badges
                </p>
              )}
            </motion.div>

            {/* Last readiness summary */}
            {lastReadiness && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-3xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} style={{ color: 'var(--color-text-2)' }} />
                  <span className="text-sm font-bold">Last Analysis</span>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: `${getScoreColor(lastReadiness.score)}15` }}
                  >
                    <span className="text-xl font-black" style={{ color: getScoreColor(lastReadiness.score) }}>
                      {lastReadiness.score}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{lastReadiness.headline}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                      {new Date(lastReadiness.calculatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* Log tab */
          <div>
            {sortedDates.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <span className="text-5xl mb-4">📋</span>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>No food log yet</p>
                <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>Start logging meals to see your history</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedDates.map((date, di) => (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: di * 0.08 }}
                    className="glass rounded-3xl p-4"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-3)' }}>
                      {formatDate(date + 'T00:00:00')}
                    </p>
                    <div className="space-y-2">
                      {groupedEntries[date].map(entry => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{entry.text}</p>
                            <p className="text-[11px]" style={{ color: 'var(--color-text-3)' }}>
                              {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: entry.analysis.heaviness === 'heavy' ? 'rgba(255,59,92,0.1)' :
                                  entry.analysis.heaviness === 'medium' ? 'rgba(255,107,53,0.1)' : 'rgba(0,255,148,0.1)',
                                color: entry.analysis.heaviness === 'heavy' ? 'var(--color-red)' :
                                  entry.analysis.heaviness === 'medium' ? 'var(--color-orange)' : 'var(--color-green)',
                              }}
                            >
                              {entry.analysis.heaviness}
                            </span>
                            <span className="text-[11px]" style={{ color: 'var(--color-text-3)' }}>
                              ~{entry.analysis.estimatedCalories}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
}

function StatCard({ icon, label, value, color, delay }: {
  icon: React.ReactNode; label: string; value: string; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-3xl p-4"
    >
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
      </div>
      <p className="text-2xl font-black mb-0.5" style={{ color }}>{value}</p>
      <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>{label}</p>
    </motion.div>
  );
}
