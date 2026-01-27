import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Modal } from "react-native";
import { useUser } from "@/contexts/UserContext";
import { trpc } from "@/lib/trpc";

type AuthMode = "welcome" | "login" | "signup";

export default function Index() {
  const { profile, isLoading, setAuthData } = useUser();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(1990);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);

  const loginMutation = trpc.auth.login.useMutation();
  const signupMutation = trpc.auth.signup.useMutation();

  const handleDateConfirm = useCallback(() => {
    const month = selectedMonth.toString().padStart(2, "0");
    const day = selectedDay.toString().padStart(2, "0");
    setDateOfBirth(`${selectedYear}-${month}-${day}`);
    setShowDatePicker(false);
  }, [selectedYear, selectedMonth, selectedDay]);

  const getDaysInMonth = useCallback((year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  }, []);

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  useEffect(() => {
    if (!isLoading && profile) {
      router.replace("/dashboard");
    }
  }, [isLoading, profile, router]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    router.push("/onboarding");
  };

  const handleSignup = async () => {
    if (!email || !password || !dateOfBirth) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      const result = await signupMutation.mutateAsync({ email, password, dateOfBirth });
      await setAuthData(result.token, result.id, result.email, result.dateOfBirth);
      router.push("/onboarding");
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Signup failed");
    }
  };

  if (profile) {
    return null;
  }

  if (mode === "welcome") {
    return (
      <View style={styles.container}>
        <View style={styles.welcomeContent}>
          <View style={styles.header}>
            <Text style={styles.title}>NutriTrack</Text>
            <Text style={styles.subtitle}>AI-powered calorie tracking</Text>
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

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setMode("login")}
            >
              <Text style={styles.primaryButtonText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => Alert.alert("Coming Soon", "Signing up will be available soon.")}
            >
              <Text style={styles.primaryButtonText}>Sign Up</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Alert.alert("Coming Soon", "Google sign-in will be available soon")}
            >
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Alert.alert("Coming Soon", "Apple sign-in will be available soon")}
            >
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (mode === "login") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to continue tracking</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="you@example.com"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor="#666"
              />
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLogin}
            >
              <Text style={styles.actionButtonText}>Log In</Text>
              <ArrowRight color="#000" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setMode("signup");
                setEmail("");
                setPassword("");
              }}
            >
              <Text style={styles.switchButtonText}>Don&apos;t have an account? Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToWelcome}
              onPress={() => {
                setMode("welcome");
                setEmail("");
                setPassword("");
              }}
            >
              <Text style={styles.backToWelcomeText}>← Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <>
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.datePickerCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.datePickerContainer}>
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

            <TouchableOpacity style={styles.datePickerConfirm} onPress={handleDateConfirm}>
              <Text style={styles.datePickerConfirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {mode === "signup" && (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Start your health journey today</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="you@example.com"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="At least 6 characters"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.dateButtonText, !dateOfBirth && styles.dateButtonPlaceholder]}>
                    {dateOfBirth || "Select your date of birth"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, signupMutation.isPending && styles.actionButtonDisabled]}
                onPress={handleSignup}
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Text style={styles.actionButtonText}>Create Account</Text>
                    <ArrowRight color="#000" size={20} />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => {
                  setMode("login");
                  setEmail("");
                  setPassword("");
                  setDateOfBirth("");
                }}
              >
                <Text style={styles.switchButtonText}>Already have an account? Log In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToWelcome}
                onPress={() => {
                  setMode("welcome");
                  setEmail("");
                  setPassword("");
                  setDateOfBirth("");
                }}
              >
                <Text style={styles.backToWelcomeText}>← Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 48,
  },
  formContainer: {
    gap: 40,
  },
  formHeader: {
    alignItems: "center",
    gap: 8,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#000",
  },
  switchButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  switchButtonText: {
    fontSize: 14,
    color: "#999",
  },
  backToWelcome: {
    alignItems: "center",
    paddingVertical: 8,
  },
  backToWelcomeText: {
    fontSize: 14,
    color: "#666",
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
  header: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 48,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
  },
  buttons: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginVertical: 8,
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
  socialButton: {
    backgroundColor: "#1a1a1a",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  dateButton: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  dateButtonPlaceholder: {
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  datePickerModal: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  datePickerCancel: {
    fontSize: 16,
    color: "#999",
  },
  datePickerContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    textAlign: "center",
    marginBottom: 12,
  },
  pickerScroll: {
    height: 250,
    backgroundColor: "#0a0a0a",
    borderRadius: 12,
  },
  pickerItem: {
    paddingVertical: 14,
    alignItems: "center",
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
    fontWeight: "700",
  },
  datePickerConfirm: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  datePickerConfirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
});
