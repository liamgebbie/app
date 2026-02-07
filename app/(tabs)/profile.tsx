import { useRouter } from "expo-router";
import { ChevronRight, LogOut, Settings, TrendingUp, Target, Award } from "lucide-react-native";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/contexts/UserContext";

export default function Profile() {
  const router = useRouter();
  const { profile, logout, weightLogs } = useUser();

  if (!profile) {
    return null;
  }

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/");
          },
        },
      ]
    );
  };

  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : profile.weight;
  const displayWeight = profile.units === "imperial" ? `${currentWeight.toFixed(1)} lbs` : `${currentWeight.toFixed(1)} kg`;
  const displayHeight = profile.units === "imperial" ? `${profile.height} in` : `${profile.height} cm`;

  const goalLabels: Record<string, string> = {
    lose: "Lose Fat",
    maintain: "Maintain Weight",
    gain: "Build Muscle",
  };

  const activityLabels: Record<string, string> = {
    sedentary: "Sedentary",
    light: "Light",
    moderate: "Moderate",
    active: "Active",
    very_active: "Very Active",
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account and settings</Text>
        </View>

        {profile.isPremium && (
          <View style={styles.premiumBanner}>
            <Award color="#000" size={24} />
            <View style={styles.premiumTextContainer}>
              <Text style={styles.premiumTitle}>Premium Member</Text>
              <Text style={styles.premiumSubtitle}>You have full access to all features</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Age</Text>
              <Text style={styles.statValue}>{profile.age} years</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Height</Text>
              <Text style={styles.statValue}>{displayHeight}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Current Weight</Text>
              <Text style={styles.statValue}>{displayWeight}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Gender</Text>
              <Text style={styles.statValue}>{profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goals & Activity</Text>
          
          <View style={styles.goalsCard}>
            <View style={styles.goalItem}>
              <View style={styles.goalIconContainer}>
                <Target color="#fff" size={20} />
              </View>
              <View style={styles.goalTextContainer}>
                <Text style={styles.goalLabel}>Goal</Text>
                <Text style={styles.goalValue}>{goalLabels[profile.goal]}</Text>
              </View>
            </View>
            
            <View style={styles.goalDivider} />
            
            <View style={styles.goalItem}>
              <View style={styles.goalIconContainer}>
                <TrendingUp color="#fff" size={20} />
              </View>
              <View style={styles.goalTextContainer}>
                <Text style={styles.goalLabel}>Activity Level</Text>
                <Text style={styles.goalValue}>{activityLabels[profile.activityLevel]}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Targets</Text>
          
          <View style={styles.targetsCard}>
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>Daily Calories</Text>
              <Text style={styles.targetValue}>{profile.targetCalories} kcal</Text>
            </View>
            {profile.trackedMacros.includes("protein") && (
              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Protein</Text>
                <Text style={styles.targetValue}>{Math.round(profile.targetProtein)}g</Text>
              </View>
            )}
            {profile.trackedMacros.includes("carbs") && (
              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Carbs</Text>
                <Text style={styles.targetValue}>{Math.round(profile.targetCarbs)}g</Text>
              </View>
            )}
            {profile.trackedMacros.includes("fats") && (
              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Fats</Text>
                <Text style={styles.targetValue}>{Math.round(profile.targetFats)}g</Text>
              </View>
            )}
          </View>
        </View>

        {profile.allergies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Allergies</Text>
            <View style={styles.allergiesCard}>
              <View style={styles.allergyTags}>
                {profile.allergies.map((allergy, index) => (
                  <View key={index} style={styles.allergyTag}>
                    <Text style={styles.allergyTagText}>{allergy}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/progress")}>
            <View style={styles.actionIconContainer}>
              <TrendingUp color="#fff" size={20} />
            </View>
            <Text style={styles.actionText}>View Progress</Text>
            <ChevronRight color="#666" size={20} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/insights")}>
            <View style={styles.actionIconContainer}>
              <Settings color="#fff" size={20} />
            </View>
            <Text style={styles.actionText}>Insights</Text>
            <ChevronRight color="#666" size={20} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
            <View style={styles.actionIconContainer}>
              <LogOut color="#fff" size={20} />
            </View>
            <Text style={styles.actionText}>Log Out</Text>
            <ChevronRight color="#666" size={20} />
          </TouchableOpacity>
        </View>
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
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#fff",
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: "#666",
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
  statsCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  statDivider: {
    height: 1,
    backgroundColor: "#2a2a2a",
  },
  statLabel: {
    fontSize: 15,
    color: "#999",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  goalsCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 8,
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  goalTextContainer: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 13,
    color: "#999",
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  goalDivider: {
    height: 1,
    backgroundColor: "#2a2a2a",
    marginVertical: 12,
  },
  targetsCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  targetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  targetLabel: {
    fontSize: 15,
    color: "#999",
  },
  targetValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  allergiesCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  allergyTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  allergyTag: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  allergyTagText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  logoutButton: {
    borderColor: "#3a1a1a",
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
