import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

async function generateWithRetry(prompt, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      const isLastAttempt = attempt === maxAttempts;
      const isOverloaded = err.message.includes("503") || err.message.includes("overloaded");

      if (isLastAttempt || !isOverloaded) {
        throw err; // give up — either out of attempts, or it's a different kind of error
      }

      const waitTime = attempt * 2000; // 2s, then 4s, then 6s
      console.log(`  Gemini busy, retrying in ${waitTime / 1000}s (attempt ${attempt}/${maxAttempts})...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}



async function checkFeasibility(ingredients, dietaryPreference) {
  if (dietaryPreference === "none") {
    return { feasible: true, conflicts: [] };
  }

  const prompt = `You are a friendly, encouraging chef instructor helping a home cook. Someone wants a recipe using these ingredients: ${ingredients.join(", ")}. They want the recipe to be ${dietaryPreference}.

Check if each ingredient realistically fits a ${dietaryPreference} diet. For any ingredient that does NOT fit, explain it like a chef mentoring a beginner — warm, simple, no jargon, and always include real, approximate numbers to make the difference concrete (like grams of carbs, or whatever is relevant to this diet).


Respond with ONLY valid JSON, no markdown fences, matching exactly this structure:
{
  "feasible": true or false,
  "conflicts": [
    {
      "ingredient": "the ingredient name",
      "issue": "one plain-language sentence on why it doesn't fit, with a real approximate number",
      "why_it_matters": "one plain-language sentence on why this matters for this diet",
      "suggestion": "a specific substitute ingredient",
      "why_the_swap_works": "one plain-language sentence on why the substitute works better, with a real approximate number for comparison"
    }
  ]
}

If every ingredient genuinely fits the diet, return "feasible": true and an empty conflicts array. Only flag real, clear conflicts — don't be overly strict about minor or debatable cases.`;

  const result = await generateWithRetry(prompt);
  let text = result.response.text().trim();
  text = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*$/g, "").trim();

  return JSON.parse(text);
}



async function lookupNutrition(ingredientName) {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${process.env.USDA_API_KEY}&query=${encodeURIComponent("raw " + ingredientName)}&pageSize=3&dataType=Foundation,SR%20Legacy`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.foods || data.foods.length === 0) return null;

    const food = data.foods.find((f) =>
      f.foodNutrients.some((n) => n.nutrientName === "Energy" && n.unitName === "KCAL")
    );
    if (!food) return null;

    const nutrients = {};
    for (const n of food.foodNutrients) {
      if (n.nutrientName === "Energy" && n.unitName === "KCAL") nutrients.calories = n.value;
      if (n.nutrientName === "Protein") nutrients.protein = n.value;
      if (n.nutrientName === "Carbohydrate, by difference") nutrients.carbs = n.value;
      if (n.nutrientName === "Total lipid (fat)") nutrients.fat = n.value;
    }

    return { matchedName: food.description, per100g: nutrients };
  } catch (err) {
    console.warn(`  USDA lookup failed for "${ingredientName}":`, err.message);
    return null;
  }
}

async function lookupAllIngredients(ingredients) {
  const results = await Promise.all(ingredients.map((ing) => lookupNutrition(ing)));

  const found = [];
  ingredients.forEach((ing, i) => {
    if (results[i]) found.push({ ingredient: ing, ...results[i] });
  });

  return found;
}



async function critiqueRecipe(recipe, preferences) {
  const prompt = `You are a meticulous head chef reviewing a recipe for accuracy before it goes out to a customer. Check this recipe against the requirements it was supposed to meet.

Recipe: ${JSON.stringify(recipe)}

Requirements:
- Should serve ${preferences.servings} ${preferences.servings === 1 ? "person" : "people"}
- Should primarily use these ingredients: ${preferences.ingredients.join(", ")}
- Cooking time requirement: ${preferences.cookingTime === "quick" ? "under 30 minutes total" : preferences.cookingTime === "medium" ? "30-60 minutes total" : preferences.cookingTime === "long" ? "over 60 minutes" : "no specific requirement"}

Check specifically for:
1. Do the ingredient amounts realistically make sense for the stated number of servings?
2. Does totalTime realistically match what the instructions describe (add up the actual cooking actions)?
3. Are the ingredients the user provided actually central to the dish, not just a garnish?

Respond with ONLY valid JSON, no markdown fences:
{
  "valid": true or false,
  "issues": ["specific problem 1", "specific problem 2"]
}

Only flag real, clear problems. If the recipe is reasonable, return "valid": true and an empty issues array.`;

  const result = await generateWithRetry(prompt);
  let text = result.response.text().trim();
  text = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*$/g, "").trim();
  return JSON.parse(text);
}

async function generateRecipeWithCritic(basePrompt, preferences, maxAttempts = 2) {
  let currentPrompt = basePrompt;
  let lastRecipe = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await generateWithRetry(currentPrompt);
    let text = result.response.text().trim();
    text = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*$/g, "").trim();
    const recipe = JSON.parse(text);

    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      throw new Error("Invalid recipe structure returned by model");
    }

    lastRecipe = recipe;

    const critique = await critiqueRecipe(recipe, preferences);

    if (critique.valid || attempt === maxAttempts) {
      return { recipe, wasRefined: attempt > 1, finalIssues: critique.valid ? [] : critique.issues };
    }

    console.log(`  Critic found issues on attempt ${attempt}, refining:`, critique.issues);
    currentPrompt = `${basePrompt}\n\nA previous attempt at this recipe had these problems: ${critique.issues.join("; ")}. Please fix these specific issues in your response.`;
  }

  return { recipe: lastRecipe, wasRefined: true, finalIssues: [] };
}


app.post("/check-feasibility", async (req, res) => {
  const { ingredients, dietaryPreference } = req.body;

  if (!ingredients || ingredients.length < 2) {
    return res.status(400).json({ error: "Please provide at least 2 ingredients" });
  }

  try {
    const result = await checkFeasibility(ingredients, dietaryPreference);
    res.json(result);
  } catch (err) {
    console.error("Error checking feasibility:", err.message);
    res.status(500).json({ error: err.message || "Failed to check feasibility" });
  }
});


app.post("/generate-recipe", async (req, res) => {
  const { ingredients, dietaryPreference, cuisineType, servings, cookingTime } = req.body;

  if (!ingredients || ingredients.length < 2) {
    return res.status(400).json({ error: "Please provide at least 2 ingredients" });
  }

  const dietaryNote = dietaryPreference !== "none" ? `The recipe MUST be ${dietaryPreference}.` : "";
  const cuisineNote = cuisineType !== "any" ? `Make it ${cuisineType} cuisine.` : "";
  const timeNote =
    cookingTime === "quick" ? "Total cooking time should be under 30 minutes." :
    cookingTime === "medium" ? "Total cooking time should be between 30-60 minutes." :
    cookingTime === "long" ? "Total cooking time can be over 60 minutes." : "";

  const nutritionData = await lookupAllIngredients(ingredients);
  const nutritionContext = nutritionData.length > 0
    ? `\n\nReal nutrition data per 100g (use this to calculate accurate final nutritionInfo, don't guess):\n${nutritionData.map((n) => `- ${n.ingredient} (matched: ${n.matchedName}): ${n.per100g.calories || "?"} kcal, ${n.per100g.protein || "?"}g protein, ${n.per100g.carbs || "?"}g carbs, ${n.per100g.fat || "?"}g fat`).join("\n")}`
    : "";
    
  const prompt = `You are a world-class chef. Create a recipe using these main ingredients: ${ingredients.join(", ")}.

Requirements:
- Serves ${servings} ${servings === 1 ? "person" : "people"}
${dietaryNote}
${cuisineNote}
${timeNote}
${nutritionContext}

Respond with ONLY valid JSON, no markdown fences, matching exactly this structure:
{
  "title": "Recipe Name",
  "description": "Brief appetizing description",
  "prepTime": "15 mins",
  "cookTime": "30 mins",
  "totalTime": "45 mins",
  "servings": 4,
  "difficulty": "Easy",
  "ingredients": [{ "item": "name", "amount": "quantity with unit" }],
  "instructions": [{ "step": 1, "text": "instruction" }],
  "tips": ["tip 1"],
  "nutritionInfo": { "calories": "350", "protein": "25g", "carbs": "30g", "fat": "12g" }
}`;

  

  try {
    const { recipe, wasRefined, finalIssues } = await generateRecipeWithCritic(prompt, {
      ingredients,
      servings,
      cookingTime,
    });

    res.json({ recipe, wasRefined, finalIssues });
  } catch (err) {
    console.error("Error generating recipe:", err.message);
    res.status(500).json({ error: err.message || "Failed to generate recipe" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Recipe server running on http://localhost:${PORT}`);
});