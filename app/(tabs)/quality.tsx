import { useRouter } from "expo-router";
import { ScanBarcode, ChevronRight, Info, Clock, Flame } from "lucide-react-native";
import { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/contexts/UserContext";

interface ScannedProduct {
  name: string;
  score: "Excellent" | "Good" | "Moderate" | "Poor";
  ingredients: {
    preservatives: string[];
    emulsifiers: string[];
    sweeteners: string[];
    additives: string[];
  };
  concerns: {
    name: string;
    description: string;
    reason: string;
  }[];
  alternatives: {
    name: string;
    benefit: string;
  }[];
}

interface MealSuggestion {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  reasoning: string;
}

export default function Quality() {
  const { profile } = useUser();
  const router = useRouter();
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);

  const currentMealType = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10.5) return "Breakfast";
    if (hour >= 10.5 && hour < 15) return "Lunch";
    if (hour >= 15 && hour < 18) return "Light Meal";
    return "Dinner";
  }, []);

  const mealSuggestions = useMemo<MealSuggestion[]>(() => {
    if (!profile) return [];

    const targetCals = Math.round(profile.targetCalories / 3);
    const targetProtein = Math.round(profile.targetProtein / 3);
    const targetCarbs = Math.round(profile.targetCarbs / 3);
    const targetFats = Math.round(profile.targetFats / 3);

    const breakfast: MealSuggestion[] = [
      {
        name: "Greek Yogurt Bowl",
        calories: Math.round(targetCals * 0.95),
        protein: Math.round(targetProtein * 1.1),
        carbs: Math.round(targetCarbs * 0.85),
        fats: Math.round(targetFats * 0.9),
        reasoning: "High in protein to keep you satisfied throughout the morning. Greek yogurt provides probiotics for gut health, while berries offer antioxidants.",
      },
      {
        name: "Oatmeal with Nuts",
        calories: Math.round(targetCals * 0.92),
        protein: Math.round(targetProtein * 0.8),
        carbs: Math.round(targetCarbs * 1.1),
        fats: Math.round(targetFats * 0.95),
        reasoning: "Complex carbohydrates provide sustained energy. Oats contain beta-glucan for heart health, and nuts add healthy fats and minerals.",
      },
      {
        name: "Egg White Scramble",
        calories: Math.round(targetCals * 0.88),
        protein: Math.round(targetProtein * 1.2),
        carbs: Math.round(targetCarbs * 0.6),
        fats: Math.round(targetFats * 0.7),
        reasoning: "Lean protein source that's easy to digest. Vegetables add fiber and vitamins without excessive calories, perfect for metabolism activation.",
      },
    ];

    const lunch: MealSuggestion[] = [
      {
        name: "Grilled Chicken Salad",
        calories: Math.round(targetCals * 1.0),
        protein: Math.round(targetProtein * 1.15),
        carbs: Math.round(targetCarbs * 0.7),
        fats: Math.round(targetFats * 1.0),
        reasoning: "Balanced meal with lean protein and abundant vegetables. Olive oil dressing provides healthy monounsaturated fats for nutrient absorption.",
      },
      {
        name: "Quinoa Buddha Bowl",
        calories: Math.round(targetCals * 0.98),
        protein: Math.round(targetProtein * 0.9),
        carbs: Math.round(targetCarbs * 1.05),
        fats: Math.round(targetFats * 0.95),
        reasoning: "Complete plant-based protein with all essential amino acids. Diverse vegetables ensure a wide range of micronutrients and phytonutrients.",
      },
      {
        name: "Salmon with Brown Rice",
        calories: Math.round(targetCals * 1.05),
        protein: Math.round(targetProtein * 1.1),
        carbs: Math.round(targetCarbs * 0.95),
        fats: Math.round(targetFats * 1.2),
        reasoning: "Omega-3 fatty acids support brain function and reduce inflammation. Brown rice provides sustained energy for afternoon productivity.",
      },
    ];

    const lightMeal: MealSuggestion[] = [
      {
        name: "Hummus with Vegetables",
        calories: Math.round(targetCals * 0.5),
        protein: Math.round(targetProtein * 0.4),
        carbs: Math.round(targetCarbs * 0.6),
        fats: Math.round(targetFats * 0.5),
        reasoning: "Light yet satisfying snack that won't interfere with dinner. Chickpeas provide plant protein and fiber to bridge the afternoon gap.",
      },
      {
        name: "Apple with Almond Butter",
        calories: Math.round(targetCals * 0.45),
        protein: Math.round(targetProtein * 0.35),
        carbs: Math.round(targetCarbs * 0.65),
        fats: Math.round(targetFats * 0.55),
        reasoning: "Natural sugars from fruit provide quick energy, while almond butter adds protein and healthy fats for sustained satisfaction.",
      },
      {
        name: "Cottage Cheese with Berries",
        calories: Math.round(targetCals * 0.48),
        protein: Math.round(targetProtein * 0.65),
        carbs: Math.round(targetCarbs * 0.5),
        fats: Math.round(targetFats * 0.4),
        reasoning: "High protein content helps preserve muscle mass between meals. Berries add antioxidants with minimal sugar impact.",
      },
    ];

    const dinner: MealSuggestion[] = [
      {
        name: "Grilled Fish with Vegetables",
        calories: Math.round(targetCals * 1.0),
        protein: Math.round(targetProtein * 1.2),
        carbs: Math.round(targetCarbs * 0.6),
        fats: Math.round(targetFats * 0.9),
        reasoning: "Light yet nutritious evening meal. Fish is easily digestible and won't disrupt sleep, while vegetables provide fiber for satiety.",
      },
      {
        name: "Turkey with Sweet Potato",
        calories: Math.round(targetCals * 1.02),
        protein: Math.round(targetProtein * 1.15),
        carbs: Math.round(targetCarbs * 0.95),
        fats: Math.round(targetFats * 0.75),
        reasoning: "Lean protein supports overnight muscle recovery. Sweet potatoes offer complex carbs and vitamin A for immune function.",
      },
      {
        name: "Tofu Stir-Fry",
        calories: Math.round(targetCals * 0.96),
        protein: Math.round(targetProtein * 0.95),
        carbs: Math.round(targetCarbs * 0.85),
        fats: Math.round(targetFats * 0.9),
        reasoning: "Plant-based protein that's gentle on digestion. Variety of vegetables ensures comprehensive nutrient intake before rest period.",
      },
    ];

    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10.5) return breakfast;
    if (hour >= 10.5 && hour < 15) return lunch;
    if (hour >= 15 && hour < 18) return lightMeal;
    return dinner;
  }, [profile, currentMealType]);

  const handleScan = () => {
    const mockProduct: ScannedProduct = {
      name: "Sample Protein Bar",
      score: "Moderate",
      ingredients: {
        preservatives: ["Sodium Benzoate", "Potassium Sorbate"],
        emulsifiers: ["Soy Lecithin", "Mono- and Diglycerides"],
        sweeteners: ["Sucralose", "Acesulfame Potassium"],
        additives: ["Artificial Vanilla Flavor", "Carrageenan"],
      },
      concerns: [
        {
          name: "Sodium Benzoate",
          description: "A synthetic preservative commonly used to prevent mold and bacteria growth.",
          reason: "Studies suggest it may convert to benzene (a carcinogen) when combined with vitamin C. Regular consumption may trigger inflammation in some individuals.",
        },
        {
          name: "Sucralose",
          description: "An artificial sweetener that's 600 times sweeter than sugar.",
          reason: "May alter gut microbiome composition and glucose metabolism over time. Some research links it to increased insulin resistance.",
        },
        {
          name: "Carrageenan",
          description: "A thickening agent extracted from red seaweed.",
          reason: "Associated with digestive inflammation and may trigger immune responses in sensitive individuals, though food-grade carrageenan is generally recognized as safe.",
        },
      ],
      alternatives: [
        {
          name: "RX Bar",
          benefit: "Made with simple ingredients: dates, egg whites, nuts. No artificial additives or preservatives.",
        },
        {
          name: "Homemade Energy Balls",
          benefit: "Control all ingredients. Use dates for natural sweetness, oats for fiber, and nut butter for protein.",
        },
      ],
    };

    setScannedProduct(mockProduct);
    setShowProductModal(true);
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case "Excellent":
        return "#fff";
      case "Good":
        return "#d1d1d6";
      case "Moderate":
        return "#999";
      case "Poor":
        return "#666";
      default:
        return "#fff";
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Food Quality</Text>
          <Text style={styles.subtitle}>Understand what you&apos;re eating</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
            <View style={styles.scanIconContainer}>
              <ScanBarcode color="#fff" size={28} />
            </View>
            <View style={styles.scanTextContainer}>
              <Text style={styles.scanTitle}>Scan Food</Text>
              <Text style={styles.scanSubtitle}>Analyze ingredients & additives</Text>
            </View>
            <ChevronRight color="#666" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock color="#fff" size={20} />
            <Text style={styles.sectionTitle}>{currentMealType} Ideas</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Personalized for your goals • Based on your targets
          </Text>

          <View style={styles.mealsContainer}>
            {mealSuggestions.map((meal, index) => (
              <View key={index} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <View style={styles.mealCalories}>
                    <Flame color="#fff" size={14} />
                    <Text style={styles.mealCaloriesText}>{meal.calories}</Text>
                  </View>
                </View>

                <View style={styles.macrosRow}>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>Protein</Text>
                    <Text style={styles.macroValue}>{meal.protein}g</Text>
                  </View>
                  <View style={styles.macroDivider} />
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>Carbs</Text>
                    <Text style={styles.macroValue}>{meal.carbs}g</Text>
                  </View>
                  <View style={styles.macroDivider} />
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>Fats</Text>
                    <Text style={styles.macroValue}>{meal.fats}g</Text>
                  </View>
                </View>

                <Text style={styles.mealReasoning}>{meal.reasoning}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProductModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Product Analysis</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowProductModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {scannedProduct && (
              <>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{scannedProduct.name}</Text>
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>Quality Score</Text>
                    <Text
                      style={[
                        styles.scoreValue,
                        { color: getScoreColor(scannedProduct.score) },
                      ]}
                    >
                      {scannedProduct.score}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Ingredients Overview</Text>
                  <View style={styles.ingredientsList}>
                    {scannedProduct.ingredients.preservatives.length > 0 && (
                      <View style={styles.ingredientGroup}>
                        <Text style={styles.ingredientGroupTitle}>Preservatives</Text>
                        {scannedProduct.ingredients.preservatives.map((item, i) => (
                          <Text key={i} style={styles.ingredientItem}>
                            • {item}
                          </Text>
                        ))}
                      </View>
                    )}
                    {scannedProduct.ingredients.emulsifiers.length > 0 && (
                      <View style={styles.ingredientGroup}>
                        <Text style={styles.ingredientGroupTitle}>Emulsifiers</Text>
                        {scannedProduct.ingredients.emulsifiers.map((item, i) => (
                          <Text key={i} style={styles.ingredientItem}>
                            • {item}
                          </Text>
                        ))}
                      </View>
                    )}
                    {scannedProduct.ingredients.sweeteners.length > 0 && (
                      <View style={styles.ingredientGroup}>
                        <Text style={styles.ingredientGroupTitle}>Sweeteners</Text>
                        {scannedProduct.ingredients.sweeteners.map((item, i) => (
                          <Text key={i} style={styles.ingredientItem}>
                            • {item}
                          </Text>
                        ))}
                      </View>
                    )}
                    {scannedProduct.ingredients.additives.length > 0 && (
                      <View style={styles.ingredientGroup}>
                        <Text style={styles.ingredientGroupTitle}>Other Additives</Text>
                        {scannedProduct.ingredients.additives.map((item, i) => (
                          <Text key={i} style={styles.ingredientItem}>
                            • {item}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Points of Interest</Text>
                  <View style={styles.concernsList}>
                    {scannedProduct.concerns.map((concern, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.concernCard}
                        onPress={() =>
                          setSelectedConcern(
                            selectedConcern === concern.name ? null : concern.name
                          )
                        }
                      >
                        <View style={styles.concernHeader}>
                          <Text style={styles.concernName}>{concern.name}</Text>
                          <Info color="#999" size={18} />
                        </View>
                        <Text style={styles.concernDescription}>{concern.description}</Text>
                        {selectedConcern === concern.name && (
                          <View style={styles.concernDetail}>
                            <Text style={styles.concernDetailLabel}>Why it matters:</Text>
                            <Text style={styles.concernDetailText}>{concern.reason}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Better Alternatives</Text>
                  <View style={styles.alternativesList}>
                    {scannedProduct.alternatives.map((alt, index) => (
                      <View key={index} style={styles.alternativeCard}>
                        <Text style={styles.alternativeName}>{alt.name}</Text>
                        <Text style={styles.alternativeBenefit}>{alt.benefit}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    paddingBottom: 32,
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
  section: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  scanIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  scanTextContainer: {
    flex: 1,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  scanSubtitle: {
    fontSize: 14,
    color: "#999",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 20,
  },
  mealsContainer: {
    gap: 16,
  },
  mealCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  mealName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  mealCalories: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mealCaloriesText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  macrosRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
  },
  macroLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  macroValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  macroDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#2a2a2a",
  },
  mealReasoning: {
    fontSize: 13,
    lineHeight: 19,
    color: "#999",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#999",
  },
  modalScroll: {
    flex: 1,
  },
  productHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  productName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scoreLabel: {
    fontSize: 14,
    color: "#999",
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalSection: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  ingredientsList: {
    gap: 16,
  },
  ingredientGroup: {
    gap: 8,
  },
  ingredientGroupTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ingredientItem: {
    fontSize: 15,
    color: "#ccc",
    lineHeight: 22,
  },
  concernsList: {
    gap: 12,
  },
  concernCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  concernHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  concernName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  concernDescription: {
    fontSize: 14,
    color: "#999",
    lineHeight: 20,
  },
  concernDetail: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  concernDetailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ccc",
    marginBottom: 6,
  },
  concernDetailText: {
    fontSize: 14,
    color: "#999",
    lineHeight: 20,
  },
  alternativesList: {
    gap: 12,
  },
  alternativeCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  alternativeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  alternativeBenefit: {
    fontSize: 14,
    color: "#999",
    lineHeight: 20,
  },
});
