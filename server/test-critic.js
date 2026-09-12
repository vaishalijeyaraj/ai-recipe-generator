import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

// Deliberately broken recipe: says it's quick, but instructions clearly take way longer
const obviouslyBadRecipe = {
  title: "Instant Slow-Roasted Pork Shoulder",
  totalTime: "20 mins",
  servings: 2,
  ingredients: [{ item: "pork shoulder", amount: "5 lbs" }],
  instructions: [
    { step: 1, text: "Season the pork shoulder and place in a 275°F oven." },
    { step: 2, text: "Roast for 8 hours until fork-tender and internal temp reaches 205°F." },
  ],
};

const preferences = { servings: 2, ingredients: ["pork shoulder"], cookingTime: "quick" };

const prompt = `You are a meticulous head chef reviewing a recipe for accuracy before it goes out to a customer. Check this recipe against the requirements it was supposed to meet.

Recipe: ${JSON.stringify(obviouslyBadRecipe)}

Requirements:
- Should serve ${preferences.servings} people
- Should primarily use these ingredients: ${preferences.ingredients.join(", ")}
- Cooking time requirement: under 30 minutes total

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

const result = await model.generateContent(prompt);
let text = result.response.text().trim();
text = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*$/g, "").trim();

console.log("Critic's verdict:");
console.log(text);