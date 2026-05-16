import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ReadinessStatus, WorkoutType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function minutesSince(isoString: string): number {
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
}

export function getStatusColor(status: ReadinessStatus): string {
  switch (status) {
    case 'READY': return 'var(--color-green)';
    case 'WAIT': return 'var(--color-orange)';
    case 'EAT_FIRST': return 'var(--color-red)';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 70) return 'var(--color-green)';
  if (score >= 40) return 'var(--color-orange)';
  return 'var(--color-red)';
}

export function getScoreGlowClass(score: number): string {
  if (score >= 70) return 'glow-green';
  if (score >= 40) return 'glow-orange';
  return 'glow-red';
}

export function getWorkoutLabel(type: WorkoutType): string {
  const labels: Record<WorkoutType, string> = {
    push: 'Push',
    pull: 'Pull',
    legs: 'Legs',
    full_body: 'Full Body',
    cardio: 'Cardio',
    rest: 'Rest Day',
  };
  return labels[type];
}

export function getWorkoutEmoji(type: WorkoutType): string {
  const emojis: Record<WorkoutType, string> = {
    push: '💪',
    pull: '🏋️',
    legs: '🦵',
    full_body: '⚡',
    cardio: '🏃',
    rest: '😴',
  };
  return emojis[type];
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}
