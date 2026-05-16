export type WorkoutType = 'push' | 'pull' | 'legs' | 'full_body' | 'cardio' | 'rest';
export type TrainingSplit = 'ppl' | 'full_body';
export type Goal = 'cutting' | 'lean_bulk' | 'maintenance';
export type Gender = 'male' | 'female' | 'other';
export type MealHeaviness = 'light' | 'medium' | 'heavy';
export type ReadinessStatus = 'READY' | 'WAIT' | 'EAT_FIRST';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  gender: Gender;
  goal: Goal;
  trainingSplit: TrainingSplit;
  trainingFrequency: number;
  fuelPreferences: string[];
  onboardingComplete: boolean;
  createdAt: string;
}

export interface FoodAnalysis {
  estimatedCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  heaviness: MealHeaviness;
  digestionLoadScore: number;
  carbAvailabilityScore: number;
  identifiedFoods: string[];
  digestsInMinutes: number;
}

export interface FoodEntry {
  id: string;
  text: string;
  timestamp: string;
  analysis: FoodAnalysis;
}

export interface ReadinessBreakdown {
  digestionLoad: number;
  carbAvailability: number;
  mealTiming: number;
  energyReadiness: number;
}

export interface ReadinessResult {
  score: number;
  status: ReadinessStatus;
  headline: string;
  explanation: string;
  waitMinutes: number;
  preWorkoutSuggestion: string;
  postWorkoutSuggestion: string;
  breakdown: ReadinessBreakdown;
  workoutType: WorkoutType;
  calculatedAt: string;
}

export interface WorkoutSession {
  id: string;
  type: WorkoutType;
  scheduledAt: string;
  readinessScore: number;
  readinessStatus: ReadinessStatus;
  completed: boolean;
}

export interface AppStats {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  perfectFueledCount: number;
  avgReadinessScore: number;
  weeklyAvg: number[];
}

export interface AppState {
  user: UserProfile | null;
  foodEntries: FoodEntry[];
  workoutSessions: WorkoutSession[];
  todayWorkoutType: WorkoutType;
  lastReadiness: ReadinessResult | null;
  stats: AppStats;

  setUser: (user: UserProfile) => void;
  addFoodEntry: (entry: FoodEntry) => void;
  removeFoodEntry: (id: string) => void;
  setTodayWorkoutType: (type: WorkoutType) => void;
  setLastReadiness: (result: ReadinessResult) => void;
  completeWorkout: (id: string) => void;
  clearToday: () => void;
  reset: () => void;
}
