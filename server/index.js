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

  const prompt = `You are a world-class chef. Create a recipe using these main ingredients: ${ingredients.join(", ")}.

Requirements:
- Serves ${servings} ${servings === 1 ? "person" : "people"}
${dietaryNote}
${cuisineNote}
${timeNote}

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
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*$/g, "").trim();

    const recipe = JSON.parse(text);

    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      throw new Error("Invalid recipe structure returned by model");
    }

    res.json({ recipe });
  } catch (err) {
    console.error("Error generating recipe:", err.message);
    res.status(500).json({ error: err.message || "Failed to generate recipe" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Recipe server running on http://localhost:${PORT}`);
});