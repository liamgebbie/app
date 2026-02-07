import { ScanBarcode, ChevronRight, Info, Clock, Flame, ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react-native";
import { useState, useMemo, useEffect } from "react";
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
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  reasoning: string;
  instructions: string[];
}

interface MealPreferences {
  liked: string[];
  disliked: string[];
}

const MEAL_PREFERENCES_KEY = "meal_preferences";

export default function Eat() {
  const { profile } = useUser();
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [mealPreferences, setMealPreferences] = useState<MealPreferences>({ liked: [], disliked: [] });
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMealPreferences();
  }, []);

  const loadMealPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(MEAL_PREFERENCES_KEY);
      if (stored) {
        setMealPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading meal preferences:", error);
    }
  };

  const saveMealPreferences = async (prefs: MealPreferences) => {
    try {
      await AsyncStorage.setItem(MEAL_PREFERENCES_KEY, JSON.stringify(prefs));
      setMealPreferences(prefs);
    } catch (error) {
      console.error("Error saving meal preferences:", error);
    }
  };

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
        id: "greek-yogurt-bowl",
        name: "Greek Yogurt Bowl",
        calories: Math.round(targetCals * 0.95),
        protein: Math.round(targetProtein * 1.1),
        carbs: Math.round(targetCarbs * 0.85),
        fats: Math.round(targetFats * 0.9),
        reasoning: "High in protein to keep you satisfied throughout the morning. Greek yogurt provides probiotics for gut health, while berries offer antioxidants.",
        instructions: [
          "Add 200g plain Greek yogurt to a bowl",
          "Top with 50g mixed berries (blueberries, strawberries, raspberries)",
          "Sprinkle 30g granola or nuts for crunch",
          "Drizzle with 1 tsp honey (optional)",
          "Add a sprinkle of chia seeds for extra fiber",
        ],
      },
      {
        id: "oatmeal-nuts",
        name: "Oatmeal with Nuts",
        calories: Math.round(targetCals * 0.92),
        protein: Math.round(targetProtein * 0.8),
        carbs: Math.round(targetCarbs * 1.1),
        fats: Math.round(targetFats * 0.95),
        reasoning: "Complex carbohydrates provide sustained energy. Oats contain beta-glucan for heart health, and nuts add healthy fats and minerals.",
        instructions: [
          "Bring 1 cup water or milk to a boil",
          "Add 50g rolled oats and reduce heat",
          "Simmer for 5 minutes, stirring occasionally",
          "Top with 20g mixed nuts (almonds, walnuts)",
          "Add sliced banana and a dash of cinnamon",
        ],
      },
      {
        id: "egg-white-scramble",
        name: "Egg White Scramble",
        calories: Math.round(targetCals * 0.88),
        protein: Math.round(targetProtein * 1.2),
        carbs: Math.round(targetCarbs * 0.6),
        fats: Math.round(targetFats * 0.7),
        reasoning: "Lean protein source that's easy to digest. Vegetables add fiber and vitamins without excessive calories, perfect for metabolism activation.",
        instructions: [
          "Heat 1 tsp olive oil in a non-stick pan over medium heat",
          "Whisk 4-5 egg whites with salt and pepper",
          "Add diced vegetables (bell peppers, spinach, tomatoes)",
          "Pour eggs into pan and gently scramble for 3-4 minutes",
          "Serve with whole grain toast",
        ],
      },
    ];

    const lunch: MealSuggestion[] = [
      {
        id: "grilled-chicken-salad",
        name: "Grilled Chicken Salad",
        calories: Math.round(targetCals * 1.0),
        protein: Math.round(targetProtein * 1.15),
        carbs: Math.round(targetCarbs * 0.7),
        fats: Math.round(targetFats * 1.0),
        reasoning: "Balanced meal with lean protein and abundant vegetables. Olive oil dressing provides healthy monounsaturated fats for nutrient absorption.",
        instructions: [
          "Season 150g chicken breast with herbs and spices",
          "Grill chicken for 6-7 minutes per side until cooked through",
          "Mix salad greens, cherry tomatoes, cucumber, and red onion",
          "Slice grilled chicken and place on top of salad",
          "Dress with olive oil, lemon juice, salt, and pepper",
        ],
      },
      {
        id: "quinoa-buddha-bowl",
        name: "Quinoa Buddha Bowl",
        calories: Math.round(targetCals * 0.98),
        protein: Math.round(targetProtein * 0.9),
        carbs: Math.round(targetCarbs * 1.05),
        fats: Math.round(targetFats * 0.95),
        reasoning: "Complete plant-based protein with all essential amino acids. Diverse vegetables ensure a wide range of micronutrients and phytonutrients.",
        instructions: [
          "Cook 75g quinoa according to package instructions",
          "Roast mixed vegetables (sweet potato, broccoli, chickpeas) at 200°C for 25 minutes",
          "Arrange quinoa in a bowl with roasted vegetables",
          "Add avocado slices and fresh greens",
          "Drizzle with tahini dressing (tahini, lemon, garlic, water)",
        ],
      },
      {
        id: "salmon-brown-rice",
        name: "Salmon with Brown Rice",
        calories: Math.round(targetCals * 1.05),
        protein: Math.round(targetProtein * 1.1),
        carbs: Math.round(targetCarbs * 0.95),
        fats: Math.round(targetFats * 1.2),
        reasoning: "Omega-3 fatty acids support brain function and reduce inflammation. Brown rice provides sustained energy for afternoon productivity.",
        instructions: [
          "Cook 75g brown rice according to package instructions",
          "Season 150g salmon fillet with salt, pepper, and lemon",
          "Bake salmon at 180°C for 12-15 minutes",
          "Steam or sauté green vegetables (broccoli, asparagus)",
          "Serve salmon on rice with vegetables on the side",
        ],
      },
    ];

    const lightMeal: MealSuggestion[] = [
      {
        id: "hummus-vegetables",
        name: "Hummus with Vegetables",
        calories: Math.round(targetCals * 0.5),
        protein: Math.round(targetProtein * 0.4),
        carbs: Math.round(targetCarbs * 0.6),
        fats: Math.round(targetFats * 0.5),
        reasoning: "Light yet satisfying snack that won't interfere with dinner. Chickpeas provide plant protein and fiber to bridge the afternoon gap.",
        instructions: [
          "Arrange 100g store-bought or homemade hummus in a bowl",
          "Wash and cut raw vegetables (carrots, celery, bell peppers, cucumber)",
          "Arrange vegetables around hummus for dipping",
          "Optional: sprinkle hummus with paprika and olive oil",
          "Add whole grain crackers if desired",
        ],
      },
      {
        id: "apple-almond-butter",
        name: "Apple with Almond Butter",
        calories: Math.round(targetCals * 0.45),
        protein: Math.round(targetProtein * 0.35),
        carbs: Math.round(targetCarbs * 0.65),
        fats: Math.round(targetFats * 0.55),
        reasoning: "Natural sugars from fruit provide quick energy, while almond butter adds protein and healthy fats for sustained satisfaction.",
        instructions: [
          "Wash and core one medium apple",
          "Slice apple into 8-10 wedges",
          "Place 2 tbsp almond butter in a small bowl",
          "Dip apple slices in almond butter",
          "Optional: sprinkle with cinnamon",
        ],
      },
      {
        id: "cottage-cheese-berries",
        name: "Cottage Cheese with Berries",
        calories: Math.round(targetCals * 0.48),
        protein: Math.round(targetProtein * 0.65),
        carbs: Math.round(targetCarbs * 0.5),
        fats: Math.round(targetFats * 0.4),
        reasoning: "High protein content helps preserve muscle mass between meals. Berries add antioxidants with minimal sugar impact.",
        instructions: [
          "Scoop 150g low-fat cottage cheese into a bowl",
          "Wash 75g mixed berries",
          "Top cottage cheese with berries",
          "Optional: add a drizzle of honey or maple syrup",
          "Sprinkle with chopped mint leaves for freshness",
        ],
      },
    ];

    const dinner: MealSuggestion[] = [
      {
        id: "grilled-fish-vegetables",
        name: "Grilled Fish with Vegetables",
        calories: Math.round(targetCals * 1.0),
        protein: Math.round(targetProtein * 1.2),
        carbs: Math.round(targetCarbs * 0.6),
        fats: Math.round(targetFats * 0.9),
        reasoning: "Light yet nutritious evening meal. Fish is easily digestible and won't disrupt sleep, while vegetables provide fiber for satiety.",
        instructions: [
          "Season 150g white fish (cod, haddock) with herbs and lemon",
          "Grill or bake fish at 190°C for 10-12 minutes",
          "Prepare mixed vegetables (zucchini, bell peppers, asparagus)",
          "Grill vegetables alongside fish or steam them",
          "Serve with a small portion of quinoa or cauliflower rice",
        ],
      },
      {
        id: "turkey-sweet-potato",
        name: "Turkey with Sweet Potato",
        calories: Math.round(targetCals * 1.02),
        protein: Math.round(targetProtein * 1.15),
        carbs: Math.round(targetCarbs * 0.95),
        fats: Math.round(targetFats * 0.75),
        reasoning: "Lean protein supports overnight muscle recovery. Sweet potatoes offer complex carbs and vitamin A for immune function.",
        instructions: [
          "Preheat oven to 200°C",
          "Cube one medium sweet potato and toss with olive oil",
          "Roast sweet potato for 25-30 minutes until tender",
          "Season 150g turkey breast and grill for 5-6 minutes per side",
          "Serve with steamed green beans or broccoli",
        ],
      },
      {
        id: "tofu-stir-fry",
        name: "Tofu Stir-Fry",
        calories: Math.round(targetCals * 0.96),
        protein: Math.round(targetProtein * 0.95),
        carbs: Math.round(targetCarbs * 0.85),
        fats: Math.round(targetFats * 0.9),
        reasoning: "Plant-based protein that's gentle on digestion. Variety of vegetables ensures comprehensive nutrient intake before rest period.",
        instructions: [
          "Press and cube 200g firm tofu, then pan-fry until golden",
          "Heat wok or large pan with 1 tbsp sesame oil",
          "Stir-fry mixed vegetables (bok choy, bell peppers, snap peas) for 3-4 minutes",
          "Add tofu back to pan with soy sauce and garlic",
          "Serve over cauliflower rice or brown rice noodles",
        ],
      },
    ];

    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10.5) return breakfast;
    if (hour >= 10.5 && hour < 15) return lunch;
    if (hour >= 15 && hour < 18) return lightMeal;
    return dinner;
  }, [profile]);

  const handleScan = async () => {
    if (!permission) {
      return;
    }

    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please grant camera permission to scan barcodes."
        );
        return;
      }
    }

    setShowCamera(true);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    console.log("Barcode scanned:", data);
    setShowCamera(false);
    
    const mockProduct: ScannedProduct = {
      name: `Product ${data.slice(0, 10)}`,
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

  const handleLikeMeal = async (mealId: string) => {
    if (feedbackGiven.has(mealId)) return;
    
    const newPreferences = {
      ...mealPreferences,
      liked: [...mealPreferences.liked, mealId],
      disliked: mealPreferences.disliked.filter(id => id !== mealId),
    };
    await saveMealPreferences(newPreferences);
    setFeedbackGiven(new Set([...feedbackGiven, mealId]));
  };

  const handleDislikeMeal = async (mealId: string) => {
    if (feedbackGiven.has(mealId)) return;
    
    const newPreferences = {
      ...mealPreferences,
      disliked: [...mealPreferences.disliked, mealId],
      liked: mealPreferences.liked.filter(id => id !== mealId),
    };
    await saveMealPreferences(newPreferences);
    setFeedbackGiven(new Set([...feedbackGiven, mealId]));
  };

  const toggleMealExpanded = (mealId: string) => {
    const newExpanded = new Set(expandedMeals);
    if (newExpanded.has(mealId)) {
      newExpanded.delete(mealId);
    } else {
      newExpanded.add(mealId);
    }
    setExpandedMeals(newExpanded);
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
          <Text style={styles.title}>Eat</Text>
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
            {mealSuggestions.map((meal) => (
              <View key={meal.id} style={styles.mealCard}>
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

                {expandedMeals.has(meal.id) && (
                  <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsTitle}>How to make it:</Text>
                    {meal.instructions.map((instruction, idx) => (
                      <Text key={idx} style={styles.instructionItem}>
                        {idx + 1}. {instruction}
                      </Text>
                    ))}
                  </View>
                )}

                <View style={styles.mealActions}>
                  <TouchableOpacity
                    style={styles.viewMoreButton}
                    onPress={() => toggleMealExpanded(meal.id)}
                  >
                    <Text style={styles.viewMoreText}>
                      {expandedMeals.has(meal.id) ? "Show Less" : "View More"}
                    </Text>
                    <ChevronDown
                      color="#999"
                      size={16}
                      style={{
                        transform: [{ rotate: expandedMeals.has(meal.id) ? "180deg" : "0deg" }],
                      }}
                    />
                  </TouchableOpacity>

                  <View style={styles.feedbackButtons}>
                    <TouchableOpacity
                      style={[
                        styles.feedbackButton,
                        mealPreferences.liked.includes(meal.id) && styles.feedbackButtonActive,
                      ]}
                      onPress={() => handleLikeMeal(meal.id)}
                      disabled={feedbackGiven.has(meal.id)}
                    >
                      <ThumbsUp
                        color={mealPreferences.liked.includes(meal.id) ? "#fff" : "#666"}
                        size={18}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.feedbackButton,
                        mealPreferences.disliked.includes(meal.id) && styles.feedbackButtonActive,
                      ]}
                      onPress={() => handleDislikeMeal(meal.id)}
                      disabled={feedbackGiven.has(meal.id)}
                    >
                      <ThumbsDown
                        color={mealPreferences.disliked.includes(meal.id) ? "#fff" : "#666"}
                        size={18}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
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

      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCamera(false)}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: [
                "ean13",
                "ean8",
                "upc_a",
                "upc_e",
                "code128",
                "code39",
                "qr",
              ],
            }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.cameraCloseButton}
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.cameraCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.scanFrame} />
            <Text style={styles.scanInstructions}>
              Position barcode within the frame
            </Text>
          </View>
        </View>
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
  instructionsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 13,
    lineHeight: 20,
    color: "#ccc",
    marginBottom: 8,
  },
  mealActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
  },
  viewMoreText: {
    fontSize: 13,
    color: "#999",
    fontWeight: "500",
  },
  feedbackButtons: {
    flexDirection: "row",
    gap: 12,
  },
  feedbackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackButtonActive: {
    backgroundColor: "#4a4a4a",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    alignItems: "center",
  },
  cameraHeader: {
    width: "100%",
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: "flex-end",
  },
  cameraCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 8,
  },
  cameraCloseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  scanFrame: {
    width: 280,
    height: 180,
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  scanInstructions: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 40,
    paddingBottom: 60,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 80,
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
