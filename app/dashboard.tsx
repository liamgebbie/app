import { useRouter } from "expo-router";
import { User, Sparkles, Camera } from "lucide-react-native";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { useUser } from "@/contexts/UserContext";
import { UserProfile } from "@/types/user";

export default function Dashboard() {
  const router = useRouter();
  const { profile, getTodayTotals } = useUser();

  if (!profile) {
    return null;
  }

  const totals = getTodayTotals();
  const remaining = profile.targetCalories - totals.calories;

  const caloriesPercent = Math.min((totals.calories / profile.targetCalories) * 100, 100);
  
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * caloriesPercent) / 100;

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
          <View style={styles.circleContainer}>
            <Svg width={200} height={200} style={styles.svg}>
              <Circle
                cx={100}
                cy={100}
                r={radius}
                stroke="#2c2c2e"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={100}
                cy={100}
                r={radius}
                stroke="#fff"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 100 100)`}
              />
            </Svg>
            <View style={styles.calorieTextContainer}>
              <Text style={styles.caloriesValue}>{totals.calories}</Text>
              <Text style={styles.caloriesTarget}>of {profile.targetCalories}</Text>
            </View>
          </View>
          <Text style={styles.remainingText}>{remaining > 0 ? remaining : 0} remaining</Text>
        </View>

        <View style={styles.macrosSection}>
          {profile.trackedMacros.map((macro) => {
            const macroValue = (totals as Record<string, number>)[macro] || 0;
            const targetKey = `target${macro.charAt(0).toUpperCase() + macro.slice(1)}` as keyof UserProfile;
            const targetValue = (profile[targetKey] as number | undefined) || 0;
            return (
              <View key={macro} style={styles.macroRow}>
                <Text style={styles.macroLabel}>{macro.charAt(0).toUpperCase() + macro.slice(1)}</Text>
                <Text style={styles.macroValue}>{Math.round(macroValue)}g / {Math.round(targetValue)}g</Text>
              </View>
            );
          })}
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
    marginBottom: 48,
  },
  circleContainer: {
    position: "relative" as const,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  svg: {
    transform: [{ rotate: "0deg" }],
  },
  calorieTextContainer: {
    position: "absolute" as const,
    alignItems: "center",
    justifyContent: "center",
  },
  caloriesValue: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: "#fff",
    lineHeight: 56,
  },
  caloriesTarget: {
    fontSize: 14,
    color: "#8e8e93",
  },
  remainingText: {
    fontSize: 14,
    color: "#8e8e93",
  },
  macrosSection: {
    gap: 12,
  },
  macroRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  macroLabel: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500" as const,
  },
  macroValue: {
    fontSize: 14,
    color: "#8e8e93",
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
