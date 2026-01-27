import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { FoodLog, UserProfile, WeightLog } from "@/types/user";
import {
  calculateBMR,
  calculateMacros,
  calculateTargetCalories,
  calculateTDEE,
} from "@/utils/calculations";

const USER_PROFILE_KEY = "user_profile";
const FOOD_LOGS_KEY = "food_logs";
const WEIGHT_LOGS_KEY = "weight_logs";

export const [UserProvider, useUser] = createContextHook(() => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, logsData, weightData] = await Promise.all([
        AsyncStorage.getItem(USER_PROFILE_KEY),
        AsyncStorage.getItem(FOOD_LOGS_KEY),
        AsyncStorage.getItem(WEIGHT_LOGS_KEY),
      ]);

      if (profileData) setProfile(JSON.parse(profileData));
      if (logsData) setFoodLogs(JSON.parse(logsData));
      if (weightData) setWeightLogs(JSON.parse(weightData));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProfile = async (data: Omit<UserProfile, "tdee" | "targetCalories" | "targetProtein" | "targetCarbs" | "targetFats" | "targetSugars">) => {
    const weightInKg = data.units === "imperial" ? data.weight * 0.453592 : data.weight;
    const heightInCm = data.units === "imperial" ? data.height * 2.54 : data.height;
    
    const bmr = calculateBMR(weightInKg, heightInCm, data.age, data.gender);
    const tdee = calculateTDEE(bmr, data.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, data.goal);
    const macros = calculateMacros(targetCalories, weightInKg, data.goal);

    const newProfile: UserProfile = {
      ...data,
      tdee,
      targetCalories,
      targetProtein: macros.protein,
      targetCarbs: macros.carbs,
      targetFats: macros.fats,
      targetSugars: macros.sugars,
    };

    setProfile(newProfile);
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(newProfile));

    const today = new Date().toISOString().split("T")[0];
    const initialWeight: WeightLog = { date: today, weight: data.weight };
    const newWeightLogs = [initialWeight];
    setWeightLogs(newWeightLogs);
    await AsyncStorage.setItem(WEIGHT_LOGS_KEY, JSON.stringify(newWeightLogs));
  };

  const addFoodLog = async (log: Omit<FoodLog, "id" | "timestamp">) => {
    const newLog: FoodLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    const updatedLogs = [newLog, ...foodLogs];
    setFoodLogs(updatedLogs);
    await AsyncStorage.setItem(FOOD_LOGS_KEY, JSON.stringify(updatedLogs));
  };

  const deleteFoodLog = async (id: string) => {
    const updatedLogs = foodLogs.filter((log) => log.id !== id);
    setFoodLogs(updatedLogs);
    await AsyncStorage.setItem(FOOD_LOGS_KEY, JSON.stringify(updatedLogs));
  };

  const addWeightLog = async (weight: number) => {
    const today = new Date().toISOString().split("T")[0];
    const existingIndex = weightLogs.findIndex((log) => log.date === today);

    let updatedLogs: WeightLog[];
    if (existingIndex >= 0) {
      updatedLogs = [...weightLogs];
      updatedLogs[existingIndex] = { date: today, weight };
    } else {
      updatedLogs = [...weightLogs, { date: today, weight }].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }

    setWeightLogs(updatedLogs);
    await AsyncStorage.setItem(WEIGHT_LOGS_KEY, JSON.stringify(updatedLogs));
  };

  const getTodayLogs = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    return foodLogs.filter((log) => {
      const logDate = new Date(log.timestamp).setHours(0, 0, 0, 0);
      return logDate === today;
    });
  };

  const getTodayTotals = () => {
    const todayLogs = getTodayLogs();
    return todayLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fats: acc.fats + log.fats,
        sugars: acc.sugars + log.sugars,
        fiber: (acc.fiber || 0) + (log.fiber || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, sugars: 0, fiber: 0 }
    );
  };

  const getWeekLogs = () => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return foodLogs.filter((log) => log.timestamp >= weekAgo);
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(USER_PROFILE_KEY),
        AsyncStorage.removeItem(FOOD_LOGS_KEY),
        AsyncStorage.removeItem(WEIGHT_LOGS_KEY),
      ]);
      setProfile(null);
      setFoodLogs([]);
      setWeightLogs([]);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return {
    profile,
    foodLogs,
    weightLogs,
    isLoading,
    createProfile,
    addFoodLog,
    deleteFoodLog,
    addWeightLog,
    getTodayLogs,
    getTodayTotals,
    getWeekLogs,
    logout,
  };
});
