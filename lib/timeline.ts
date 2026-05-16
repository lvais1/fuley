import type { FoodEntry, WorkoutType, UserProfile, TimelinePoint } from '@/types';
import { calculateReadiness } from '@/lib/readiness-engine';

const CHECKPOINTS = [0, 30, 60, 90, 120, 180, 240];

export function computeWorkoutTimeline(
  foodEntries: FoodEntry[],
  workoutType: WorkoutType,
  user: UserProfile | null,
): TimelinePoint[] {
  if (foodEntries.length === 0) return [];

  return CHECKPOINTS.map(mins => {
    // Simulate the future state by pretending time has advanced by `mins`
    const simulatedEntries: FoodEntry[] = foodEntries.map(e => ({
      ...e,
      timestamp: new Date(new Date(e.timestamp).getTime() - mins * 60_000).toISOString(),
    }));

    const result = calculateReadiness(simulatedEntries, workoutType, user);

    let type: TimelinePoint['type'];
    if (mins === 0) type = 'now';
    else if (result.score >= 80) type = 'peak';
    else if (result.score >= 60) type = 'improving';
    else type = 'declining';

    return {
      minutesFromNow: mins,
      score: result.score,
      label: mins === 0 ? 'Now' : `+${mins}m`,
      type,
    };
  });
}

export function getOptimalWindow(points: TimelinePoint[]): TimelinePoint | null {
  const peakPoints = points.filter(p => p.type === 'peak' || p.score >= 75);
  if (peakPoints.length === 0) return null;
  return peakPoints.reduce((best, p) => p.score > best.score ? p : best);
}
