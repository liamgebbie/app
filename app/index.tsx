import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUser } from "@/contexts/UserContext";

export default function Index() {
  const { profile, isLoading } = useUser();
  const router = useRouter();

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

  if (profile) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>NutriTrack</Text>
          <Text style={styles.subtitle}>AI-powered calorie tracking</Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/onboarding")}
          >
            <Text style={styles.primaryButtonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/onboarding")}
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
            onPress={() => router.push("/onboarding")}
          >
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => router.push("/onboarding")}
          >
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    gap: 64,
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
});
