import type { FoodEntry, ReadinessResult, AppStats, UserProfile, BodyInsight } from '@/types';
import { generateId, minutesSince } from '@/lib/utils';

export function generateBodyInsights(
  foodEntries: FoodEntry[],
  lastReadiness: ReadinessResult | null,
  stats: AppStats,
  user: UserProfile | null,
): BodyInsight[] {
  if (foodEntries.length < 3) {
    return [{
      id: 'getting-started',
      text: 'Log at least 3 meals to unlock personalized body insights.',
      type: 'tip',
      icon: '🧠',
    }];
  }

  const insights: BodyInsight[] = [];
  const recent = foodEntries.filter(e => minutesSince(e.timestamp) <= 7 * 24 * 60);

  // Carb pattern
  const avgCarbs = recent.reduce((s, e) => s + e.analysis.carbsG, 0) / (recent.length || 1);
  if (avgCarbs > 35) {
    insights.push({
      id: 'high-carb-pattern',
      text: `You consistently fuel with ${Math.round(avgCarbs)}g+ carbs per meal — strong workout readiness foundation.`,
      type: 'pattern',
      icon: '⚡',
    });
  } else if (avgCarbs < 18) {
    insights.push({
      id: 'low-carb-pattern',
      text: `Your carb intake averages only ${Math.round(avgCarbs)}g per meal. On training days, aim higher for better output.`,
      type: 'warning',
      icon: '📉',
    });
  }

  // Heavy meal frequency
  const heavyCount = recent.filter(e => e.analysis.heaviness === 'heavy').length;
  const heavyPct = (heavyCount / (recent.length || 1)) * 100;
  if (heavyPct > 40) {
    insights.push({
      id: 'heavy-meal-frequency',
      text: `${Math.round(heavyPct)}% of your meals are heavy. This creates longer mandatory wait times before training.`,
      type: 'warning',
      icon: '⚠️',
    });
  } else if (heavyPct < 15 && recent.length > 5) {
    insights.push({
      id: 'light-meal-pattern',
      text: 'Most of your meals are light and fast-digesting — excellent for flexible training timing.',
      type: 'pattern',
      icon: '✅',
    });
  }

  // Protein pattern
  const avgProtein = recent.reduce((s, e) => s + e.analysis.proteinG, 0) / (recent.length || 1);
  if (avgProtein > 25) {
    insights.push({
      id: 'high-protein',
      text: `Strong protein intake (avg ${Math.round(avgProtein)}g/meal). Your recovery foundation is solid.`,
      type: 'pattern',
      icon: '💪',
    });
  } else if (avgProtein < 15) {
    insights.push({
      id: 'low-protein',
      text: `Your protein average is low (${Math.round(avgProtein)}g/meal). Higher protein helps muscle recovery and reduces soreness.`,
      type: 'tip',
      icon: '🔄',
    });
  }

  // Readiness trend
  if (lastReadiness) {
    if (lastReadiness.score >= 80) {
      insights.push({
        id: 'high-readiness',
        text: `Your last readiness score was ${lastReadiness.score}/100 — excellent meal timing.`,
        type: 'pattern',
        icon: '🎯',
      });
    }
    if (lastReadiness.breakdown.mealTiming < 50) {
      insights.push({
        id: 'timing-off',
        text: 'Your meal timing has been suboptimal. Try eating 90–120 min before workouts for peak readiness.',
        type: 'tip',
        icon: '⏱️',
      });
    }
  }

  // Workout performance
  if (stats.perfectFueledCount >= 3) {
    insights.push({
      id: 'peak-performer',
      text: `${stats.perfectFueledCount} perfectly fueled workouts logged. You understand your body's fuel rhythm.`,
      type: 'pattern',
      icon: '🏆',
    });
  }

  // Digestion speed
  if (recent.length >= 5) {
    const avgDigest = recent.reduce((s, e) => s + e.analysis.digestsInMinutes, 0) / recent.length;
    if (avgDigest > 200) {
      insights.push({
        id: 'slow-digestion',
        text: `Your meals tend to take ~${Math.round(avgDigest / 60 * 10) / 10}h to digest. Plan workouts 2h+ after eating for best performance.`,
        type: 'tip',
        icon: '🔄',
      });
    }
  }

  // Training split insight
  if (user?.trainingSplit === 'ppl') {
    insights.push({
      id: 'ppl-insight',
      text: 'Pull and Legs days demand the most carbs. Front-load carbs before these sessions for maximum output.',
      type: 'tip',
      icon: '📊',
    });
  }

  // Streak-based
  if (stats.currentStreak >= 5) {
    insights.push({
      id: 'streak-insight',
      text: `${stats.currentStreak}-day streak. Consistent logging = more accurate readiness predictions over time.`,
      type: 'pattern',
      icon: '🔥',
    });
  }

  // Deduplicate by id and limit
  const seen = new Set<string>();
  return insights
    .filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true; })
    .slice(0, 6);
}
