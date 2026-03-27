import { ActivityLevel, Gender, Goal } from "@/types/user";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: Gender
): number {
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel
): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function calculateTargetCalories(tdee: number, goal: Goal): number {
  if (goal === "lose") {
    return Math.round(tdee - 500);
  } else if (goal === "gain") {
    return Math.round(tdee + 300);
  }
  return tdee;
}

export function calculateMacros(
  targetCalories: number,
  weight: number,
  goal: Goal
) {
  let proteinGrams = weight * 2.2;
  if (goal === "gain") {
    proteinGrams = weight * 2.4;
  } else if (goal === "lose") {
    proteinGrams = weight * 2.0;
  }

  const proteinCalories = proteinGrams * 4;
  const fatCalories = targetCalories * 0.25;
  const carbCalories = targetCalories - proteinCalories - fatCalories;
  const sugarsGrams = Math.round(carbCalories * 0.2 / 4);

  return {
    protein: Math.round(proteinGrams),
    carbs: Math.round(carbCalories / 4),
    fats: Math.round(fatCalories / 9),
    sugars: sugarsGrams,
  };
}

export function calculateBMI(weight: number, height: number): number {
  return weight / ((height / 100) * (height / 100));
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function calculateProjectedWeight(
  currentWeight: number,
  goal: Goal,
  weeks: number
): number {
  const weeklyChange = goal === "lose" ? -0.5 : goal === "gain" ? 0.25 : 0;
  return currentWeight + weeklyChange * weeks;
}
