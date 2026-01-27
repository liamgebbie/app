import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateObject } from "@rork-ai/toolkit-sdk";
import { z } from "zod";
import { useUser } from "@/contexts/UserContext";

const foodSchema = z.object({
  description: z.string().describe("A short, clean description of the food"),
  calories: z.number().describe("Total calories"),
  protein: z.number().describe("Protein in grams"),
  carbs: z.number().describe("Carbohydrates in grams"),
  fats: z.number().describe("Fats in grams"),
  sugars: z.number().describe("Sugars in grams"),
});

export default function LogFood() {
  const router = useRouter();
  const { addFoodLog } = useUser();
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedFood, setParsedFood] = useState<z.infer<typeof foodSchema> | null>(null);

  const handleParse = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      const result = await generateObject({
        messages: [
          {
            role: "user",
            content: `Parse this food description into calories and macros: "${input}". Be accurate with portion sizes and typical nutritional values. If the description is vague, use standard serving sizes.`,
          },
        ],
        schema: foodSchema,
      });

      console.log("AI parsed food:", result);
      setParsedFood(result);
    } catch (error) {
      console.error("Error parsing food:", error);
      alert("Failed to parse food. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!parsedFood) return;

    await addFoodLog(parsedFood);
    router.back();
  };

  const handleCancel = () => {
    setParsedFood(null);
    setInput("");
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Log Food</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {!parsedFood ? (
              <>
                <Text style={styles.instruction}>
                  Describe what you ate in natural language
                </Text>
                <Text style={styles.examples}>
                  e.g. &quot;grilled chicken breast and brown rice&quot; or &quot;2 eggs and toast&quot;
                </Text>

                <TextInput
                  style={styles.textInput}
                  value={input}
                  onChangeText={setInput}
                  placeholder="I had..."
                  placeholderTextColor="#666"
                  multiline
                  autoFocus
                  editable={!isProcessing}
                />

                <TouchableOpacity
                  style={[styles.primaryButton, (!input.trim() || isProcessing) && styles.primaryButtonDisabled]}
                  onPress={handleParse}
                  disabled={!input.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <ActivityIndicator color="#000" size="small" />
                      <Text style={styles.primaryButtonText}>Parsing...</Text>
                    </>
                  ) : (
                    <Text style={styles.primaryButtonText}>Parse with AI</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.confirmTitle}>Confirm Details</Text>

                <View style={styles.confirmCard}>
                  <View style={styles.confirmRow}>
                    <Text style={styles.confirmLabel}>Description</Text>
                    <Text style={styles.confirmValue}>{parsedFood.description}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.confirmRow}>
                    <Text style={styles.confirmLabel}>Calories</Text>
                    <Text style={styles.confirmValue}>{parsedFood.calories} cal</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.macrosGrid}>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>Protein</Text>
                      <Text style={styles.macroValue}>{parsedFood.protein}g</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>Carbs</Text>
                      <Text style={styles.macroValue}>{parsedFood.carbs}g</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>Fats</Text>
                      <Text style={styles.macroValue}>{parsedFood.fats}g</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroLabel}>Sugars</Text>
                      <Text style={styles.macroValue}>{parsedFood.sugars}g</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={handleCancel}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmButton} onPress={handleSave}>
                    <Text style={styles.confirmButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
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
  instruction: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  examples: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
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
  confirmTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 24,
  },
  confirmCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  confirmLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },
  confirmValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2a2a",
  },
  macrosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingTop: 12,
    gap: 16,
  },
  macroItem: {
    alignItems: "center",
  },
  macroLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
});
