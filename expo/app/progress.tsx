import { useRouter } from "expo-router";
import { ArrowLeft, LogOut } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/contexts/UserContext";
import { calculateBMI, getBMICategory, calculateProjectedWeight } from "@/utils/calculations";

export default function Progress() {
  const router = useRouter();
  const { profile, weightLogs, addWeightLog, foodLogs, logout } = useUser();
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [weightInput, setWeightInput] = useState("");

  if (!profile) {
    return null;
  }

  const handleAddWeight = async () => {
    const weight = parseFloat(weightInput);
    if (!weight || isNaN(weight)) return;

    await addWeightLog(weight);
    setWeightInput("");
    setShowAddWeight(false);
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out? All your data will be cleared.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/onboarding");
          },
        },
      ]
    );
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  const dailyCalories = last7Days.map((date) => {
    const logsForDay = foodLogs.filter((log) => {
      const logDate = new Date(log.timestamp).toISOString().split("T")[0];
      return logDate === date;
    });
    return logsForDay.reduce((sum, log) => sum + log.calories, 0);
  });

  const maxCalories = Math.max(...dailyCalories, profile.targetCalories);
  const avgCalories = Math.round(
    dailyCalories.reduce((sum, cal) => sum + cal, 0) / 7
  );

  const recentWeights = weightLogs.slice(-7);
  const weightChange = recentWeights.length >= 2
    ? recentWeights[recentWeights.length - 1].weight - recentWeights[0].weight
    : 0;

  const currentWeight = recentWeights.length > 0
    ? recentWeights[recentWeights.length - 1].weight
    : profile.weight;

  const weightInKg = profile.units === "imperial" ? currentWeight * 0.453592 : currentWeight;
  const heightInCm = profile.units === "imperial" ? profile.height * 2.54 : profile.height;
  const bmi = calculateBMI(weightInKg, heightInCm);
  const bmiCategory = getBMICategory(bmi);

  const projectedWeight4Weeks = calculateProjectedWeight(weightInKg, profile.goal, 4);
  const projectedWeight12Weeks = calculateProjectedWeight(weightInKg, profile.goal, 12);

  const displayWeight = (w: number) => {
    const weight = profile.units === "imperial" ? w / 0.453592 : w;
    const unit = profile.units === "imperial" ? "lbs" : "kg";
    return `${weight.toFixed(1)}${unit}`;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Progress</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Weight Trend</Text>
              <TouchableOpacity
                onPress={() => setShowAddWeight(!showAddWeight)}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>
                  {showAddWeight ? "Cancel" : "+ Log Weight"}
                </Text>
              </TouchableOpacity>
            </View>

            {showAddWeight && (
              <View style={styles.addWeightCard}>
                <TextInput
                  style={styles.weightInput}
                  value={weightInput}
                  onChangeText={setWeightInput}
                  placeholder="Enter weight (kg)"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    !weightInput && styles.saveButtonDisabled,
                  ]}
                  onPress={handleAddWeight}
                  disabled={!weightInput}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.weightCard}>
              <View style={styles.weightStat}>
                <Text style={styles.weightStatLabel}>Current</Text>
                <Text style={styles.weightStatValue}>
                  {recentWeights.length > 0
                    ? recentWeights[recentWeights.length - 1].weight
                    : profile.weight}
                  kg
                </Text>
              </View>
              <View style={styles.weightStat}>
                <Text style={styles.weightStatLabel}>Change (7d)</Text>
                <Text
                  style={[
                    styles.weightStatValue,
                    weightChange > 0 && styles.weightUp,
                    weightChange < 0 && styles.weightDown,
                  ]}
                >
                  {weightChange > 0 ? "+" : ""}
                  {weightChange.toFixed(1)}kg
                </Text>
              </View>
              <View style={styles.weightStat}>
                <Text style={styles.weightStatLabel}>Goal</Text>
                <Text style={styles.weightStatValue}>
                  {profile.goal === "lose"
                    ? "Lose"
                    : profile.goal === "gain"
                    ? "Gain"
                    : "Maintain"}
                </Text>
              </View>
            </View>

            {recentWeights.length > 1 && (
              <View style={styles.chart}>
                <View style={styles.chartArea}>
                  {recentWeights.map((log, index) => {
                    const minWeight = Math.min(...recentWeights.map((w) => w.weight));
                    const maxWeight = Math.max(...recentWeights.map((w) => w.weight));
                    const range = maxWeight - minWeight || 1;
                    const heightPercent =
                      ((log.weight - minWeight) / range) * 80 + 10;

                    return (
                      <View
                        key={log.date}
                        style={[
                          styles.chartBar,
                          { height: `${heightPercent}%` },
                        ]}
                      >
                        <View style={styles.chartDot} />
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Calorie Consistency</Text>

            <View style={styles.consistencyCard}>
              <View style={styles.consistencyStat}>
                <Text style={styles.consistencyLabel}>7-Day Average</Text>
                <Text style={styles.consistencyValue}>{avgCalories} cal</Text>
              </View>
              <View style={styles.consistencyStat}>
                <Text style={styles.consistencyLabel}>Target</Text>
                <Text style={styles.consistencyValue}>
                  {profile.targetCalories} cal
                </Text>
              </View>
            </View>

            <View style={styles.chart}>
              <View style={styles.chartBars}>
                {dailyCalories.map((calories, index) => {
                  const heightPercent = (calories / maxCalories) * 100;
                  const isToday = index === 6;

                  return (
                    <View key={last7Days[index]} style={styles.barContainer}>
                      <View style={styles.barWrapper}>
                        <View
                          style={[
                            styles.bar,
                            isToday && styles.barToday,
                            { height: `${heightPercent}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.barLabel}>
                        {new Date(last7Days[index]).toLocaleDateString("en-US", {
                          weekday: "short",
                        })[0]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Metrics</Text>

            <View style={styles.metricsCard}>
              <View style={styles.metricRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>BMI</Text>
                  <Text style={styles.metricValue}>{bmi.toFixed(1)}</Text>
                  <Text style={styles.metricCategory}>{bmiCategory}</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>TDEE</Text>
                  <Text style={styles.metricValue}>{profile.tdee}</Text>
                  <Text style={styles.metricCategory}>cal/day</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projected Progress</Text>
            <Text style={styles.sectionSubtitle}>
              {profile.goal === "lose" ? "If you maintain a consistent calorie deficit" : profile.goal === "gain" ? "If you maintain a consistent calorie surplus" : "If you maintain your current intake"}
            </Text>

            <View style={styles.projectionCard}>
              <View style={styles.projectionRow}>
                <View style={styles.projectionItem}>
                  <Text style={styles.projectionLabel}>Current</Text>
                  <Text style={styles.projectionValue}>{displayWeight(weightInKg)}</Text>
                </View>
                <View style={styles.projectionArrow}>
                  <Text style={styles.projectionArrowText}>→</Text>
                </View>
                <View style={styles.projectionItem}>
                  <Text style={styles.projectionLabel}>4 weeks</Text>
                  <Text style={styles.projectionValue}>{displayWeight(projectedWeight4Weeks)}</Text>
                  <Text style={[styles.projectionChange, projectedWeight4Weeks < weightInKg && styles.projectionDown]}>
                    {projectedWeight4Weeks > weightInKg ? "+" : ""}{(projectedWeight4Weeks - weightInKg).toFixed(1)}kg
                  </Text>
                </View>
                <View style={styles.projectionArrow}>
                  <Text style={styles.projectionArrowText}>→</Text>
                </View>
                <View style={styles.projectionItem}>
                  <Text style={styles.projectionLabel}>12 weeks</Text>
                  <Text style={styles.projectionValue}>{displayWeight(projectedWeight12Weeks)}</Text>
                  <Text style={[styles.projectionChange, projectedWeight12Weeks < weightInKg && styles.projectionDown]}>
                    {projectedWeight12Weeks > weightInKg ? "+" : ""}{(projectedWeight12Weeks - weightInKg).toFixed(1)}kg
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.projectionNote}>
              💡 Stay consistent with your tracking to achieve better results!
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <LogOut color="#ff3b30" size={20} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
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
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  addWeightCard: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  weightInput: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
  },
  saveButton: {
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  weightCard: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  weightStat: {
    flex: 1,
    alignItems: "center",
  },
  weightStatLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  weightStatValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  weightUp: {
    color: "#34d399",
  },
  weightDown: {
    color: "#60a5fa",
  },
  chart: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    minHeight: 180,
  },
  chartArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingTop: 20,
  },
  chartBar: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  chartDot: {
    width: 8,
    height: 8,
    backgroundColor: "#60a5fa",
    borderRadius: 4,
  },
  consistencyCard: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    gap: 24,
  },
  consistencyStat: {
    flex: 1,
  },
  consistencyLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  consistencyValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    height: 140,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    backgroundColor: "#333",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  barToday: {
    backgroundColor: "#60a5fa",
  },
  barLabel: {
    fontSize: 12,
    color: "#666",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff3b30",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 16,
    lineHeight: 20,
  },
  metricsCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metric: {
    flex: 1,
    alignItems: "center",
  },
  metricDivider: {
    width: 1,
    height: 60,
    backgroundColor: "#333",
  },
  metricLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  metricCategory: {
    fontSize: 12,
    color: "#60a5fa",
    fontWeight: "600",
  },
  projectionCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  projectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  projectionItem: {
    alignItems: "center",
    flex: 1,
  },
  projectionLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  projectionValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  projectionChange: {
    fontSize: 12,
    color: "#34d399",
    fontWeight: "600",
  },
  projectionDown: {
    color: "#60a5fa",
  },
  projectionArrow: {
    marginHorizontal: 4,
  },
  projectionArrowText: {
    fontSize: 16,
    color: "#666",
  },
  projectionNote: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 20,
  },
});
