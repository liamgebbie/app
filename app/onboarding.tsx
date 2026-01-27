import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUser } from "@/contexts/UserContext";
import { ActivityLevel, Gender, Goal, TrackedMacro } from "@/types/user";

type Step = "welcome" | "stats" | "region" | "activity" | "goal" | "macros";

export default function Onboarding() {
  const router = useRouter();
  const { createProfile } = useUser();
  const [step, setStep] = useState<Step>("welcome");

  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [region, setRegion] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("lose");
  const [trackedMacros, setTrackedMacros] = useState<TrackedMacro[]>(["protein", "carbs", "fats"]);

  const handleComplete = async () => {
    await createProfile({
      age: parseInt(age),
      height: parseInt(height),
      weight: parseInt(weight),
      gender,
      region,
      activityLevel,
      goal,
      trackedMacros,
    });
    router.replace("/dashboard");
  };

  const toggleMacro = (macro: TrackedMacro) => {
    setTrackedMacros((prev) =>
      prev.includes(macro)
        ? prev.filter((m) => m !== macro)
        : [...prev, macro]
    );
  };

  if (step === "welcome") {
    return (
      <View style={styles.container}>
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeHeader}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>
              AI-powered calorie tracking
            </Text>
          </View>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Track calories and macros effortlessly</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Log food with natural language</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Get personalized AI insights</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Monitor your progress over time</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setStep("stats")}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <ArrowRight color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    );
  }

  if (step === "stats") {
    const isValid = age && height && weight;
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Your Stats</Text>
          <Text style={styles.subtitle}>We need some basic information</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="25"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder="180"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="75"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    gender === "male" && styles.optionButtonActive,
                  ]}
                  onPress={() => setGender("male")}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      gender === "male" && styles.optionButtonTextActive,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    gender === "female" && styles.optionButtonActive,
                  ]}
                  onPress={() => setGender("female")}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      gender === "female" && styles.optionButtonTextActive,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !isValid && styles.primaryButtonDisabled]}
          onPress={() => isValid && setStep("region")}
          disabled={!isValid}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
          <ArrowRight color="#fff" size={20} />
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (step === "region") {
    const regions = [
      { value: "North America", label: "North America" },
      { value: "South America", label: "South America" },
      { value: "Europe", label: "Europe" },
      { value: "Asia", label: "Asia" },
      { value: "Africa", label: "Africa" },
      { value: "Oceania", label: "Oceania" },
    ];

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Your Region</Text>
          <Text style={styles.subtitle}>This helps personalize your experience</Text>

          <View style={styles.form}>
            {regions.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[
                  styles.activityCard,
                  region === r.value && styles.activityCardActive,
                ]}
                onPress={() => setRegion(r.value)}
              >
                <Text
                  style={[
                    styles.activityLabel,
                    region === r.value && styles.activityLabelActive,
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !region && styles.primaryButtonDisabled]}
          onPress={() => region && setStep("activity")}
          disabled={!region}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
          <ArrowRight color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    );
  }

  if (step === "activity") {
    const activities: { value: ActivityLevel; label: string; desc: string }[] = [
      { value: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
      { value: "light", label: "Light", desc: "1-3 days per week" },
      { value: "moderate", label: "Moderate", desc: "3-5 days per week" },
      { value: "active", label: "Active", desc: "6-7 days per week" },
      { value: "very_active", label: "Very Active", desc: "Physical job or intense training" },
    ];

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Activity Level</Text>
          <Text style={styles.subtitle}>How often do you train?</Text>

          <View style={styles.form}>
            {activities.map((activity) => (
              <TouchableOpacity
                key={activity.value}
                style={[
                  styles.activityCard,
                  activityLevel === activity.value && styles.activityCardActive,
                ]}
                onPress={() => setActivityLevel(activity.value)}
              >
                <Text
                  style={[
                    styles.activityLabel,
                    activityLevel === activity.value && styles.activityLabelActive,
                  ]}
                >
                  {activity.label}
                </Text>
                <Text
                  style={[
                    styles.activityDesc,
                    activityLevel === activity.value && styles.activityDescActive,
                  ]}
                >
                  {activity.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setStep("goal")}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
          <ArrowRight color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    );
  }

  if (step === "goal") {
    const goals: { value: Goal; label: string; desc: string }[] = [
      { value: "lose", label: "Lose Fat", desc: "-500 cal deficit" },
      { value: "maintain", label: "Maintain", desc: "Maintenance calories" },
      { value: "gain", label: "Build Muscle", desc: "+300 cal surplus" },
    ];

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Your Goal</Text>
          <Text style={styles.subtitle}>What do you want to achieve?</Text>

          <View style={styles.form}>
            {goals.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[
                  styles.activityCard,
                  goal === g.value && styles.activityCardActive,
                ]}
                onPress={() => setGoal(g.value)}
              >
                <Text
                  style={[
                    styles.activityLabel,
                    goal === g.value && styles.activityLabelActive,
                  ]}
                >
                  {g.label}
                </Text>
                <Text
                  style={[
                    styles.activityDesc,
                    goal === g.value && styles.activityDescActive,
                  ]}
                >
                  {g.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => setStep("macros")}>
          <Text style={styles.primaryButtonText}>Continue</Text>
          <ArrowRight color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    );
  }

  if (step === "macros") {
    const macros: { value: TrackedMacro; label: string; desc: string }[] = [
      { value: "protein", label: "Protein", desc: "Essential for muscle growth" },
      { value: "carbs", label: "Carbs", desc: "Primary energy source" },
      { value: "fats", label: "Fats", desc: "Hormones and energy" },
      { value: "sugars", label: "Sugars", desc: "Track added sugar intake" },
      { value: "fiber", label: "Fiber", desc: "Digestive health" },
    ];

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Track Macros</Text>
          <Text style={styles.subtitle}>Selected macros will be tracked in your dashboard</Text>

          <View style={styles.form}>
            {macros.map((macro) => (
              <TouchableOpacity
                key={macro.value}
                style={[
                  styles.activityCard,
                  trackedMacros.includes(macro.value) && styles.activityCardActive,
                ]}
                onPress={() => toggleMacro(macro.value)}
              >
                <Text
                  style={[
                    styles.activityLabel,
                    trackedMacros.includes(macro.value) && styles.activityLabelActive,
                  ]}
                >
                  {macro.label}
                </Text>
                <Text
                  style={[
                    styles.activityDesc,
                    trackedMacros.includes(macro.value) && styles.activityDescActive,
                  ]}
                >
                  {macro.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, trackedMacros.length === 0 && styles.primaryButtonDisabled]}
          onPress={handleComplete}
          disabled={trackedMacros.length === 0}
        >
          <Text style={styles.primaryButtonText}>Complete Setup</Text>
          <ArrowRight color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  welcomeHeader: {
    marginBottom: 48,
    alignItems: "center",
  },
  featureList: {
    gap: 20,
    paddingHorizontal: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  featureText: {
    fontSize: 16,
    color: "#ccc",
    flex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    marginBottom: 40,
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  optionButtonActive: {
    backgroundColor: "#fff",
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
  },
  optionButtonTextActive: {
    color: "#000",
  },
  activityCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
  },
  activityCardActive: {
    backgroundColor: "#fff",
  },
  activityLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  activityLabelActive: {
    color: "#000",
  },
  activityDesc: {
    fontSize: 14,
    color: "#999",
  },
  activityDescActive: {
    color: "#666",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    margin: 24,
    padding: 18,
    borderRadius: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
});
