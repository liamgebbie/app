import { Flame, TrendingUp, Calendar } from "lucide-react-native";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/contexts/UserContext";

export default function Activity() {
  const { profile, foodLogs, weightLogs } = useUser();

  if (!profile) {
    return null;
  }

  const getWeightProgress = () => {
    if (weightLogs.length < 2) {
      return { progress: 0, change: 0, remaining: 0 };
    }

    const firstWeight = weightLogs[0].weight;
    const latestWeight = weightLogs[weightLogs.length - 1].weight;
    const weightChange = latestWeight - firstWeight;

    const targetChange = profile.goal === "lose" ? -5 : profile.goal === "gain" ? 5 : 0;
    
    if (targetChange === 0) {
      return { progress: 100, change: 0, remaining: 0 };
    }

    const progress = Math.min(Math.abs(weightChange / targetChange) * 100, 100);
    const remaining = targetChange - weightChange;

    return { progress, change: weightChange, remaining };
  };

  const weightProgress = getWeightProgress();

  const getDailyStats = () => {
    const now = Date.now();
    const daysAgo = 7;
    const startTime = now - daysAgo * 24 * 60 * 60 * 1000;

    const dailyData: Record<string, { calories: number; protein: number; carbs: number; fats: number }> = {};

    foodLogs.forEach((log) => {
      if (log.timestamp >= startTime) {
        const date = new Date(log.timestamp).toISOString().split("T")[0];
        if (!dailyData[date]) {
          dailyData[date] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
        }
        dailyData[date].calories += log.calories;
        dailyData[date].protein += log.protein;
        dailyData[date].carbs += log.carbs;
        dailyData[date].fats += log.fats;
      }
    });

    return dailyData;
  };

  const getWeeklyAverage = () => {
    const dailyData = getDailyStats();
    const days = Object.keys(dailyData);
    
    if (days.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    }

    const totals = days.reduce(
      (acc, day) => ({
        calories: acc.calories + dailyData[day].calories,
        protein: acc.protein + dailyData[day].protein,
        carbs: acc.carbs + dailyData[day].carbs,
        fats: acc.fats + dailyData[day].fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    return {
      calories: Math.round(totals.calories / days.length),
      protein: Math.round(totals.protein / days.length),
      carbs: Math.round(totals.carbs / days.length),
      fats: Math.round(totals.fats / days.length),
    };
  };

  const getStreak = () => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      const hasLogs = foodLogs.some((log) => {
        const logDate = new Date(log.timestamp);
        logDate.setHours(0, 0, 0, 0);
        return logDate.toISOString().split("T")[0] === dateStr;
      });

      if (hasLogs) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  };

  const dailyStats = getDailyStats();
  const averages = getWeeklyAverage();
  const streak = getStreak();
  const totalDaysLogged = Object.keys(dailyStats).length;

  const chartData = Object.entries(dailyStats)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7);

  const maxCalories = Math.max(...chartData.map(([, data]) => data.calories), profile.targetCalories);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Activity</Text>
          <Text style={styles.subtitle}>Track your progress over time</Text>
        </View>

        {profile.goal !== "maintain" && (
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Goal Progress</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  {profile.goal === "lose" ? "Weight Lost" : "Weight Gained"}
                </Text>
                <Text style={styles.progressValue}>
                  {Math.abs(weightProgress.change).toFixed(1)} kg of {profile.goal === "lose" ? 5 : 5} kg
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${weightProgress.progress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressPercentage}>{Math.round(weightProgress.progress)}%</Text>
              </View>
              <Text style={styles.progressRemaining}>
                {Math.abs(weightProgress.remaining).toFixed(1)} kg to go
              </Text>
            </View>
          </View>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Flame color="#fff" size={24} />
            </View>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Calendar color="#fff" size={24} />
            </View>
            <Text style={styles.statValue}>{totalDaysLogged}</Text>
            <Text style={styles.statLabel}>Days Logged</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp color="#fff" size={24} />
            </View>
            <Text style={styles.statValue}>{averages.calories}</Text>
            <Text style={styles.statLabel}>Avg Calories</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7-Day Overview</Text>
          
          <View style={styles.chartContainer}>
            <View style={styles.chart}>
              {chartData.map(([date, data], index) => {
                const height = (data.calories / maxCalories) * 140;
                const isOverTarget = data.calories > profile.targetCalories;
                const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "short" });

                return (
                  <View key={date} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(height, 4),
                            backgroundColor: isOverTarget ? "#666" : "#fff",
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{dayOfWeek}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#fff" }]} />
                <Text style={styles.legendText}>Within target</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#666" }]} />
                <Text style={styles.legendText}>Over target</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Average Macros</Text>
          
          <View style={styles.macrosList}>
            <View style={styles.macroCard}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>{averages.protein}g</Text>
              </View>
              <View style={styles.macroBar}>
                <View
                  style={[
                    styles.macroBarFill,
                    {
                      width: `${Math.min((averages.protein / profile.targetProtein) * 100, 100)}%`,
                      backgroundColor: "#fff",
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.macroCard}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroValue}>{averages.carbs}g</Text>
              </View>
              <View style={styles.macroBar}>
                <View
                  style={[
                    styles.macroBarFill,
                    {
                      width: `${Math.min((averages.carbs / profile.targetCarbs) * 100, 100)}%`,
                      backgroundColor: "#d1d1d6",
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.macroCard}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroLabel}>Fats</Text>
                <Text style={styles.macroValue}>{averages.fats}g</Text>
              </View>
              <View style={styles.macroBar}>
                <View
                  style={[
                    styles.macroBarFill,
                    {
                      width: `${Math.min((averages.fats / profile.targetFats) * 100, 100)}%`,
                      backgroundColor: "#999",
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {totalDaysLogged === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No data yet</Text>
            <Text style={styles.emptyStateText}>
              Start logging your meals to see your activity and progress over time
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#999",
  },
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  progressBarTrack: {
    flex: 1,
    height: 12,
    backgroundColor: "#0a0a0a",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    minWidth: 45,
    textAlign: "right",
  },
  progressRemaining: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
    marginBottom: 16,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  bar: {
    width: 24,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#999",
  },
  macrosList: {
    gap: 12,
  },
  macroCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  macroLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  macroValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
  },
  macroBar: {
    height: 6,
    backgroundColor: "#0a0a0a",
    borderRadius: 3,
    overflow: "hidden",
  },
  macroBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  emptyState: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },
});
