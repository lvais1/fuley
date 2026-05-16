import type { FoodAnalysis, MealHeaviness } from '@/types';

interface FoodItem {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  digestionLoad: number;
  heaviness: MealHeaviness;
  digestsInMinutes: number;
  servingCalories: number;
}

const FOOD_DB: Record<string, FoodItem> = {
  // Proteins
  chicken: { protein: 31, carbs: 0, fat: 3.6, fiber: 0, digestionLoad: 30, heaviness: 'medium', digestsInMinutes: 180, servingCalories: 165 },
  turkey: { protein: 29, carbs: 0, fat: 3, fiber: 0, digestionLoad: 28, heaviness: 'light', digestsInMinutes: 170, servingCalories: 150 },
  salmon: { protein: 25, carbs: 0, fat: 13, fiber: 0, digestionLoad: 38, heaviness: 'medium', digestsInMinutes: 200, servingCalories: 220 },
  tuna: { protein: 28, carbs: 0, fat: 1, fiber: 0, digestionLoad: 20, heaviness: 'light', digestsInMinutes: 150, servingCalories: 130 },
  beef: { protein: 26, carbs: 0, fat: 15, fiber: 0, digestionLoad: 55, heaviness: 'heavy', digestsInMinutes: 270, servingCalories: 250 },
  steak: { protein: 27, carbs: 0, fat: 17, fiber: 0, digestionLoad: 60, heaviness: 'heavy', digestsInMinutes: 300, servingCalories: 270 },
  pork: { protein: 24, carbs: 0, fat: 14, fiber: 0, digestionLoad: 50, heaviness: 'heavy', digestsInMinutes: 250, servingCalories: 230 },
  egg: { protein: 6, carbs: 0.6, fat: 5, fiber: 0, digestionLoad: 22, heaviness: 'light', digestsInMinutes: 150, servingCalories: 70 },
  eggs: { protein: 12, carbs: 1.2, fat: 10, fiber: 0, digestionLoad: 22, heaviness: 'light', digestsInMinutes: 150, servingCalories: 140 },
  shrimp: { protein: 24, carbs: 0.2, fat: 1.7, fiber: 0, digestionLoad: 18, heaviness: 'light', digestsInMinutes: 120, servingCalories: 120 },
  // Carb sources
  rice: { protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, digestionLoad: 18, heaviness: 'light', digestsInMinutes: 120, servingCalories: 130 },
  pasta: { protein: 5, carbs: 31, fat: 1.1, fiber: 1.8, digestionLoad: 24, heaviness: 'medium', digestsInMinutes: 150, servingCalories: 160 },
  bread: { protein: 3.5, carbs: 15, fat: 1, fiber: 1.5, digestionLoad: 22, heaviness: 'light', digestsInMinutes: 120, servingCalories: 80 },
  toast: { protein: 3.5, carbs: 15, fat: 1, fiber: 1.5, digestionLoad: 22, heaviness: 'light', digestsInMinutes: 120, servingCalories: 80 },
  oats: { protein: 3.5, carbs: 17, fat: 1.5, fiber: 2, digestionLoad: 20, heaviness: 'light', digestsInMinutes: 130, servingCalories: 100 },
  oatmeal: { protein: 5, carbs: 27, fat: 2.5, fiber: 4, digestionLoad: 20, heaviness: 'light', digestsInMinutes: 130, servingCalories: 150 },
  potato: { protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, digestionLoad: 20, heaviness: 'light', digestsInMinutes: 130, servingCalories: 90 },
  sweetpotato: { protein: 2, carbs: 20, fat: 0.1, fiber: 3, digestionLoad: 20, heaviness: 'light', digestsInMinutes: 140, servingCalories: 90 },
  banana: { protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, digestionLoad: 12, heaviness: 'light', digestsInMinutes: 60, servingCalories: 90 },
  apple: { protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, digestionLoad: 10, heaviness: 'light', digestsInMinutes: 60, servingCalories: 55 },
  cereal: { protein: 3, carbs: 28, fat: 1, fiber: 2, digestionLoad: 18, heaviness: 'light', digestsInMinutes: 90, servingCalories: 130 },
  cornflakes: { protein: 2, carbs: 25, fat: 0.3, fiber: 1, digestionLoad: 15, heaviness: 'light', digestsInMinutes: 80, servingCalories: 100 },
  // Fats & dairy
  avocado: { protein: 2, carbs: 9, fat: 15, fiber: 7, digestionLoad: 42, heaviness: 'medium', digestsInMinutes: 200, servingCalories: 160 },
  cheese: { protein: 7, carbs: 0.4, fat: 9, fiber: 0, digestionLoad: 45, heaviness: 'medium', digestsInMinutes: 220, servingCalories: 120 },
  butter: { protein: 0.1, carbs: 0.1, fat: 11, fiber: 0, digestionLoad: 42, heaviness: 'heavy', digestsInMinutes: 210, servingCalories: 100 },
  milk: { protein: 3.4, carbs: 4.8, fat: 3.3, fiber: 0, digestionLoad: 25, heaviness: 'light', digestsInMinutes: 90, servingCalories: 60 },
  yogurt: { protein: 10, carbs: 7, fat: 0.7, fiber: 0, digestionLoad: 20, heaviness: 'light', digestsInMinutes: 90, servingCalories: 90 },
  cream: { protein: 1.5, carbs: 2, fat: 20, fiber: 0, digestionLoad: 50, heaviness: 'heavy', digestsInMinutes: 240, servingCalories: 200 },
  // Protein supplements
  'protein shake': { protein: 25, carbs: 5, fat: 2, fiber: 1, digestionLoad: 15, heaviness: 'light', digestsInMinutes: 60, servingCalories: 130 },
  'protein powder': { protein: 25, carbs: 3, fat: 1.5, fiber: 0.5, digestionLoad: 12, heaviness: 'light', digestsInMinutes: 60, servingCalories: 120 },
  whey: { protein: 25, carbs: 3, fat: 2, fiber: 0, digestionLoad: 12, heaviness: 'light', digestsInMinutes: 60, servingCalories: 120 },
  // Fast food / heavy meals
  pizza: { protein: 11, carbs: 33, fat: 11, fiber: 2, digestionLoad: 65, heaviness: 'heavy', digestsInMinutes: 300, servingCalories: 285 },
  burger: { protein: 17, carbs: 24, fat: 20, fiber: 1, digestionLoad: 72, heaviness: 'heavy', digestsInMinutes: 300, servingCalories: 350 },
  fries: { protein: 3, carbs: 37, fat: 13, fiber: 3, digestionLoad: 58, heaviness: 'heavy', digestsInMinutes: 270, servingCalories: 280 },
  sandwich: { protein: 15, carbs: 35, fat: 12, fiber: 3, digestionLoad: 45, heaviness: 'medium', digestsInMinutes: 200, servingCalories: 320 },
  wrap: { protein: 18, carbs: 40, fat: 10, fiber: 3, digestionLoad: 42, heaviness: 'medium', digestsInMinutes: 190, servingCalories: 320 },
  // Light meals
  salad: { protein: 2, carbs: 8, fat: 5, fiber: 3, digestionLoad: 12, heaviness: 'light', digestsInMinutes: 90, servingCalories: 90 },
  soup: { protein: 5, carbs: 12, fat: 3, fiber: 2, digestionLoad: 18, heaviness: 'light', digestsInMinutes: 100, servingCalories: 100 },
  // Snacks
  nuts: { protein: 6, carbs: 6, fat: 16, fiber: 3, digestionLoad: 40, heaviness: 'medium', digestsInMinutes: 180, servingCalories: 180 },
  almonds: { protein: 6, carbs: 6, fat: 15, fiber: 3.5, digestionLoad: 38, heaviness: 'medium', digestsInMinutes: 180, servingCalories: 170 },
  peanut: { protein: 7, carbs: 7, fat: 16, fiber: 2.5, digestionLoad: 42, heaviness: 'medium', digestsInMinutes: 190, servingCalories: 190 },
  // Beverages
  juice: { protein: 0.5, carbs: 25, fat: 0.2, fiber: 0.5, digestionLoad: 8, heaviness: 'light', digestsInMinutes: 40, servingCalories: 110 },
  smoothie: { protein: 4, carbs: 30, fat: 1.5, fiber: 3, digestionLoad: 15, heaviness: 'light', digestsInMinutes: 60, servingCalories: 150 },
  coffee: { protein: 0.3, carbs: 0, fat: 0, fiber: 0, digestionLoad: 5, heaviness: 'light', digestsInMinutes: 30, servingCalories: 5 },
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[0-9]+\s*(g|kg|ml|oz|cups?|slices?|pieces?|scoops?|servings?)/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function findFoods(tokens: string[]): Array<{ key: string; item: FoodItem }> {
  const found: Array<{ key: string; item: FoodItem }> = [];
  const matched = new Set<string>();

  // Multi-word first
  const text = tokens.join(' ');
  for (const [key, item] of Object.entries(FOOD_DB)) {
    if (key.includes(' ') && text.includes(key) && !matched.has(key)) {
      found.push({ key, item });
      matched.add(key);
    }
  }

  // Single words
  for (const token of tokens) {
    if (FOOD_DB[token] && !matched.has(token)) {
      found.push({ key: token, item: FOOD_DB[token] });
      matched.add(token);
    }
    // Partial match
    for (const [key, item] of Object.entries(FOOD_DB)) {
      if (!matched.has(key) && !key.includes(' ') && (key.startsWith(token) || token.startsWith(key)) && key.length > 3) {
        found.push({ key, item });
        matched.add(key);
        break;
      }
    }
  }

  return found;
}

function extractPortionMultiplier(text: string): number {
  const patterns = [
    { re: /\b(\d+)\s*eggs?\b/i, mult: (n: number) => n },
    { re: /\b(two|2)\b/i, mult: () => 2 },
    { re: /\b(three|3)\b/i, mult: () => 3 },
    { re: /\blarge\b/i, mult: () => 1.4 },
    { re: /\bsmall\b/i, mult: () => 0.7 },
    { re: /\bdouble\b/i, mult: () => 2 },
    { re: /\bhalf\b/i, mult: () => 0.5 },
  ];
  let multiplier = 1;
  for (const p of patterns) {
    const m = text.match(p.re);
    if (m) {
      multiplier = typeof p.mult === 'function' ? p.mult(parseInt(m[1] || '1')) : p.mult;
      break;
    }
  }
  return multiplier;
}

export function analyzeFood(text: string): FoodAnalysis {
  const tokens = tokenize(text);
  const foods = findFoods(tokens);
  const multiplier = extractPortionMultiplier(text);

  if (foods.length === 0) {
    return generateGenericAnalysis(text);
  }

  let totalProtein = 0, totalCarbs = 0, totalFat = 0, totalFiber = 0;
  let totalCalories = 0, totalDigestionLoad = 0, maxDigestTime = 0;
  const identifiedFoods: string[] = [];

  for (const { key, item } of foods) {
    const mult = foods.length === 1 ? multiplier : 1;
    totalProtein += item.protein * mult;
    totalCarbs += item.carbs * mult;
    totalFat += item.fat * mult;
    totalFiber += item.fiber * mult;
    totalCalories += item.servingCalories * mult;
    totalDigestionLoad = Math.max(totalDigestionLoad, item.digestionLoad);
    maxDigestTime = Math.max(maxDigestTime, item.digestsInMinutes);
    identifiedFoods.push(key);
  }

  // Compound digestion: fat increases digestion time and load
  const fatPenalty = totalFat > 20 ? (totalFat - 20) * 0.8 : 0;
  const fiberBonus = totalFiber > 5 ? (totalFiber - 5) * 1.5 : 0;
  const finalDigestionLoad = Math.min(95, totalDigestionLoad + fatPenalty + fiberBonus);
  const digestsInMinutes = Math.min(360, maxDigestTime + (totalFat > 15 ? 30 : 0));

  const heaviness = getHeaviness(finalDigestionLoad, totalCalories);
  const carbAvailabilityScore = Math.min(100, (totalCarbs / 50) * 80 + (totalCarbs > 30 ? 20 : 0));

  return {
    estimatedCalories: Math.round(totalCalories),
    proteinG: Math.round(totalProtein),
    carbsG: Math.round(totalCarbs),
    fatG: Math.round(totalFat),
    fiberG: Math.round(totalFiber),
    heaviness,
    digestionLoadScore: Math.round(finalDigestionLoad),
    carbAvailabilityScore: Math.round(carbAvailabilityScore),
    identifiedFoods,
    digestsInMinutes: Math.round(digestsInMinutes),
  };
}

function getHeaviness(digestionLoad: number, calories: number): MealHeaviness {
  if (digestionLoad >= 50 || calories > 500) return 'heavy';
  if (digestionLoad >= 30 || calories > 250) return 'medium';
  return 'light';
}

function generateGenericAnalysis(text: string): FoodAnalysis {
  const lower = text.toLowerCase();
  const isHeavy = /fried|burger|pizza|pasta|creamy|cheesy|cake|fried/.test(lower);
  const isLight = /salad|soup|fruit|veggie|vegetable|broth/.test(lower);

  const digestionLoad = isHeavy ? 58 : isLight ? 18 : 35;
  const carbs = isHeavy ? 30 : isLight ? 10 : 20;

  return {
    estimatedCalories: isHeavy ? 450 : isLight ? 120 : 280,
    proteinG: isHeavy ? 20 : isLight ? 5 : 15,
    carbsG: carbs,
    fatG: isHeavy ? 18 : isLight ? 3 : 8,
    fiberG: isLight ? 4 : 2,
    heaviness: isHeavy ? 'heavy' : isLight ? 'light' : 'medium',
    digestionLoadScore: digestionLoad,
    carbAvailabilityScore: Math.round((carbs / 50) * 80),
    identifiedFoods: ['meal'],
    digestsInMinutes: isHeavy ? 280 : isLight ? 100 : 170,
  };
}
