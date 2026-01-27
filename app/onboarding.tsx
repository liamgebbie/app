import { useRouter } from "expo-router";
import { ArrowRight, X, Plus, ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUser } from "@/contexts/UserContext";
import { ActivityLevel, DietaryPreference, Gender, Goal, TrackedMacro, Units } from "@/types/user";

type Step = "welcome" | "stats" | "region" | "allergies" | "dietary" | "activity" | "goal" | "macros" | "premium" | "summary";

const TOTAL_STEPS = 9;
const STEP_MAP: Record<Step, number> = {
  welcome: 0,
  stats: 1,
  region: 2,
  allergies: 3,
  dietary: 4,
  activity: 5,
  goal: 6,
  macros: 7,
  premium: 8,
  summary: 9,
};

export default function Onboarding() {
  const router = useRouter();
  const { createProfile } = useUser();
  const [step, setStep] = useState<Step>("welcome");

  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [units, setUnits] = useState<Units>("metric");
  const [region, setRegion] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState("");
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>("none");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("lose");
  const [trackedMacros, setTrackedMacros] = useState<TrackedMacro[]>(["protein", "carbs", "fats"]);
  const [isPremium, setIsPremium] = useState(false);

  const handleComplete = async () => {
    await createProfile({
      age: parseInt(age),
      height: parseFloat(height),
      weight: parseFloat(weight),
      gender,
      units,
      region,
      allergies,
      dietaryPreference,
      activityLevel,
      goal,
      trackedMacros,
      isPremium,
    });
    router.replace("/dashboard");
  };

  const handleBack = () => {
    const stepOrder: Step[] = ["welcome", "stats", "region", "allergies", "dietary", "activity", "goal", "macros", "premium", "summary"];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1]);
    }
  };

  const toggleMacro = (macro: TrackedMacro) => {
    setTrackedMacros((prev) =>
      prev.includes(macro)
        ? prev.filter((m) => m !== macro)
        : [...prev, macro]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy]
    );
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies((prev) => [...prev, customAllergy.trim()]);
      setCustomAllergy("");
      Keyboard.dismiss();
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies((prev) => prev.filter((a) => a !== allergy));
  };

  const currentStepNumber = STEP_MAP[step];
  const showStepCounter = currentStepNumber > 0;

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

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStep("stats")}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === "stats") {
    const isValid = age && height && weight;
    const heightLabel = units === "metric" ? "Height (cm)" : "Height (in)";
    const weightLabel = units === "metric" ? "Weight (kg)" : "Weight (lbs)";
    const heightPlaceholder = units === "metric" ? "180" : "71";
    const weightPlaceholder = units === "metric" ? "75" : "165";

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
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
              <Text style={styles.label}>Units</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    units === "metric" && styles.optionButtonActive,
                  ]}
                  onPress={() => setUnits("metric")}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      units === "metric" && styles.optionButtonTextActive,
                    ]}
                  >
                    Metric (cm/kg)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    units === "imperial" && styles.optionButtonActive,
                  ]}
                  onPress={() => setUnits("imperial")}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      units === "imperial" && styles.optionButtonTextActive,
                    ]}
                  >
                    Imperial (in/lbs)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{heightLabel}</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder={heightPlaceholder}
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{weightLabel}</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder={weightPlaceholder}
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

        <View style={styles.footer}>
          <Text style={styles.infoNote}>All of this can be changed later</Text>
          {showStepCounter && (
            <Text style={styles.stepCounterText}>{currentStepNumber} of {TOTAL_STEPS}</Text>
          )}
          <TouchableOpacity
            style={[styles.primaryButton, !isValid && styles.primaryButtonDisabled]}
            onPress={() => isValid && setStep("region")}
            disabled={!isValid}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
        </View>
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
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
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

        <View style={styles.footer}>
          <Text style={styles.infoNote}>All of this can be changed later</Text>
          {showStepCounter && (
            <Text style={styles.stepCounterText}>{currentStepNumber} of {TOTAL_STEPS}</Text>
          )}
          <TouchableOpacity
            style={[styles.primaryButton, !region && styles.primaryButtonDisabled]}
            onPress={() => region && setStep("allergies")}
            disabled={!region}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === "allergies") {
    const commonAllergies = [
      "Peanuts",
      "Tree nuts",
      "Dairy",
      "Eggs",
      "Soy",
      "Wheat",
      "Fish",
      "Shellfish",
      "Gluten",
      "Lactose",
    ];

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View style={styles.content}>
          <Text style={styles.title}>Allergies</Text>
          <Text style={styles.subtitle}>Help us keep you safe</Text>

          <View style={styles.form}>
            <View style={styles.allergyGrid}>
              {commonAllergies.map((allergy) => (
                <TouchableOpacity
                  key={allergy}
                  style={[
                    styles.allergyChip,
                    allergies.includes(allergy) && styles.allergyChipActive,
                  ]}
                  onPress={() => toggleAllergy(allergy)}
                >
                  <Text
                    style={[
                      styles.allergyChipText,
                      allergies.includes(allergy) && styles.allergyChipTextActive,
                    ]}
                  >
                    {allergy}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Add Custom Allergy</Text>
              <View style={styles.customInputRow}>
                <TextInput
                  style={[styles.input, styles.customInput]}
                  value={customAllergy}
                  onChangeText={setCustomAllergy}
                  placeholder="Enter allergy"
                  placeholderTextColor="#666"
                  returnKeyType="done"
                  onSubmitEditing={addCustomAllergy}
                />
                <TouchableOpacity
                  style={[styles.addButton, !customAllergy.trim() && styles.addButtonDisabled]}
                  onPress={addCustomAllergy}
                  disabled={!customAllergy.trim()}
                >
                  <Plus color="#000" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            {allergies.filter((a) => !commonAllergies.includes(a)).length > 0 && (
              <View style={styles.selectedAllergies}>
                <Text style={styles.label}>Your Custom Allergies</Text>
                <View style={styles.allergyTagsContainer}>
                  {allergies
                    .filter((a) => !commonAllergies.includes(a))
                    .map((allergy) => (
                      <View key={allergy} style={styles.allergyTag}>
                        <Text style={styles.allergyTagText}>{allergy}</Text>
                        <TouchableOpacity onPress={() => removeAllergy(allergy)}>
                          <X color="#000" size={14} />
                        </TouchableOpacity>
                      </View>
                    ))}
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.infoNote}>All of this can be changed later</Text>
          {showStepCounter && (
            <Text style={styles.stepCounterText}>{currentStepNumber} of {TOTAL_STEPS}</Text>
          )}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStep("dietary")}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (step === "dietary") {
    const dietaryPreferences: { value: DietaryPreference; label: string; desc: string }[] = [
      { value: "none", label: "No Preference", desc: "No dietary restrictions" },
      { value: "vegetarian", label: "Vegetarian", desc: "No meat or fish" },
      { value: "vegan", label: "Vegan", desc: "No animal products" },
      { value: "pescatarian", label: "Pescatarian", desc: "Fish but no meat" },
      { value: "keto", label: "Keto", desc: "Low carb, high fat" },
      { value: "paleo", label: "Paleo", desc: "Whole foods, no grains" },
      { value: "halal", label: "Halal", desc: "Islamic dietary laws" },
      { value: "kosher", label: "Kosher", desc: "Jewish dietary laws" },
    ];

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View style={styles.content}>
          <Text style={styles.title}>Dietary Preference</Text>
          <Text style={styles.subtitle}>How do you like to eat?</Text>

          <View style={styles.form}>
            {dietaryPreferences.map((pref) => (
              <TouchableOpacity
                key={pref.value}
                style={[
                  styles.activityCard,
                  dietaryPreference === pref.value && styles.activityCardActive,
                ]}
                onPress={() => setDietaryPreference(pref.value)}
              >
                <Text
                  style={[
                    styles.activityLabel,
                    dietaryPreference === pref.value && styles.activityLabelActive,
                  ]}
                >
                  {pref.label}
                </Text>
                <Text
                  style={[
                    styles.activityDesc,
                    dietaryPreference === pref.value && styles.activityDescActive,
                  ]}
                >
                  {pref.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.infoNote}>All of this can be changed later</Text>
          {showStepCounter && (
            <Text style={styles.stepCounterText}>{currentStepNumber} of {TOTAL_STEPS}</Text>
          )}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStep("activity")}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
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

        <View style={styles.footer}>
          <Text style={styles.infoNote}>All of this can be changed later</Text>
          {showStepCounter && (
            <Text style={styles.stepCounterText}>{currentStepNumber} of {TOTAL_STEPS}</Text>
          )}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStep("goal")}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
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

        <View style={styles.footer}>
          <Text style={styles.infoNote}>All of this can be changed later</Text>
          {showStepCounter && (
            <Text style={styles.stepCounterText}>{currentStepNumber} of {TOTAL_STEPS}</Text>
          )}
          <TouchableOpacity style={styles.primaryButton} onPress={() => setStep("macros")}>
            <Text style={styles.primaryButtonText}>Continue</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
        </View>
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
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
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

        <View style={styles.footer}>
          <Text style={styles.infoNote}>All of this can be changed later</Text>
          {showStepCounter && (
            <Text style={styles.stepCounterText}>{currentStepNumber} of {TOTAL_STEPS}</Text>
          )}
          <TouchableOpacity
            style={[styles.primaryButton, trackedMacros.length === 0 && styles.primaryButtonDisabled]}
            onPress={() => setStep("premium")}
            disabled={trackedMacros.length === 0}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (step === "premium") {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View style={styles.content}>
          <Text style={styles.title}>Go Premium</Text>
          <Text style={styles.subtitle}>Unlock advanced features</Text>

          <View style={styles.premiumCard}>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>7 DAYS FREE</Text>
            </View>
            
            <Text style={styles.premiumPrice}>£4.99/month</Text>
            <Text style={styles.premiumPriceDesc}>then £4.99 per month</Text>

            <View style={styles.premiumFeatures}>
              <View style={styles.premiumFeature}>
                <View style={styles.premiumFeatureDot} />
                <Text style={styles.premiumFeatureText}>Advanced AI insights</Text>
              </View>
              <View style={styles.premiumFeature}>
                <View style={styles.premiumFeatureDot} />
                <Text style={styles.premiumFeatureText}>Detailed nutrition breakdown</Text>
              </View>
              <View style={styles.premiumFeature}>
                <View style={styles.premiumFeatureDot} />
                <Text style={styles.premiumFeatureText}>Custom meal planning</Text>
              </View>
              <View style={styles.premiumFeature}>
                <View style={styles.premiumFeatureDot} />
                <Text style={styles.premiumFeatureText}>Priority support</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => {
                setIsPremium(true);
                setStep("summary");
              }}
            >
              <Text style={styles.premiumButtonText}>Start Free Trial</Text>
            </TouchableOpacity>

            <Text style={styles.premiumDisclaimer}>
              Cancel anytime. No commitment.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          {showStepCounter && (
            <Text style={styles.stepCounterText}>{currentStepNumber} of {TOTAL_STEPS}</Text>
          )}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setIsPremium(false);
              setStep("summary");
            }}
          >
            <Text style={styles.secondaryButtonText}>Continue without Premium</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === "summary") {
    const displayHeight = units === "imperial" ? `${height} in` : `${height} cm`;
    const displayWeight = units === "imperial" ? `${weight} lbs` : `${weight} kg`;
    const goalLabels: Record<Goal, string> = {
      lose: "Lose Fat",
      maintain: "Maintain Weight",
      gain: "Build Muscle",
    };
    const activityLabels: Record<ActivityLevel, string> = {
      sedentary: "Sedentary",
      light: "Light",
      moderate: "Moderate",
      active: "Active",
      very_active: "Very Active",
    };

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View style={styles.content}>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.subtitle}>Here&apos;s what we&apos;ve learned about you</Text>

          <View style={styles.summarySection}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardTitle}>Physical Stats</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Age</Text>
                <Text style={styles.summaryValue}>{age} years</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Height</Text>
                <Text style={styles.summaryValue}>{displayHeight}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Weight</Text>
                <Text style={styles.summaryValue}>{displayWeight}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gender</Text>
                <Text style={styles.summaryValue}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardTitle}>Lifestyle</Text>
              {region && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Region</Text>
                  <Text style={styles.summaryValue}>{region}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Activity</Text>
                <Text style={styles.summaryValue}>{activityLabels[activityLevel]}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Goal</Text>
                <Text style={styles.summaryValue}>{goalLabels[goal]}</Text>
              </View>
              {dietaryPreference !== "none" && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Diet</Text>
                  <Text style={styles.summaryValue}>
                    {dietaryPreference.charAt(0).toUpperCase() + dietaryPreference.slice(1)}
                  </Text>
                </View>
              )}
            </View>

            {allergies.length > 0 && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCardTitle}>Allergies</Text>
                <View style={styles.summaryTags}>
                  {allergies.map((allergy) => (
                    <View key={allergy} style={styles.summaryTag}>
                      <Text style={styles.summaryTagText}>{allergy}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardTitle}>Tracking</Text>
              <View style={styles.summaryTags}>
                {trackedMacros.map((macro) => (
                  <View key={macro} style={styles.summaryTag}>
                    <Text style={styles.summaryTagText}>
                      {macro.charAt(0).toUpperCase() + macro.slice(1)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {isPremium && (
              <View style={[styles.summaryCard, styles.summaryCardPremium]}>
                <Text style={[styles.summaryCardTitle, { color: "#000" }]}>Premium</Text>
                <Text style={styles.summaryPremiumText}>7-day free trial active</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.refineNote}>We&apos;ll refine this as you log more data.</Text>
          {showStepCounter && (
            <Text style={styles.stepCounterText}>{currentStepNumber} of {TOTAL_STEPS}</Text>
          )}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleComplete}
          >
            <Text style={styles.primaryButtonText}>Start Tracking</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return null;
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
    paddingTop: 64,
  },
  backButton: {
    position: "absolute" as const,
    top: 48,
    left: 24,
    zIndex: 10,
    padding: 8,
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
  allergyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  allergyChip: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  allergyChipActive: {
    backgroundColor: "#fff",
  },
  allergyChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#999",
  },
  allergyChipTextActive: {
    color: "#000",
  },
  customInputRow: {
    flexDirection: "row",
    gap: 12,
  },
  customInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    opacity: 0.3,
  },
  selectedAllergies: {
    gap: 12,
  },
  allergyTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  allergyTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 8,
  },
  allergyTagText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  premiumCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  premiumBadge: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 20,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 1,
  },
  premiumPrice: {
    fontSize: 40,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  premiumPriceDesc: {
    fontSize: 14,
    color: "#999",
    marginBottom: 32,
  },
  premiumFeatures: {
    width: "100%",
    gap: 16,
    marginBottom: 32,
  },
  premiumFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  premiumFeatureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  premiumFeatureText: {
    fontSize: 16,
    color: "#ccc",
  },
  premiumButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  premiumButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  premiumDisclaimer: {
    fontSize: 12,
    color: "#666",
  },
  summarySection: {
    gap: 16,
  },
  summaryCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  summaryCardPremium: {
    backgroundColor: "#fff",
  },
  summaryCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#999",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  summaryTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  summaryTag: {
    backgroundColor: "#2c2c2e",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  summaryTagText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
  },
  summaryPremiumText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
  },
  refineNote: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 12,
    fontStyle: "italic",
  },
  infoNote: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  stepCounterText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 12,
  },
  footer: {
    padding: 24,
    paddingTop: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    padding: 14,
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
  secondaryButton: {
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
