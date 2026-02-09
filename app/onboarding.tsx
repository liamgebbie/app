import { useRouter } from "expo-router";
import { ArrowRight, X, Plus, ChevronLeft, HelpCircle } from "lucide-react-native";
import { useState, useEffect } from "react";
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
import { calculateBMI, getBMICategory, calculateProjectedWeight, calculateBMR, calculateTDEE, calculateTargetCalories } from "@/utils/calculations";

type Step = "stats" | "dateOfBirth" | "region" | "allergies" | "dietary" | "activity" | "goal" | "appleHealth" | "caloriesBurnt" | "rollover" | "notifications" | "macros" | "premium" | "premiumUpsell" | "loading" | "summary";

const TOTAL_STEPS = 13;
const STEP_MAP: Record<Step, number> = {
  stats: 1,
  dateOfBirth: 2,
  region: 3,
  allergies: 4,
  dietary: 5,
  activity: 6,
  goal: 7,
  appleHealth: 8,
  caloriesBurnt: 0,
  rollover: 9,
  notifications: 10,
  macros: 11,
  premium: 12,
  premiumUpsell: 0,
  loading: 0,
  summary: 13,
};

export default function Onboarding() {
  const router = useRouter();
  const { createProfile, authToken } = useUser();
  const [step, setStep] = useState<Step>("stats");

  useEffect(() => {
    if (!authToken) {
      router.replace("/");
    }
  }, [authToken, router]);

  const [age, setAge] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
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
  const [showBMIInfo, setShowBMIInfo] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<"monthly" | "yearly">("yearly");
  const [weightSpeed, setWeightSpeed] = useState(0.5);
  const [hasAppleHealth, setHasAppleHealth] = useState(false);
  const [caloriesBurntAffectsTarget, setCaloriesBurntAffectsTarget] = useState(false);
  const [calorieRollover, setCalorieRollover] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("Analyzing your profile...");
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear - 25);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);

  useEffect(() => {
    if (step !== "loading") return;
    
    const steps = [
      { progress: 20, status: "Analyzing your profile..." },
      { progress: 40, status: "Calculating calorie needs..." },
      { progress: 60, status: "Setting up macro targets..." },
      { progress: 80, status: "Personalizing recommendations..." },
      { progress: 100, status: "Almost ready..." },
    ];

    let currentStep = 0;
    let currentProgress = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const targetProgress = steps[currentStep].progress;
        if (currentProgress < targetProgress) {
          currentProgress += 2;
          setLoadingProgress(Math.min(currentProgress, targetProgress));
        } else {
          setLoadingStatus(steps[currentStep].status);
          currentStep++;
        }
      } else {
        clearInterval(interval);
        setTimeout(() => setStep("summary"), 500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [step]);

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
    router.replace("/(tabs)");
  };

  const handleContinueWithoutPremium = () => {
    setIsPremium(false);
    setStep("premiumUpsell");
  };

  const handleBack = () => {
    const stepOrder: Step[] = ["stats", "dateOfBirth", "region", "allergies", "dietary", "activity", "goal", "appleHealth", hasAppleHealth ? "caloriesBurnt" : "skip", "rollover", "notifications", "macros", "premium", isPremium ? "skip" : "premiumUpsell", "loading", "summary"].filter(s => s !== "skip");
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1]);
    } else {
      router.back();
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
  const showProgressBar = currentStepNumber > 0;



  if (step === "stats") {
    const isValid = height && weight;
    const heightLabel = units === "metric" ? "Height (cm)" : "Height (in)";
    const weightLabel = units === "metric" ? "Weight (kg)" : "Weight (lbs)";
    const heightPlaceholder = units === "metric" ? "180" : "71";
    const weightPlaceholder = units === "metric" ? "75" : "165";

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color="#fff" size={18} />
          </TouchableOpacity>
          {showProgressBar && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(currentStepNumber / TOTAL_STEPS) * 100}%` }]} />
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Your Stats</Text>
          <Text style={styles.subtitle}>We need some basic information</Text>

          <View style={styles.form}>
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
            onPress={() => isValid && setStep("dateOfBirth")}
            disabled={!isValid}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (step === "dateOfBirth") {
    const years = Array.from({ length: 100 }, (_, i) => currentYear - 13 - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const getDaysInMonth = (year: number, month: number) => {
      return new Date(year, month, 0).getDate();
    };
    const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

    const handleConfirm = () => {
      const month = selectedMonth.toString().padStart(2, "0");
      const day = selectedDay.toString().padStart(2, "0");
      const dob = `${selectedYear}-${month}-${day}`;
      setDateOfBirth(dob);
      const calculatedAge = currentYear - selectedYear;
      setAge(calculatedAge.toString());
      setStep("region");
    };

    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color="#fff" size={18} />
          </TouchableOpacity>
          {showProgressBar && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(currentStepNumber / TOTAL_STEPS) * 100}%` }]} />
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Date of Birth</Text>
          <Text style={styles.subtitle}>We need this to calculate your needs</Text>

          <View style={styles.form}>
            <View style={styles.datePickerInline}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Year</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[styles.pickerItem, selectedYear === year && styles.pickerItemSelected]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text style={[styles.pickerItemText, selectedYear === year && styles.pickerItemTextSelected]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Month</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month}
                      style={[styles.pickerItem, selectedMonth === month && styles.pickerItemSelected]}
                      onPress={() => {
                        setSelectedMonth(month);
                        const maxDays = getDaysInMonth(selectedYear, month);
                        if (selectedDay > maxDays) {
                          setSelectedDay(maxDays);
                        }
                      }}
                    >
                      <Text style={[styles.pickerItemText, selectedMonth === month && styles.pickerItemTextSelected]}>
                        {month.toString().padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Day</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[styles.pickerItem, selectedDay === day && styles.pickerItemSelected]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text style={[styles.pickerItemText, selectedDay === day && styles.pickerItemTextSelected]}>
                        {day.toString().padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
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
            style={styles.primaryButton}
            onPress={handleConfirm}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
        </View>
      </View>
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
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color="#fff" size={18} />
          </TouchableOpacity>
          {showProgressBar && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(currentStepNumber / TOTAL_STEPS) * 100}%` }]} />
            </View>
          )}
        </View>
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
      </ScrollView>
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
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color="#fff" size={18} />
          </TouchableOpacity>
          {showProgressBar && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(currentStepNumber / TOTAL_STEPS) * 100}%` }]} />
            </View>
          )}
        </View>
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
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color="#fff" size={18} />
          </TouchableOpacity>
          {showProgressBar && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(currentStepNumber / TOTAL_STEPS) * 100}%` }]} />
            </View>
          )}
        </View>
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
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color="#fff" size={18} />
          </TouchableOpacity>
          {showProgressBar && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(currentStepNumber / TOTAL_STEPS) * 100}%` }]} />
            </View>
          )}
        </View>
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

    const speedLabels = {
      0.25: "Slow",
      0.5: "Moderate",
      0.75: "Fast",
      1: "Very Fast",
    };

    const calculateTimeToGoal = (speed: number) => {
      if (goal === "maintain") return "Maintaining current weight";
      const weeklyKgChange = speed;
      const targetChange = goal === "lose" ? -5 : 5;
      const weeks = Math.abs(targetChange / weeklyKgChange);
      const months = Math.round(weeks / 4);
      return months > 0 ? `${months} month${months !== 1 ? "s" : ""}` : "Less than 1 month";
    };

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color="#fff" size={18} />
          </TouchableOpacity>
          {showProgressBar && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(currentStepNumber / TOTAL_STEPS) * 100}%` }]} />
            </View>
          )}
        </View>
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

            {goal !== "maintain" && (
              <View style={styles.weightSpeedSection}>
                <Text style={styles.sectionTitle}>Weight Change Speed</Text>
                <Text style={styles.sectionSubtitle}>How fast do you want to {goal === "lose" ? "lose" : "gain"} weight?</Text>
                
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>{speedLabels[weightSpeed as keyof typeof speedLabels] || "Moderate"}</Text>
                  <Text style={styles.sliderValue}>{weightSpeed} kg/week</Text>
                  
                  <View style={styles.sliderTrack}>
                    <View style={styles.sliderMarkers}>
                      {[0.25, 0.5, 0.75, 1].map((val) => (
                        <TouchableOpacity
                          key={val}
                          style={[styles.sliderMarker, weightSpeed === val && styles.sliderMarkerActive]}
                          onPress={() => setWeightSpeed(val)}
                        >
                          <View style={[styles.sliderDot, weightSpeed >= val && styles.sliderDotActive]} />
                          <Text style={styles.sliderMarkerText}>{val}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.goalTimeCard}>
                  <Text style={styles.goalTimeLabel}>Time to reach goal (-5kg / +5kg)</Text>
                  <Text style={styles.goalTimeValue}>{calculateTimeToGoal(weightSpeed)}</Text>
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
          <TouchableOpacity style={styles.primaryButton} onPress={() => setStep("appleHealth")}>
            <Text style={styles.primaryButtonText}>Continue</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }



  if (step === "appleHealth") {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color="#fff" size={18} />
          </TouchableOpacity>
          {showProgressBar && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(currentStepNumber / TOTAL_STEPS) * 100}%` }]} />
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Apple Health</Text>
          <Text style={styles.subtitle}>Connect to sync your activity and health data</Text>

          <View style={styles.form}>
            <View style={styles.appleHealthCard}>
              <Text style={styles.appleHealthIcon}>❤️</Text>
              <Text style={styles.appleHealthTitle}>Connect Apple Health</Text>
              <Text style={styles.appleHealthDesc}>
                Sync workouts, steps, and calories burned to get more accurate tracking
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          {showStepCounter && (
            <Text style={styles.stepCounterText}>{currentStepNumber} of {TOTAL_STEPS}</Text>
          )}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setHasAppleHealth(true);
              setStep("caloriesBurnt");
            }}
          >
            <Text style={styles.primaryButtonText}>Connect</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setHasAppleHealth(false);
              setStep("rollover");
            }}
          >
            <Text style={styles.secondaryButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === "caloriesBurnt") {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color="#fff" size={18} />
          </TouchableOpacity>
          {showProgressBar && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(currentStepNumber / TOTAL_STEPS) * 100}%` }]} />
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Calories Burned</Text>
          <Text style={styles.subtitle}>Should exercise affect your daily calorie goal?</Text>

          <View style={styles.form}>
            <TouchableOpacity
              style={[styles.activityCard, caloriesBurntAffectsTarget && styles.activityCardActive]}
              onPress={() => setCaloriesBurntAffectsTarget(true)}
            >
              <Text style={[styles.activityLabel, caloriesBurntAffectsTarget && styles.activityLabelActive]}>
                Yes, add them
              </Text>
              <Text style={[styles.activityDesc, caloriesBurntAffectsTarget && styles.activityDescActive]}>
                Calories burned from exercise will increase your daily goal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.activityCard, !caloriesBurntAffectsTarget && styles.activityCardActive]}
              onPress={() => setCaloriesBurntAffectsTarget(false)}
            >
              <Text style={[styles.activityLabel, !caloriesBurntAffectsTarget && styles.activityLabelActive]}>
                No, keep it fixed
              </Text>
              <Text style={[styles.activityDesc, !caloriesBurntAffectsTarget && styles.activityDescActive]}>
                Daily goal stays the same regardless of exercise
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.infoNote}>You can change this later in settings</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setStep("rollover")}>
            <Text style={styles.primaryButtonText}>Continue</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === "rollover") {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color="#fff" size={18} />
          </TouchableOpacity>
          {showProgressBar && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(currentStepNumber / TOTAL_STEPS) * 100}%` }]} />
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Calorie Rollover</Text>
          <Text style={styles.subtitle}>Balance your calories across days</Text>

          <View style={styles.form}>
            <TouchableOpacity
              style={[styles.activityCard, calorieRollover && styles.activityCardActive]}
              onPress={() => setCalorieRollover(true)}
            >
              <Text style={[styles.activityLabel, calorieRollover && styles.activityLabelActive]}>
                Enable Rollover
              </Text>
              <Text style={[styles.activityDesc, calorieRollover && styles.activityDescActive]}>
                Extra or missing calories roll over to the next day (±250 cal limit)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.activityCard, !calorieRollover && styles.activityCardActive]}
              onPress={() => setCalorieRollover(false)}
            >
              <Text style={[styles.activityLabel, !calorieRollover && styles.activityLabelActive]}>
                Fresh Start Daily
              </Text>
              <Text style={[styles.activityDesc, !calorieRollover && styles.activityDescActive]}>
                Each day starts with your standard calorie goal
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.infoNote}>This helps maintain consistency</Text>
          {showStepCounter && (
            <Text style={styles.stepCounterText}>{currentStepNumber} of {TOTAL_STEPS}</Text>
          )}
          <TouchableOpacity style={styles.primaryButton} onPress={() => setStep("notifications")}>
            <Text style={styles.primaryButtonText}>Continue</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === "notifications") {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color="#fff" size={18} />
          </TouchableOpacity>
          {showProgressBar && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(currentStepNumber / TOTAL_STEPS) * 100}%` }]} />
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Stay on Track</Text>
          <Text style={styles.subtitle}>Get reminders to log your meals</Text>

          <View style={styles.form}>
            <View style={styles.notificationCard}>
              <Text style={styles.notificationIcon}>🔔</Text>
              <Text style={styles.notificationTitle}>Enable Notifications</Text>
              <Text style={styles.notificationDesc}>
                Receive helpful reminders throughout the day to log your meals and stay consistent
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          {showStepCounter && (
            <Text style={styles.stepCounterText}>{currentStepNumber} of {TOTAL_STEPS}</Text>
          )}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setNotificationsEnabled(true);
              setStep("macros");
            }}
          >
            <Text style={styles.primaryButtonText}>Enable Notifications</Text>
            <ArrowRight color="#000" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setNotificationsEnabled(false);
              setStep("macros");
            }}
          >
            <Text style={styles.secondaryButtonText}>Not now</Text>
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
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color="#fff" size={18} />
          </TouchableOpacity>
          {showProgressBar && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(currentStepNumber / TOTAL_STEPS) * 100}%` }]} />
            </View>
          )}
        </View>
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
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color="#fff" size={18} />
          </TouchableOpacity>
          {showProgressBar && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(currentStepNumber / TOTAL_STEPS) * 100}%` }]} />
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Go Premium</Text>
          <Text style={styles.subtitle}>Unlock advanced features</Text>

          <View style={styles.premiumCard}>
            {subscriptionType === "yearly" && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>3 DAYS FREE</Text>
              </View>
            )}
            
            <View style={styles.subscriptionToggle}>
              <TouchableOpacity
                style={[styles.toggleOption, subscriptionType === "monthly" && styles.toggleOptionActive]}
                onPress={() => setSubscriptionType("monthly")}
              >
                <Text style={[styles.toggleOptionText, subscriptionType === "monthly" && styles.toggleOptionTextActive]}>Monthly</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleOption, subscriptionType === "yearly" && styles.toggleOptionActive]}
                onPress={() => setSubscriptionType("yearly")}
              >
                <Text style={[styles.toggleOptionText, subscriptionType === "yearly" && styles.toggleOptionTextActive]}>Yearly</Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>Save £35</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.premiumPrice}>{subscriptionType === "monthly" ? "£4.99/month" : "£24.99/year"}</Text>
            <Text style={styles.premiumPriceDesc}>{subscriptionType === "monthly" ? "Billed monthly" : "then £24.99 per year"}</Text>

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
                setStep("loading");
              }}
            >
              <Text style={styles.premiumButtonText}>{subscriptionType === "yearly" ? "Start 3-Day Free Trial" : "Subscribe Now"}</Text>
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
            onPress={handleContinueWithoutPremium}
          >
            <Text style={styles.secondaryButtonText}>Continue without Premium</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (step === "premiumUpsell") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color="#fff" size={18} />
          </TouchableOpacity>
          {showProgressBar && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(currentStepNumber / TOTAL_STEPS) * 100}%` }]} />
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>You&apos;re Missing Out</Text>
          <Text style={styles.subtitle}>Premium users see 3x better results</Text>

          <View style={styles.upsellSection}>
            <View style={styles.upsellCard}>
              <Text style={styles.upsellCardTitle}>🎯 Precision Tracking</Text>
              <Text style={styles.upsellCardDesc}>
                Get detailed micronutrient breakdowns and allergen warnings for every meal
              </Text>
            </View>

            <View style={styles.upsellCard}>
              <Text style={styles.upsellCardTitle}>🧠 Smart AI Coach</Text>
              <Text style={styles.upsellCardDesc}>
                Receive personalized insights and meal suggestions based on your goals
              </Text>
            </View>

            <View style={styles.upsellCard}>
              <Text style={styles.upsellCardTitle}>📊 Advanced Analytics</Text>
              <Text style={styles.upsellCardDesc}>
                Track trends, predict progress, and optimize your nutrition strategy
              </Text>
            </View>

            <View style={styles.upsellCard}>
              <Text style={styles.upsellCardTitle}>⚡ Priority Support</Text>
              <Text style={styles.upsellCardDesc}>
                Get help when you need it with dedicated premium support
              </Text>
            </View>

            <View style={styles.upsellPriceBox}>
              <View style={styles.upsellFreeTrialBadge}>
                <Text style={styles.upsellFreeTrialText}>🎉 3 DAY FREE TRIAL 🎉</Text>
              </View>
              
              <View style={styles.subscriptionToggleSmall}>
                <TouchableOpacity
                  style={[styles.toggleOptionSmall, subscriptionType === "monthly" && styles.toggleOptionSmallActive]}
                  onPress={() => setSubscriptionType("monthly")}
                >
                  <Text style={[styles.toggleOptionTextSmall, subscriptionType === "monthly" && styles.toggleOptionTextSmallActive]}>Monthly</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleOptionSmall, subscriptionType === "yearly" && styles.toggleOptionSmallActive]}
                  onPress={() => setSubscriptionType("yearly")}
                >
                  <Text style={[styles.toggleOptionTextSmall, subscriptionType === "yearly" && styles.toggleOptionTextSmallActive]}>Yearly</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.upsellPriceLabel}>Then only</Text>
              <Text style={styles.upsellPrice}>{subscriptionType === "monthly" ? "£4.99/month" : "£24.99/year"}</Text>
              <Text style={styles.upsellPriceNote}>{subscriptionType === "yearly" ? "Save £35 per year • " : ""}Cancel anytime, no commitment</Text>
            </View>

            <TouchableOpacity
              style={styles.upsellPremiumButton}
              onPress={() => {
                setIsPremium(true);
                setStep("loading");
              }}
            >
              <Text style={styles.upsellPremiumButtonText}>{subscriptionType === "yearly" ? "Start 3-Day Free Trial" : "Subscribe Now"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.textButton}
            onPress={() => setStep("loading")}
          >
            <Text style={styles.textButtonText}>I&apos;ll stick with free</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (step === "loading") {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingTitle}>Setting Up Your Profile</Text>
          
          <View style={styles.loadingProgressContainer}>
            <View style={styles.loadingProgressTrack}>
              <View style={[styles.loadingProgressFill, { width: `${loadingProgress}%` }]} />
            </View>
            <Text style={styles.loadingProgressText}>{loadingProgress}%</Text>
          </View>

          <Text style={styles.loadingStatus}>{loadingStatus}</Text>
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

    const heightInCm = units === "imperial" ? parseFloat(height) * 2.54 : parseFloat(height);
    const weightInKg = units === "imperial" ? parseFloat(weight) * 0.453592 : parseFloat(weight);
    const bmi = calculateBMI(weightInKg, heightInCm);
    const bmiCategory = getBMICategory(bmi);
    const bmr = calculateBMR(weightInKg, heightInCm, parseInt(age), gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const targetCalories = calculateTargetCalories(tdee, goal);
    const projectedWeight12Weeks = calculateProjectedWeight(weightInKg, goal, 12);
    const projectedWeightDisplay = units === "imperial" 
      ? `${(projectedWeight12Weeks / 0.453592).toFixed(1)} lbs` 
      : `${projectedWeight12Weeks.toFixed(1)} kg`;
    const weightChange = Math.abs(projectedWeight12Weeks - weightInKg);
    const weightChangeDisplay = units === "imperial"
      ? `${(weightChange / 0.453592).toFixed(1)} lbs`
      : `${weightChange.toFixed(1)} kg`;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft color="#fff" size={18} />
          </TouchableOpacity>
          {showProgressBar && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(currentStepNumber / TOTAL_STEPS) * 100}%` }]} />
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.subtitle}>Here&apos;s what we&apos;ve learned about you</Text>

          <View style={styles.summarySection}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardTitle}>Physical Stats</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date of Birth</Text>
                <Text style={styles.summaryValue}>{dateOfBirth}</Text>
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
              <Text style={styles.summaryCardTitle}>Health Metrics</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelWithInfo}>
                  <Text style={styles.summaryLabel}>WHO classifies you as</Text>
                  <TouchableOpacity onPress={() => setShowBMIInfo(!showBMIInfo)}>
                    <HelpCircle color="#666" size={16} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.summaryValue}>{bmiCategory}</Text>
              </View>
              {showBMIInfo && (
                <View style={styles.bmiInfoBox}>
                  <Text style={styles.bmiInfoText}>
                    The World Health Organization (WHO) is a specialized agency of the United Nations responsible for international public health. They classify weight status using BMI ranges:
                    {"\n\n"}• Underweight: BMI &lt; 18.5
                    {"\n"}• Normal: BMI 18.5-24.9
                    {"\n"}• Overweight: BMI 25-29.9
                    {"\n"}• Obese: BMI ≥ 30
                    {"\n\n"}Your BMI: {bmi.toFixed(1)}
                  </Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Daily Calorie Target</Text>
                <Text style={styles.summaryValue}>{targetCalories} kcal</Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardTitle}>Projected Progress</Text>
              <Text style={styles.projectedSubtitle}>If you stay consistent for 12 weeks:</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Projected Weight</Text>
                <Text style={styles.summaryValue}>{projectedWeightDisplay}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Potential Change</Text>
                <Text style={[styles.summaryValue, goal === "lose" ? styles.summaryValueSuccess : undefined]}>
                  {goal === "lose" ? "-" : goal === "gain" ? "+" : ""}{weightChangeDisplay}
                </Text>
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
                <Text style={styles.summaryPremiumText}>{subscriptionType === "yearly" ? "3-day free trial active" : "Premium active"}</Text>
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
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingTop: 50,
    gap: 12,
    zIndex: 10,
  },
  backButton: {
    padding: 6,
    backgroundColor: "#1a1a1a",
    borderRadius: 6,
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
    fontSize: 32,
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
    textAlign: "center",
    marginTop: 12,
  },
  subscriptionToggle: {
    flexDirection: "row",
    backgroundColor: "#0a0a0a",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    width: "100%",
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleOptionActive: {
    backgroundColor: "#fff",
  },
  toggleOptionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  toggleOptionTextActive: {
    color: "#000",
  },
  saveBadge: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  subscriptionToggleSmall: {
    flexDirection: "row",
    backgroundColor: "#0a0a0a",
    borderRadius: 8,
    padding: 3,
    marginVertical: 16,
  },
  toggleOptionSmall: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  toggleOptionSmallActive: {
    backgroundColor: "#fff",
  },
  toggleOptionTextSmall: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  toggleOptionTextSmallActive: {
    color: "#000",
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 24,
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  upsellSection: {
    gap: 16,
  },
  upsellCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
  },
  upsellCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  upsellCardDesc: {
    fontSize: 14,
    color: "#999",
    lineHeight: 20,
  },
  upsellPriceBox: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  upsellFreeTrialBadge: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 16,
  },
  upsellFreeTrialText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 1.5,
  },
  upsellPriceLabel: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  upsellPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  upsellPriceNote: {
    fontSize: 12,
    color: "#666",
  },
  upsellPremiumButton: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  upsellPremiumButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  textButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  textButtonText: {
    fontSize: 14,
    color: "#666",
    textDecorationLine: "underline",
  },
  summaryLabelWithInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bmiInfoBox: {
    backgroundColor: "#2c2c2e",
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  bmiInfoText: {
    fontSize: 12,
    color: "#ccc",
    lineHeight: 18,
  },
  projectedSubtitle: {
    fontSize: 13,
    color: "#999",
    marginBottom: 12,
    fontStyle: "italic",
  },
  summaryValueSuccess: {
    color: "#4ade80",
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: "#1a1a1a",
    borderRadius: 2,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  datePickerInline: {
    flexDirection: "row" as const,
    gap: 12,
    height: 240,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#999",
    textAlign: "center" as const,
    marginBottom: 12,
  },
  pickerScroll: {
    height: 200,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
  },
  pickerItem: {
    paddingVertical: 14,
    alignItems: "center" as const,
  },
  pickerItemSelected: {
    backgroundColor: "#fff",
  },
  pickerItemText: {
    fontSize: 16,
    color: "#999",
  },
  pickerItemTextSelected: {
    color: "#000",
    fontWeight: "700" as const,
  },
  sliderContainer: {
    gap: 16,
  },
  sliderLabel: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    textAlign: "center" as const,
  },
  sliderValue: {
    fontSize: 16,
    color: "#999",
    textAlign: "center" as const,
  },
  sliderTrack: {
    paddingVertical: 20,
  },
  sliderMarkers: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
  },
  sliderMarker: {
    alignItems: "center" as const,
    gap: 8,
  },
  sliderMarkerActive: {
    opacity: 1,
  },
  sliderDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "#666",
  },
  sliderDotActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  sliderMarkerText: {
    fontSize: 12,
    color: "#666",
  },
  goalTimeCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    alignItems: "center" as const,
  },
  goalTimeLabel: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  goalTimeValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
  },
  appleHealthCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 32,
    alignItems: "center" as const,
  },
  appleHealthIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  appleHealthTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 12,
  },
  appleHealthDesc: {
    fontSize: 15,
    color: "#999",
    textAlign: "center" as const,
    lineHeight: 22,
  },
  notificationCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 32,
    alignItems: "center" as const,
  },
  notificationIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 12,
  },
  notificationDesc: {
    fontSize: 15,
    color: "#999",
    textAlign: "center" as const,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 40,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 48,
    textAlign: "center" as const,
  },
  loadingProgressContainer: {
    width: "100%",
    alignItems: "center" as const,
    gap: 12,
  },
  loadingProgressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 4,
    overflow: "hidden" as const,
  },
  loadingProgressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 4,
    transition: "width 0.1s ease-out" as const,
  },
  loadingProgressText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
  },
  loadingStatus: {
    fontSize: 16,
    color: "#999",
    marginTop: 32,
    textAlign: "center" as const,
  },
  dividerWithText: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  dividerText: {
    fontSize: 14,
    color: "#666",
  },
  weightSpeedSection: {
    gap: 16,
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: -8,
  },
});
