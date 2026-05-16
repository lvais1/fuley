export type WorkoutType = 'push' | 'pull' | 'legs' | 'full_body' | 'cardio' | 'rest';
export type TrainingSplit = 'ppl' | 'full_body';
export type Goal = 'cutting' | 'lean_bulk' | 'maintenance';
export type Gender = 'male' | 'female' | 'other';
export type MealHeaviness = 'light' | 'medium' | 'heavy';
export type ReadinessStatus = 'READY' | 'WAIT' | 'EAT_FIRST';

// Settings types
export type Theme = 'dark' | 'light' | 'system';
export type Language = 'en' | 'he';
export type CoachingTone = 'aggressive' | 'balanced' | 'gentle';

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

// Settings
export interface NotificationSettings {
  workoutReminders: boolean;
  preMealReminders: boolean;
  hydrationReminders: boolean;
  workoutWindowAlerts: boolean;
  aiReadinessAlerts: boolean;
}

export interface CoachingSettings {
  tone: CoachingTone;
  aggressiveReminders: boolean;
  recommendationFrequency: 'low' | 'medium' | 'high';
  insightDepth: 'basic' | 'detailed';
}

export interface AppSettings {
  theme: Theme;
  language: Language;
  notifications: NotificationSettings;
  coaching: CoachingSettings;
}

// AI Fuel Advisor
export interface FuelResponse {
  recommendation: string;
  timing: string;
  whatToEat: string[];
  toAvoid: string[];
  urgency: 'now' | 'soon' | 'wait';
  emoji: string;
}

export interface FuelQuery {
  id: string;
  text: string;
  response: FuelResponse;
  createdAt: string;
}

// Body Insights
export interface BodyInsight {
  id: string;
  text: string;
  type: 'pattern' | 'warning' | 'tip';
  icon: string;
}

// Timeline
export interface TimelinePoint {
  minutesFromNow: number;
  score: number;
  label: string;
  type: 'now' | 'improving' | 'peak' | 'declining';
}

export interface BadWorkoutFactor {
  reason: string;
  detail: string;
  severity: 'low' | 'medium' | 'high';
  icon: string;
}

export interface AppState {
  user: UserProfile | null;
  foodEntries: FoodEntry[];
  workoutSessions: WorkoutSession[];
  todayWorkoutType: WorkoutType;
  lastReadiness: ReadinessResult | null;
  stats: AppStats;
  settings: AppSettings;
  fuelHistory: FuelQuery[];

  setUser: (user: UserProfile) => void;
  addFoodEntry: (entry: FoodEntry) => void;
  removeFoodEntry: (id: string) => void;
  setTodayWorkoutType: (type: WorkoutType) => void;
  setLastReadiness: (result: ReadinessResult) => void;
  completeWorkout: (id?: string) => void;
  clearToday: () => void;
  reset: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addFuelQuery: (query: FuelQuery) => void;
}
