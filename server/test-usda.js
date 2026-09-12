import dotenv from "dotenv";
dotenv.config();

async function lookupNutrition(ingredientName) {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${process.env.USDA_API_KEY}&query=${encodeURIComponent("raw " + ingredientName)}&pageSize=3&dataType=Foundation,SR%20Legacy`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.foods || data.foods.length === 0) {
    return null;
  }

  // Pick the first result that actually has usable nutrient data
  const food = data.foods.find((f) =>
    f.foodNutrients.some((n) => n.nutrientName === "Energy")
  ) || data.foods[0];

  const nutrients = {};

  for (const n of food.foodNutrients) {
    if (n.nutrientName === "Energy" && n.unitName === "KCAL") nutrients.calories = n.value;
    if (n.nutrientName === "Protein") nutrients.protein = n.value;
    if (n.nutrientName === "Carbohydrate, by difference") nutrients.carbs = n.value;
    if (n.nutrientName === "Total lipid (fat)") nutrients.fat = n.value;
  }

  return {
    matchedName: food.description,
    per100g: nutrients,
  };
}

const testIngredients = ["chicken breast", "brown rice", "broccoli"];

for (const ingredient of testIngredients) {
  const result = await lookupNutrition(ingredient);
  console.log(`\n"${ingredient}" matched to:`, result?.matchedName);
  console.log("Per 100g:", result?.per100g);
}