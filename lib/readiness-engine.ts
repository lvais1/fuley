import type { FoodEntry, ReadinessResult, WorkoutType, UserProfile, ReadinessStatus, ReadinessBreakdown } from '@/types';
import { clampScore } from '@/lib/utils';

const WORKOUT_CARB_REQUIREMENTS: Record<WorkoutType, number> = {
  push: 35,
  pull: 45,
  legs: 50,
  full_body: 45,
  cardio: 40,
  rest: 0,
};

const WORKOUT_INTENSITY: Record<WorkoutType, number> = {
  push: 0.8,
  pull: 0.85,
  legs: 1.0,
  full_body: 0.9,
  cardio: 0.75,
  rest: 0,
};

interface DigestedMeal {
  entry: FoodEntry;
  minutesAgo: number;
  remainingDigestionPct: number;
  availableCarbs: number;
  activeDigestionLoad: number;
}

function computeDigestion(entry: FoodEntry, now: Date): DigestedMeal {
  const minutesAgo = Math.floor((now.getTime() - new Date(entry.timestamp).getTime()) / 60000);
  const { digestsInMinutes, digestionLoadScore, carbsG } = entry.analysis;

  const rawPct = Math.max(0, 1 - minutesAgo / digestsInMinutes);
  // Digestion is not linear — heaviest in first 60 mins
  const remainingDigestionPct = rawPct > 0.5 ? rawPct : rawPct * 0.7;

  // Carbs become available as digestion progresses
  const carbAvailPct = Math.min(1, minutesAgo / (digestsInMinutes * 0.4));
  const availableCarbs = carbsG * carbAvailPct;

  const activeDigestionLoad = digestionLoadScore * remainingDigestionPct;

  return { entry, minutesAgo, remainingDigestionPct, availableCarbs, activeDigestionLoad };
}

export function calculateReadiness(
  foodEntries: FoodEntry[],
  workoutType: WorkoutType,
  user: UserProfile | null,
): ReadinessResult {
  const now = new Date();

  // Only consider last 6 hours of food
  const recentEntries = foodEntries.filter(e => {
    const ageMin = (now.getTime() - new Date(e.timestamp).getTime()) / 60000;
    return ageMin <= 360;
  });

  const digested = recentEntries.map(e => computeDigestion(e, now));

  // === 1. Digestion Load (0-100, lower = better) ===
  const totalDigestionLoad = digested.reduce((sum, d) => sum + d.activeDigestionLoad, 0);
  const digestionScore = clampScore(100 - Math.min(100, totalDigestionLoad));

  // === 2. Carb Availability (0-100) ===
  const totalAvailableCarbs = digested.reduce((sum, d) => sum + d.availableCarbs, 0);
  const requiredCarbs = WORKOUT_CARB_REQUIREMENTS[workoutType];
  let carbScore: number;
  if (workoutType === 'rest') {
    carbScore = 100;
  } else if (requiredCarbs === 0) {
    carbScore = 80;
  } else {
    carbScore = clampScore((totalAvailableCarbs / requiredCarbs) * 100);
  }

  // === 3. Meal Timing (0-100) ===
  let timingScore = 80;
  if (digested.length === 0) {
    // No food in 6 hours — low energy risk
    timingScore = 25;
  } else {
    const mostRecentMeal = digested.reduce((latest, d) =>
      d.minutesAgo < latest.minutesAgo ? d : latest
    );
    const mins = mostRecentMeal.minutesAgo;
    const heaviness = mostRecentMeal.entry.analysis.heaviness;

    const optimalWindowStart = heaviness === 'heavy' ? 90 : heaviness === 'medium' ? 60 : 30;
    const optimalWindowEnd = heaviness === 'heavy' ? 210 : heaviness === 'medium' ? 180 : 120;

    if (mins < optimalWindowStart) {
      // Too soon after eating
      timingScore = clampScore(30 + (mins / optimalWindowStart) * 40);
    } else if (mins <= optimalWindowEnd) {
      // In the sweet spot
      timingScore = 90 + Math.random() * 10;
    } else if (mins <= 300) {
      // Getting a bit long, energy may drop
      timingScore = clampScore(90 - ((mins - optimalWindowEnd) / 100) * 20);
    } else {
      // > 5 hours since eating
      timingScore = 40;
    }
  }

  // === 4. Energy Readiness (0-100) ===
  const totalProtein = digested.reduce((sum, d) => sum + d.entry.analysis.proteinG, 0);
  const totalCarbs = digested.reduce((sum, d) => sum + d.entry.analysis.carbsG, 0);
  let energyScore = 60;

  if (totalCarbs >= 30) energyScore += 20;
  if (totalCarbs >= 50) energyScore += 10;
  if (totalProtein >= 20) energyScore += 10;
  if (totalCarbs < 15 && workoutType !== 'rest') energyScore -= 25;
  if (digested.length === 0) energyScore = 20;

  energyScore = clampScore(energyScore);

  // === Composite Score ===
  const weights = { digestion: 0.35, carbs: 0.28, timing: 0.22, energy: 0.15 };
  const intensityMult = WORKOUT_INTENSITY[workoutType] || 0.85;

  let rawScore =
    digestionScore * weights.digestion +
    carbScore * weights.carbs +
    timingScore * weights.timing +
    energyScore * weights.energy;

  // Apply goal modifier
  if (user?.goal === 'cutting') rawScore *= 0.95;
  if (user?.goal === 'lean_bulk') rawScore *= 1.02;

  const score = clampScore(rawScore * (0.7 + intensityMult * 0.3));

  const breakdown: ReadinessBreakdown = {
    digestionLoad: clampScore(digestionScore),
    carbAvailability: clampScore(carbScore),
    mealTiming: clampScore(timingScore),
    energyReadiness: clampScore(energyScore),
  };

  const status = getStatus(score, carbScore, digested.length, workoutType);
  const waitMinutes = status === 'WAIT' ? estimateWaitTime(digested, workoutType) : 0;

  return {
    score,
    status,
    headline: getHeadline(status, score, workoutType),
    explanation: getExplanation(status, score, digested, workoutType, totalCarbs, totalAvailableCarbs, user),
    waitMinutes,
    preWorkoutSuggestion: getPreWorkoutSuggestion(status, workoutType, totalAvailableCarbs, requiredCarbs),
    postWorkoutSuggestion: getPostWorkoutSuggestion(workoutType, user),
    breakdown,
    workoutType,
    calculatedAt: new Date().toISOString(),
  };
}

function getStatus(score: number, carbScore: number, mealCount: number, workoutType: WorkoutType): ReadinessStatus {
  if (workoutType === 'rest') return 'READY';
  if (mealCount === 0) return 'EAT_FIRST';
  if (carbScore < 25 && workoutType !== 'cardio') return 'EAT_FIRST';
  if (score >= 68) return 'READY';
  if (score >= 38) return 'WAIT';
  return 'EAT_FIRST';
}

function estimateWaitTime(digested: DigestedMeal[], workoutType: WorkoutType): number {
  if (digested.length === 0) return 0;
  const heaviest = digested.reduce((h, d) => d.activeDigestionLoad > h.activeDigestionLoad ? d : h);
  const baseWait = heaviest.entry.analysis.heaviness === 'heavy' ? 60 :
    heaviest.entry.analysis.heaviness === 'medium' ? 35 : 15;
  return Math.max(15, baseWait - Math.floor(heaviest.minutesAgo * 0.3));
}

function getHeadline(status: ReadinessStatus, score: number, workoutType: WorkoutType): string {
  const wt = workoutType === 'rest' ? 'recovery' : workoutType.replace('_', ' ');
  switch (status) {
    case 'READY':
      if (score >= 90) return `Peak ready for ${wt}`;
      if (score >= 80) return `Great window for ${wt}`;
      return `Ready to train ${wt}`;
    case 'WAIT':
      return `Wait a bit before ${wt}`;
    case 'EAT_FIRST':
      return `Fuel up before ${wt}`;
  }
}

function getExplanation(
  status: ReadinessStatus,
  score: number,
  digested: DigestedMeal[],
  workoutType: WorkoutType,
  totalCarbs: number,
  availableCarbs: number,
  user: UserProfile | null,
): string {
  const wt = workoutType.replace('_', ' ');

  if (digested.length === 0) {
    return `You haven't eaten in over 6 hours. Your glycogen stores are likely depleted — training now risks poor performance and muscle breakdown. Have a balanced meal or quick carbs first.`;
  }

  const heaviest = digested.reduce((h, d) =>
    d.entry.analysis.digestionLoadScore > h.entry.analysis.digestionLoadScore ? d : h
  );
  const minsAgo = heaviest.minutesAgo;
  const heavy = heaviest.entry.analysis.heaviness;

  if (status === 'EAT_FIRST') {
    if (availableCarbs < 20 && (workoutType === 'pull' || workoutType === 'legs')) {
      return `You're low on available carbohydrates for ${wt} — one of the most demanding workout types. Your muscles need glycogen to perform. A quick carb source now will make a big difference.`;
    }
    return `Your recent meal is still actively digesting. Training now with high digestion load can cause discomfort, reduce performance, and divert blood flow away from your muscles. Give it ${estimateWaitTime(digested, workoutType)} more minutes.`;
  }

  if (status === 'WAIT') {
    if (heavy === 'heavy' && minsAgo < 90) {
      return `Your last meal was ${heavy} — digestion is still active ${minsAgo} minutes in. You'll feel much stronger once the food settles. Give it ${estimateWaitTime(digested, workoutType)} more minutes for peak performance.`;
    }
    return `Your body is still processing your last meal. Your energy levels will peak soon — ${estimateWaitTime(digested, workoutType)} minutes will put you in the optimal window for ${wt}.`;
  }

  // READY
  if (score >= 85) {
    return `Your nutrition timing is dialed in. Carbs are available, digestion is clear, and your energy levels are primed. This is an excellent window for ${wt}. Go crush it.`;
  }
  return `You're in a good training window. Your last meal has partially digested, carb availability is solid, and your body is ready to perform. ${wt.charAt(0).toUpperCase() + wt.slice(1)} day is on.`;
}

function getPreWorkoutSuggestion(
  status: ReadinessStatus,
  workoutType: WorkoutType,
  availableCarbs: number,
  requiredCarbs: number,
): string {
  if (status === 'READY') {
    if (availableCarbs < requiredCarbs * 0.8) {
      return 'Optional: 1 banana or a small handful of dates for an extra carb boost.';
    }
    return 'You\'re set. Optional: black coffee or pre-workout 20 min before.';
  }

  const carbNeeded = Math.max(0, Math.round(requiredCarbs - availableCarbs));

  switch (workoutType) {
    case 'pull':
    case 'legs':
      return `Eat ${carbNeeded}-${carbNeeded + 15}g of fast carbs: banana, white rice, or rice cakes. Wait 20-30 min, then train.`;
    case 'push':
      return `${carbNeeded}g quick carbs: 1 banana, dates, or a small bowl of cereal. Give it 20 min.`;
    case 'cardio':
      return 'Light carbs: half a banana or a handful of raisins 15-20 min before.';
    case 'full_body':
      return `Aim for ${carbNeeded}-${carbNeeded + 20}g carbs: rice cakes with jam, white bread, or a banana smoothie.`;
    default:
      return 'Have a small, easily digestible carb snack 20-30 minutes before training.';
  }
}

function getPostWorkoutSuggestion(workoutType: WorkoutType, user: UserProfile | null): string {
  const goal = user?.goal || 'maintenance';
  const base = workoutType === 'cardio'
    ? 'Post-cardio: protein shake + fruit to replenish glycogen and repair muscle.'
    : 'Post-workout: 30-50g protein + 50-80g carbs within 45-60 minutes.';

  if (goal === 'cutting') return base + ' Keep fats low. Prioritize protein to protect muscle.';
  if (goal === 'lean_bulk') return base + ' Add 20-30g extra carbs to support growth. Lean protein source is ideal.';
  return base + ' A chicken bowl with rice or a protein shake with oats works perfectly.';
}
