export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose" | "maintain" | "gain";

export type TrackedMacro = "protein" | "carbs" | "fats" | "sugars" | "fiber" | "sodium";

export interface UserProfile {
  age: number;
  height: number;
  weight: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
  region: string;
  trackedMacros: TrackedMacro[];
  tdee: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  targetSugars: number;
}

export interface FoodLog {
  id: string;
  timestamp: number;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  sugars: number;
}

export interface WeightLog {
  date: string;
  weight: number;
}
