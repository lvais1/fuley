import type { FoodEntry, WorkoutType, UserProfile, BadWorkoutFactor } from '@/types';
import { minutesSince } from '@/lib/utils';

export interface CrashWarning {
  text: string;
  detail: string;
  icon: string;
}

export interface CrashPrediction {
  risk: 'none' | 'low' | 'medium' | 'high';
  warnings: CrashWarning[];
}

export interface HeavyMealStatus {
  hasHeavyMeal: boolean;
  mealName: string;
  minutesUntilClear: number;
  message: string;
  progress: number;
}

export type { BadWorkoutFactor };

const CARB_REQUIREMENTS: Record<WorkoutType, number> = {
  legs: 50, pull: 45, full_body: 45, cardio: 40, push: 35, rest: 0,
};

function getRecentEntries(foodEntries: FoodEntry[], hours = 6): FoodEntry[] {
  return foodEntries.filter(e => minutesSince(e.timestamp) <= hours * 60);
}

export function predictCrashRisk(
  foodEntries: FoodEntry[],
  workoutType: WorkoutType,
  _user: UserProfile | null,
): CrashPrediction {
  if (workoutType === 'rest') return { risk: 'none', warnings: [] };

  const recent = getRecentEntries(foodEntries);
  const warnings: CrashWarning[] = [];

  // 1. Long fasting window
  const sorted = [...recent].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const lastEntry = sorted[0];
  const hoursSinceMeal = lastEntry ? minutesSince(lastEntry.timestamp) / 60 : 10;

  if (hoursSinceMeal > 5) {
    warnings.push({
      text: 'Low energy likely during training',
      detail: `No food logged in ${Math.round(hoursSinceMeal)}h. Glycogen stores may be depleted.`,
      icon: '⚡',
    });
  }

  // 2. Low carbs vs workout demand
  const totalCarbs = recent.reduce((s, e) => s + e.analysis.carbsG, 0);
  const required = CARB_REQUIREMENTS[workoutType];
  if (totalCarbs < required * 0.5) {
    warnings.push({
      text: 'You may crash halfway through this workout',
      detail: `Only ~${Math.round(totalCarbs)}g carbs available. ${workoutType} training needs ~${required}g for full output.`,
      icon: '📉',
    });
  }

  // 3. Under-fueling total calories
  const totalCal = recent.reduce((s, e) => s + e.analysis.estimatedCalories, 0);
  if (totalCal < 300 && recent.length > 0) {
    warnings.push({
      text: 'Under-fueled for intense training',
      detail: `Total logged intake is low (~${totalCal} kcal). Your body may not have enough fuel for peak output.`,
      icon: '🔋',
    });
  }

  // 4. Low protein for recovery
  const totalProtein = recent.reduce((s, e) => s + e.analysis.proteinG, 0);
  if (totalProtein < 15) {
    warnings.push({
      text: 'Low protein — recovery may suffer',
      detail: `~${Math.round(totalProtein)}g protein logged. Aim for 25–30g pre-workout to protect muscles.`,
      icon: '🔄',
    });
  }

  const risk: CrashPrediction['risk'] =
    warnings.length === 0 ? 'none' :
    warnings.length === 1 ? 'low' :
    warnings.length === 2 ? 'medium' : 'high';

  return { risk, warnings };
}

export function detectHeavyMeal(foodEntries: FoodEntry[]): HeavyMealStatus {
  const recent = getRecentEntries(foodEntries, 4);
  const sorted = [...recent].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const heavyMeal = sorted.find(e => e.analysis.heaviness === 'heavy');
  if (!heavyMeal) {
    return { hasHeavyMeal: false, mealName: '', minutesUntilClear: 0, message: '', progress: 100 };
  }

  const minsAgo = minutesSince(heavyMeal.timestamp);
  const digestsIn = heavyMeal.analysis.digestsInMinutes;
  const progress = Math.min(100, Math.round((minsAgo / digestsIn) * 100));
  const minutesUntilClear = Math.max(0, digestsIn - minsAgo);

  let message: string;
  if (minutesUntilClear > 90) {
    message = `Your digestion load is still high. Best training window opens in ~${minutesUntilClear} min.`;
  } else if (minutesUntilClear > 30) {
    message = `This meal may feel heavy before intense training. ${minutesUntilClear} more minutes until your window opens.`;
  } else {
    message = `Almost ready. Digestion is nearly complete — start warming up soon.`;
  }

  return {
    hasHeavyMeal: true,
    mealName: heavyMeal.text,
    minutesUntilClear,
    message,
    progress,
  };
}

export function getBadWorkoutFactors(
  foodEntries: FoodEntry[],
  workoutType: WorkoutType,
  _user: UserProfile | null,
): BadWorkoutFactor[] {
  if (workoutType === 'rest') return [];

  const recent = getRecentEntries(foodEntries);
  const factors: BadWorkoutFactor[] = [];
  const required = CARB_REQUIREMENTS[workoutType];
  const totalCarbs = recent.reduce((s, e) => s + e.analysis.carbsG, 0);

  // Low carbs
  if (totalCarbs < required * 0.6) {
    const severity = totalCarbs < required * 0.3 ? 'high' : 'medium';
    factors.push({
      reason: 'Low carb intake',
      detail: `Only ${Math.round(totalCarbs)}g carbs available. ${workoutType.replace('_', ' ')} training demands ~${required}g for full strength.`,
      severity,
      icon: '📉',
    });
  }

  // Heavy meal < 90 min ago
  const heavyRecent = recent.find(e => e.analysis.heaviness === 'heavy' && minutesSince(e.timestamp) < 90);
  if (heavyRecent) {
    factors.push({
      reason: 'Heavy meal still digesting',
      detail: 'Blood flow is directed to your gut. Muscle performance and oxygen delivery are reduced.',
      severity: 'medium',
      icon: '⚠️',
    });
  }

  // Fasting too long
  const sorted = [...recent].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const hoursSinceMeal = sorted[0] ? minutesSince(sorted[0].timestamp) / 60 : 10;
  if (hoursSinceMeal > 4) {
    factors.push({
      reason: 'Long fasting window',
      detail: `${Math.round(hoursSinceMeal)}h since your last meal. Energy availability is lower than optimal for training.`,
      severity: hoursSinceMeal > 6 ? 'high' : 'medium',
      icon: '⏰',
    });
  }

  // No hydration logged
  const hasHydration = recent.some(e => /water|juice|smoothie|coffee|tea|drink/i.test(e.text));
  if (!hasHydration && recent.length > 0) {
    factors.push({
      reason: 'No hydration logged',
      detail: 'Even mild dehydration reduces strength by up to 10%. Drink 400–500ml before training.',
      severity: 'low',
      icon: '💧',
    });
  }

  return factors;
}
