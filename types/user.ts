export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose" | "maintain" | "gain";
export type Units = "metric" | "imperial";
export type DietaryPreference = "none" | "vegetarian" | "vegan" | "pescatarian" | "keto" | "paleo" | "halal" | "kosher";

export type TrackedMacro = "protein" | "carbs" | "fats" | "sugars" | "fiber";

export interface UserProfile {
  age: number;
  height: number;
  weight: number;
  gender: Gender;
  units: Units;
  activityLevel: ActivityLevel;
  goal: Goal;
  region: string;
  allergies: string[];
  dietaryPreference: DietaryPreference;
  trackedMacros: TrackedMacro[];
  isPremium: boolean;
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
  fiber?: number;
}

export interface WeightLog {
  date: string;
  weight: number;
}
