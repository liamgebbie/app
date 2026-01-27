import { useRouter } from "expo-router";
import { ArrowLeft, Sparkles } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateText } from "@rork-ai/toolkit-sdk";
import { useUser } from "@/contexts/UserContext";

export default function Insights() {
  const router = useRouter();
  const { profile, getTodayTotals, getWeekLogs } = useUser();
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateInsight = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const todayTotals = getTodayTotals();
      const weekLogs = getWeekLogs();

      const weeklyCalories = weekLogs.reduce((sum, log) => sum + log.calories, 0);
      const weeklyProtein = weekLogs.reduce((sum, log) => sum + log.protein, 0);
      const averageDailyCalories = weekLogs.length > 0 ? Math.round(weeklyCalories / 7) : 0;
      const averageDailyProtein = weekLogs.length > 0 ? Math.round(weeklyProtein / 7) : 0;

      const proteinShortfall = profile.targetProtein - todayTotals.protein;
      const caloriesRemaining = profile.targetCalories - todayTotals.calories;

      const contextData = {
        goal: profile.goal,
        targetCalories: profile.targetCalories,
        targetProtein: profile.targetProtein,
        todayCalories: todayTotals.calories,
        todayProtein: todayTotals.protein,
        todayCarbs: todayTotals.carbs,
        todayFats: todayTotals.fats,
        caloriesRemaining,
        proteinShortfall,
        weeklyAverageCalories: averageDailyCalories,
        weeklyAverageProtein: averageDailyProtein,
        daysLogged: Math.min(7, new Set(weekLogs.map(log => new Date(log.timestamp).toDateString())).size),
      };

      const prompt = `You are an AI fitness coach analyzing a user's nutrition data. Be direct, actionable, and reference their actual numbers.

User's goal: ${contextData.goal === "lose" ? "fat loss" : contextData.goal === "gain" ? "muscle gain" : "maintenance"}

TODAY'S DATA:
- Target: ${contextData.targetCalories} cal | ${contextData.targetProtein}g protein
- Eaten: ${contextData.todayCalories} cal | ${contextData.todayProtein}g protein
- Remaining: ${contextData.caloriesRemaining} cal | Protein shortfall: ${contextData.proteinShortfall}g

WEEKLY AVERAGE (Last 7 days):
- Daily calories: ${contextData.weeklyAverageCalories} cal
- Daily protein: ${contextData.weeklyAverageProtein}g
- Days logged: ${contextData.daysLogged}/7

RULES:
1. Keep response under 150 words
2. Reference their actual numbers
3. Give 1-2 specific, actionable recommendations
4. No generic advice
5. If protein is low, suggest specific high-protein foods
6. If calories are off track, explain the impact on their goal

Generate a personalized insight:`;

      const result = await generateText(prompt);
      console.log("AI insight generated:", result);
      setInsight(result);
    } catch (error) {
      console.error("Error generating insight:", error);
      setInsight("Unable to generate insights at this time. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return null;
  }

  const todayTotals = getTodayTotals();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Insights</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Sparkles color="#fbbf24" size={24} />
              <Text style={styles.insightTitle}>Your Daily Insight</Text>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="large" />
                <Text style={styles.loadingText}>Analyzing your data...</Text>
              </View>
            ) : (
              <Text style={styles.insightText}>{insight}</Text>
            )}
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Today&apos;s Calories</Text>
              <Text style={styles.statValue}>{todayTotals.calories}</Text>
              <Text style={styles.statTarget}>Target: {profile.targetCalories}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Today&apos;s Protein</Text>
              <Text style={styles.statValue}>{todayTotals.protein}g</Text>
              <Text style={styles.statTarget}>Target: {profile.targetProtein}g</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Carbs</Text>
              <Text style={styles.statValue}>{todayTotals.carbs}g</Text>
              <Text style={styles.statTarget}>Target: {profile.targetCarbs}g</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Fats</Text>
              <Text style={styles.statValue}>{todayTotals.fats}g</Text>
              <Text style={styles.statTarget}>Target: {profile.targetFats}g</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={generateInsight}
            disabled={isLoading}
          >
            <Text style={styles.refreshButtonText}>Refresh Insight</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  insightCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#e5e5e5",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  statTarget: {
    fontSize: 12,
    color: "#666",
  },
  refreshButton: {
    backgroundColor: "#1a1a1a",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
