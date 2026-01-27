import { useRouter } from "expo-router";
import { User, Sparkles, Camera } from "lucide-react-native";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/contexts/UserContext";

export default function Dashboard() {
  const router = useRouter();
  const { profile, getTodayTotals } = useUser();

  if (!profile) {
    return null;
  }

  const totals = getTodayTotals();
  const remaining = profile.targetCalories - totals.calories;

  const proteinPercent = (totals.protein / profile.targetProtein) * 100;
  const carbsPercent = (totals.carbs / profile.targetCarbs) * 100;
  const fatsPercent = (totals.fats / profile.targetFats) * 100;
  const sugarsPercent = (totals.sugars / profile.targetSugars) * 100;

  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Today</Text>
          <Text style={styles.date}>{dateString}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/progress")}>
          <User color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.calorieSection}>
          <Text style={styles.caloriesLabel}>Calories</Text>
          <Text style={styles.caloriesValue}>{totals.calories}</Text>
          <Text style={styles.caloriesTarget}>of {profile.targetCalories}</Text>
          <View style={styles.calorieProgress}>
            <View
              style={[
                styles.calorieProgressBar,
                { width: `${Math.min((totals.calories / profile.targetCalories) * 100, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.remainingText}>{remaining > 0 ? remaining : 0} remaining</Text>
        </View>

        <View style={styles.macrosSection}>
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>{totals.protein}/{profile.targetProtein}</Text>
          </View>
          <View style={styles.macroBar}>
            <View
              style={[
                styles.macroBarFill,
                styles.macroBarProtein,
                { width: `${Math.min(proteinPercent, 100)}%` },
              ]}
            />
          </View>

          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>Fats</Text>
            <Text style={styles.macroValue}>{totals.fats}/{profile.targetFats}</Text>
          </View>
          <View style={styles.macroBar}>
            <View
              style={[
                styles.macroBarFill,
                styles.macroBarFats,
                { width: `${Math.min(fatsPercent, 100)}%` },
              ]}
            />
          </View>

          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>{totals.carbs}/{profile.targetCarbs}</Text>
          </View>
          <View style={styles.macroBar}>
            <View
              style={[
                styles.macroBarFill,
                styles.macroBarCarbs,
                { width: `${Math.min(carbsPercent, 100)}%` },
              ]}
            />
          </View>

          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>Sugars</Text>
            <Text style={styles.macroValue}>{totals.sugars}/{profile.targetSugars}</Text>
          </View>
          <View style={styles.macroBar}>
            <View
              style={[
                styles.macroBarFill,
                styles.macroBarSugars,
                { width: `${Math.min(sugarsPercent, 100)}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.tellAiButton} onPress={() => router.push("/log-food")}>
          <Sparkles color="#fff" size={20} />
          <Text style={styles.tellAiText}>Tell AI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.showAiButton} onPress={() => router.push("/show-ai")}>
          <Camera color="#fff" size={20} />
          <Text style={styles.showAiText}>Show AI</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1e",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#8e8e93",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2c2c2e",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  calorieSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  caloriesLabel: {
    fontSize: 16,
    color: "#8e8e93",
    marginBottom: 8,
  },
  caloriesValue: {
    fontSize: 80,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 88,
  },
  caloriesTarget: {
    fontSize: 16,
    color: "#8e8e93",
    marginBottom: 20,
  },
  calorieProgress: {
    width: "100%",
    height: 4,
    backgroundColor: "#2c2c2e",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 12,
  },
  calorieProgressBar: {
    height: "100%",
    backgroundColor: "#fff",
  },
  remainingText: {
    fontSize: 14,
    color: "#8e8e93",
  },
  macrosSection: {
    gap: 16,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 16,
    color: "#fff",
  },
  macroValue: {
    fontSize: 16,
    color: "#8e8e93",
  },
  macroBar: {
    height: 6,
    backgroundColor: "#2c2c2e",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  macroBarFill: {
    height: "100%",
  },
  macroBarProtein: {
    backgroundColor: "#4cd964",
  },
  macroBarFats: {
    backgroundColor: "#ff9500",
  },
  macroBarCarbs: {
    backgroundColor: "#ff9500",
  },
  macroBarSugars: {
    backgroundColor: "#ff9500",
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  tellAiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#000",
    paddingVertical: 18,
    borderRadius: 12,
  },
  tellAiText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  showAiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2c2c2e",
    paddingVertical: 18,
    borderRadius: 12,
  },
  showAiText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
