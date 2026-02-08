import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Camera, Upload } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { generateObject } from "@rork-ai/toolkit-sdk";
import { z } from "zod";
import { useUser } from "@/contexts/UserContext";

const foodSchema = z.object({
  description: z.string().describe("A short, clean description of the food in the image"),
  calories: z.number().describe("Total calories"),
  protein: z.number().describe("Protein in grams"),
  carbs: z.number().describe("Carbohydrates in grams"),
  fats: z.number().describe("Fats in grams"),
  sugars: z.number().describe("Sugars in grams"),
});

export default function ShowAI() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addFoodLog } = useUser();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedFood, setParsedFood] = useState<z.infer<typeof foodSchema> | null>(null);
  
  const selectedDate = params.date ? new Date(params.date as string) : undefined;

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Camera permission is required to take photos.");
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images" as any,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      alert("Failed to take photo. Please try again.");
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images" as any,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo. Please try again.");
    }
  };

  const analyzeImage = async (uri: string) => {
    setIsProcessing(true);
    try {
      console.log("Starting image analysis for URI:", uri);
      
      let base64Image: string;
      
      if (Platform.OS === "web") {
        base64Image = uri;
      } else {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64",
        });
        base64Image = `data:image/jpeg;base64,${base64}`;
      }
      
      console.log("Image converted to base64, sending to AI...");
      
      const result = await generateObject({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                image: base64Image,
              },
              {
                type: "text",
                text: "Analyze this food image and provide accurate nutritional information. Estimate the portion size and calculate total calories and macros. Be as accurate as possible based on what you can see.",
              },
            ],
          },
        ],
        schema: foodSchema,
      });

      console.log("AI parsed food from image:", result);
      setParsedFood(result);
    } catch (error: any) {
      console.error("Error analyzing image:", error);
      console.error("Error details:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });
      
      const errorMessage = error?.message?.includes("JSON Parse") 
        ? "Failed to process the image. Please try a clearer photo."
        : "Failed to analyze image. Please try again.";
      
      alert(errorMessage);
      setImageUri(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!parsedFood) return;

    await addFoodLog(parsedFood, selectedDate);
    router.back();
  };

  const handleRetake = () => {
    setImageUri(null);
    setParsedFood(null);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Show AI</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          {!imageUri ? (
            <View style={styles.emptyState}>
              <Text style={styles.instruction}>
                Take a photo or upload an image of your food
              </Text>
              <Text style={styles.examples}>
                Our AI will analyze the image and estimate calories and macros
              </Text>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={handleTakePhoto}
                >
                  <Camera color="#fff" size={32} />
                  <Text style={styles.actionButtonText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleUploadPhoto}
                >
                  <Upload color="#fff" size={32} />
                  <Text style={styles.actionButtonText}>Upload Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />

              {isProcessing ? (
                <View style={styles.processingState}>
                  <ActivityIndicator color="#fff" size="large" />
                  <Text style={styles.processingText}>Analyzing image...</Text>
                </View>
              ) : parsedFood ? (
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
                    <TouchableOpacity style={styles.secondaryButton} onPress={handleRetake}>
                      <Text style={styles.secondaryButtonText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmButton} onPress={handleSave}>
                      <Text style={styles.confirmButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}
            </>
          )}
        </ScrollView>
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  instruction: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  examples: {
    fontSize: 14,
    color: "#666",
    marginBottom: 48,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  actionButtons: {
    width: "100%",
    gap: 16,
  },
  cameraButton: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: "center",
    gap: 12,
  },
  uploadButton: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: "center",
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  imagePreview: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
    marginBottom: 24,
  },
  processingState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 16,
  },
  processingText: {
    fontSize: 16,
    color: "#999",
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
