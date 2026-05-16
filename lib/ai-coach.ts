import type { FoodEntry, WorkoutType, FuelResponse, FuelQuery } from '@/types';
import { generateId } from '@/lib/utils';

interface ParsedIntent {
  type: 'workout_timing' | 'hunger' | 'feel_heavy' | 'feel_tired' | 'energy_need' | 'already_ate' | 'general';
  workoutType?: WorkoutType;
  minutesUntilWorkout?: number;
  foodMentioned?: string;
}

const WORKOUT_CARB_NEEDS: Record<WorkoutType, number> = {
  legs: 50, pull: 45, full_body: 45, cardio: 40, push: 35, rest: 0,
};

const WORKOUT_EMOJIS: Record<WorkoutType, string> = {
  push: '💪', pull: '🏋️', legs: '🦵', full_body: '⚡', cardio: '🏃', rest: '😴',
};

function parseIntent(text: string): ParsedIntent {
  const lower = text.toLowerCase();

  // Extract workout type from text
  let workoutType: WorkoutType | undefined;
  if (/\bpull\b/.test(lower)) workoutType = 'pull';
  else if (/\bpush\b/.test(lower)) workoutType = 'push';
  else if (/\bleg(s)?\b/.test(lower)) workoutType = 'legs';
  else if (/cardio|run(ning)?|jog/.test(lower)) workoutType = 'cardio';
  else if (/full.?body/.test(lower)) workoutType = 'full_body';

  // Extract time until workout
  let minutesUntilWorkout: number | undefined;
  const hourMatch = lower.match(/(\d+)\s*(?:hour|hr)s?/);
  const minMatch = lower.match(/(\d+)\s*min(?:ute)?s?/);
  if (hourMatch) minutesUntilWorkout = parseInt(hourMatch[1]) * 60;
  else if (minMatch) minutesUntilWorkout = parseInt(minMatch[1]);

  // Workout timing intent
  if (minutesUntilWorkout !== undefined || (workoutType && /workout|training|session|gym/.test(lower))) {
    return { type: 'workout_timing', workoutType, minutesUntilWorkout: minutesUntilWorkout ?? 90 };
  }

  // Feel states
  if (/heavy|bloated|full|stuffed/.test(lower)) return { type: 'feel_heavy' };
  if (/tired|low energy|no energy|crash|sluggish|drained/.test(lower)) return { type: 'feel_tired' };

  // Hunger
  if (/hungry|hunger|starving/.test(lower)) return { type: 'hunger' };

  // Energy need
  if (/energy|boost|fuel up|power|perform/.test(lower)) return { type: 'energy_need' };

  // Already ate
  if (/ate|had|just ate|just had|eaten|finished eating/.test(lower)) {
    return { type: 'already_ate', foodMentioned: text };
  }

  return { type: 'general' };
}

function respondToWorkoutTiming(
  workoutType: WorkoutType,
  minutesUntilWorkout: number,
  foodEntries: FoodEntry[],
): FuelResponse {
  const carbs = WORKOUT_CARB_NEEDS[workoutType];
  const recentCarbs = foodEntries
    .filter(e => (Date.now() - new Date(e.timestamp).getTime()) < 4 * 3600000)
    .reduce((sum, e) => sum + e.analysis.carbsG, 0);

  const carbDeficit = Math.max(0, carbs - Math.round(recentCarbs));
  const emoji = WORKOUT_EMOJIS[workoutType];

  if (minutesUntilWorkout <= 30) {
    return {
      recommendation: `${minutesUntilWorkout} minutes out — fast carbs only. Eat now and get moving.`,
      timing: 'Eat immediately',
      whatToEat: ['1 banana (quick glucose)', 'Rice cakes with honey', '3–4 medjool dates', 'Small fruit juice (200ml)'],
      toAvoid: ['Any fat-heavy food', 'High-fiber foods', 'Dairy products', 'Large portions'],
      urgency: 'now',
      emoji,
    };
  }

  if (minutesUntilWorkout <= 75) {
    return {
      recommendation: `You have ${minutesUntilWorkout} min. A light, carb-forward meal now gives your body enough time to absorb before training.${carbDeficit > 10 ? ` Add ~${carbDeficit}g carbs to top up.` : ''}`,
      timing: 'Eat in the next 10 minutes, then warm up',
      whatToEat: ['Rice cakes + banana', 'Oats with honey (small bowl)', 'Toast + light jam + boiled egg', 'Protein shake + fruit'],
      toAvoid: ['Red meat', 'High-fat sauces', 'Heavy dairy', 'Fried foods'],
      urgency: 'soon',
      emoji,
    };
  }

  // 75+ minutes — full meal possible
  return {
    recommendation: `${minutesUntilWorkout} minutes is a great window. Eat a full performance meal now — by training time your digestion will clear and your readiness will peak.`,
    timing: 'Eat now, train in ~90 minutes',
    whatToEat: [
      `Chicken + white rice + light veg (${carbs}g carb target)`,
      'Oats + 2 eggs + banana',
      'Pasta with lean protein (moderate portion)',
      'Any balanced meal — protein + carbs',
    ],
    toAvoid: ['Deep-fried foods', 'Very high-fat meals', 'Extremely large portions'],
    urgency: 'soon',
    emoji,
  };
}

export function generateFuelResponse(
  text: string,
  foodEntries: FoodEntry[],
  workoutType: WorkoutType,
): FuelResponse {
  const intent = parseIntent(text);

  switch (intent.type) {
    case 'workout_timing':
      return respondToWorkoutTiming(
        intent.workoutType || workoutType,
        intent.minutesUntilWorkout ?? 90,
        foodEntries,
      );

    case 'hunger': {
      const hasFuel = foodEntries.some(
        e => (Date.now() - new Date(e.timestamp).getTime()) < 4 * 3600000,
      );
      return {
        recommendation: hasFuel
          ? "You've already fueled today. If you're genuinely hungry pre-workout, eat light and fast — don't force a full meal."
          : "You haven't logged food yet. Eat a proper performance meal: lean protein + complex carbs. Your next workout depends on it.",
        timing: 'Eat now — train in 60–90 min',
        whatToEat: ['Banana + whey shake', 'Oats + milk + honey', 'Rice cakes + peanut butter (light)', 'Greek yogurt + berries'],
        toAvoid: ['Heavy fat meals', 'Fried food', 'Large portions if training soon'],
        urgency: 'now',
        emoji: '🍽️',
      };
    }

    case 'feel_heavy':
      return {
        recommendation: "Feeling heavy = active digestion. Your blood flow is split between gut and muscles. Don't force high-intensity training — let your body finish the job.",
        timing: 'Wait 45–90 minutes before intense training',
        whatToEat: ['Electrolyte water', 'Ginger tea (speeds digestion)', 'Wait — no more food right now'],
        toAvoid: ['More food', 'High-intensity exercise within 60 min', 'Caffeine on an overfull stomach'],
        urgency: 'wait',
        emoji: '⏳',
      };

    case 'feel_tired':
      return {
        recommendation: "Low energy = low blood sugar or depleted glycogen. Get fast carbs in immediately. If training in 2+ hours, eat a full meal.",
        timing: 'Eat within 10–15 minutes',
        whatToEat: ['Banana (fastest sugar response)', 'Medjool dates', 'Rice cakes + honey', 'Orange juice 200ml'],
        toAvoid: ['High-fat foods (slow absorption)', 'Large meals if training soon', 'Protein only — you need carbs'],
        urgency: 'now',
        emoji: '⚡',
      };

    case 'energy_need':
      return {
        recommendation: "For peak workout energy, carbs are your primary fuel. 30–50g of fast-absorbing carbs 30–60 min before training is scientifically proven to boost performance.",
        timing: '30–60 min before training',
        whatToEat: ['Banana', 'White rice (small portion)', 'Rice cakes', 'Toast + honey', 'Sports drink or fruit juice'],
        toAvoid: ['High-fat foods (slow energy)', 'High-fiber foods', 'Large meals within 90 min of training'],
        urgency: 'soon',
        emoji: '🔋',
      };

    case 'already_ate': {
      const t = (text || '').toLowerCase();
      const isHeavy = /pasta|pizza|burger|fries|heavy|big|large|steak|pork|fried|creamy|cheesy/.test(t);
      const hasFat = /butter|cheese|cream|fatty|avocado|oil/.test(t);

      if (isHeavy || hasFat) {
        return {
          recommendation: "That sounds like a heavier meal. Digestion is active — training within 90 min may cause discomfort and tank your performance. Your optimal window opens at the ~2 hour mark.",
          timing: 'Best training window: 90–120 min from now',
          whatToEat: ['Nothing — let it digest', 'Small carb top-up (banana) after 90 min if needed'],
          toAvoid: ['Intense training within 90 min', 'More heavy food', 'Lying down (slows digestion)'],
          urgency: 'wait',
          emoji: '⏳',
        };
      }

      return {
        recommendation: "Sounds like a solid meal. Give it 45–60 minutes to settle, then your readiness should be in a good window. Optionally, a small carb top-up at the 45-min mark can sharpen your energy.",
        timing: '45–60 min until optimal training window',
        whatToEat: ['Optional: banana or rice cake at the 45-min mark'],
        toAvoid: ['Another full meal too soon', 'High-fat snacks'],
        urgency: 'soon',
        emoji: '✓',
      };
    }

    default:
      return {
        recommendation: "For peak performance, pair complex carbs with lean protein 90 min before training. Keep fat and fiber low pre-workout. Post-workout: 30–50g protein within 45 minutes.",
        timing: '60–90 min before training',
        whatToEat: ['Chicken + rice', 'Oats + protein shake', 'Pasta + lean protein', 'Any balanced meal'],
        toAvoid: ['High-fat meals pre-workout', 'Training fasted for heavy lifting', 'Large meals within 60 min'],
        urgency: 'soon',
        emoji: '🤖',
      };
  }
}

export function createFuelQuery(
  text: string,
  foodEntries: FoodEntry[],
  workoutType: WorkoutType,
): FuelQuery {
  return {
    id: generateId(),
    text,
    response: generateFuelResponse(text, foodEntries, workoutType),
    createdAt: new Date().toISOString(),
  };
}
