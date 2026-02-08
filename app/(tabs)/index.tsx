import { useRouter } from "expo-router";
import { User, Sparkles, Camera, ChevronLeft, ChevronRight, Trash2 } from "lucide-react-native";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { useUser } from "@/contexts/UserContext";
import { UserProfile } from "@/types/user";
import { useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const { profile, getTodayTotals, foodLogs, deleteFoodLog } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (!profile) {
    return null;
  }

  const getLogsForDate = (date: Date) => {
    const startOfDay = new Date(date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(date).setHours(23, 59, 59, 999);
    return foodLogs.filter((log) => {
      return log.timestamp >= startOfDay && log.timestamp <= endOfDay;
    });
  };

  const getTotalsForDate = (date: Date) => {
    const logs = getLogsForDate(date);
    return logs.reduce(
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

  const getDatesForWeek = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    return dates;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate <= today) {
      setSelectedDate(newDate);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const canNavigateNext = () => {
    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(selectedDate.getDate() + 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tomorrow <= today;
  };

  const totals = getTotalsForDate(selectedDate);
  const remaining = profile.targetCalories - totals.calories;
  const dailyLogs = getLogsForDate(selectedDate);

  const caloriesPercent = Math.min((totals.calories / profile.targetCalories) * 100, 100);
  
  const radius = 65;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * caloriesPercent) / 100;

  const dateString = selectedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleDeleteLog = (id: string, description: string) => {
    Alert.alert(
      "Delete Food Log",
      `Are you sure you want to delete "${description}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteFoodLog(id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{isToday(selectedDate) ? "Today" : dateString}</Text>
          <View style={styles.dateNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateDate('prev')}
            >
              <ChevronLeft color="#fff" size={20} />
            </TouchableOpacity>
            <Text style={styles.date}>{dateString}</Text>
            <TouchableOpacity
              style={[styles.navButton, !canNavigateNext() && styles.navButtonDisabled]}
              onPress={() => navigateDate('next')}
              disabled={!canNavigateNext()}
            >
              <ChevronRight color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/progress")}>
          <User color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
        <View style={styles.calorieSection}>
          <View style={styles.circleContainer}>
            <Svg width={160} height={160} style={styles.svg}>
              <Circle
                cx={80}
                cy={80}
                r={radius}
                stroke="#2c2c2e"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={80}
                cy={80}
                r={radius}
                stroke="#fff"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 80 80)`}
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

        {dailyLogs.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Today's Food Log</Text>
            {dailyLogs.map((log) => (
              <View key={log.id} style={styles.historyItem}>
                <View style={styles.historyItemContent}>
                  <Text style={styles.historyItemName}>{log.description}</Text>
                  <Text style={styles.historyItemDetails}>
                    {log.calories} cal • {Math.round(log.protein)}g protein
                  </Text>
                  <Text style={styles.historyItemTime}>
                    {new Date(log.timestamp).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteLog(log.id, log.description)}
                >
                  <Trash2 color="#999" size={18} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1e",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerLeft: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    paddingBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 8,
  },
  dateNavigation: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2c2c2e",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  navButtonDisabled: {
    opacity: 0.3,
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

  calorieSection: {
    alignItems: "center",
    marginVertical: 8,
  },
  circleContainer: {
    position: "relative" as const,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
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
    fontSize: 40,
    fontWeight: "700" as const,
    color: "#fff",
    lineHeight: 48,
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
    gap: 6,
    marginVertical: 8,
  },
  macroRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 12,
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
    gap: 10,
    marginTop: 8,
  },
  tellAiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#000",
    paddingVertical: 14,
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
    paddingVertical: 14,
    borderRadius: 12,
  },
  showAiText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  historySection: {
    marginTop: 24,
    gap: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 4,
  },
  historyItem: {
    flexDirection: "row" as const,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
    gap: 12,
  },
  historyItemContent: {
    flex: 1,
    gap: 4,
  },
  historyItemName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#fff",
  },
  historyItemDetails: {
    fontSize: 13,
    color: "#999",
  },
  historyItemTime: {
    fontSize: 12,
    color: "#666",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2c2c2e",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
});
