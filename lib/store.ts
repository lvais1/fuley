'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppState, UserProfile, FoodEntry, WorkoutSession, WorkoutType, ReadinessResult, AppStats } from '@/types';
import { getTodayISO } from '@/lib/utils';

const DEFAULT_STATS: AppStats = {
  currentStreak: 0,
  longestStreak: 0,
  totalWorkouts: 0,
  perfectFueledCount: 0,
  avgReadinessScore: 0,
  weeklyAvg: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      foodEntries: [],
      workoutSessions: [],
      todayWorkoutType: 'push',
      lastReadiness: null,
      stats: DEFAULT_STATS,

      setUser: (user: UserProfile) => {
        // Initialise today's workout type to match the split
        const defaultType: WorkoutType = user.trainingSplit === 'full_body' ? 'full_body' : 'push';
        set({ user, todayWorkoutType: defaultType });
      },

      addFoodEntry: (entry: FoodEntry) =>
        set(state => ({ foodEntries: [entry, ...state.foodEntries].slice(0, 200) })),

      removeFoodEntry: (id: string) =>
        set(state => ({ foodEntries: state.foodEntries.filter(e => e.id !== id) })),

      setTodayWorkoutType: (type: WorkoutType) => set({ todayWorkoutType: type }),

      setLastReadiness: (result: ReadinessResult) => {
        set({ lastReadiness: result });
        const state = get();
        const stats = { ...state.stats };
        const allScores = [...(stats.weeklyAvg || []), result.score].slice(-7);
        stats.weeklyAvg = allScores;
        stats.avgReadinessScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
        set({ stats });
      },

      completeWorkout: (id: string) =>
        set(state => {
          const sessions = state.workoutSessions.map(s =>
            s.id === id ? { ...s, completed: true } : s
          );
          const stats = { ...state.stats };
          stats.totalWorkouts += 1;
          const justCompleted = sessions.find(s => s.id === id);
          if (justCompleted && justCompleted.readinessScore >= 75) {
            stats.perfectFueledCount += 1;
          }
          stats.currentStreak += 1;
          stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
          return { workoutSessions: sessions, stats };
        }),

      clearToday: () => {
        const today = getTodayISO();
        set(state => ({
          foodEntries: state.foodEntries.filter(e => !e.timestamp.startsWith(today)),
          lastReadiness: null,
        }));
      },

      reset: () => set({
        user: null,
        foodEntries: [],
        workoutSessions: [],
        todayWorkoutType: 'push',
        lastReadiness: null,
        stats: DEFAULT_STATS,
      }),
    }),
    {
      name: 'fuelready-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        foodEntries: state.foodEntries,
        workoutSessions: state.workoutSessions,
        todayWorkoutType: state.todayWorkoutType,
        lastReadiness: state.lastReadiness,
        stats: state.stats,
      }),
    }
  )
);
