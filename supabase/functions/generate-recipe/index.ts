import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecipeRequest {
  ingredients: string[];
  dietaryPreference: string;
  cuisineType: string;
  servings: number;
  cookingTime: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, dietaryPreference, cuisineType, servings, cookingTime }: RecipeRequest = await req.json();

    console.log("Recipe request:", { ingredients, dietaryPreference, cuisineType, servings, cookingTime });

    if (!ingredients || ingredients.length < 2) {
      return new Response(
        JSON.stringify({ error: "Please provide at least 2 ingredients" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the prompt
    const dietaryNote = dietaryPreference !== 'none' ? `The recipe MUST be ${dietaryPreference}.` : '';
    const cuisineNote = cuisineType !== 'any' ? `Make it ${cuisineType} cuisine.` : '';
    const timeNote = cookingTime === 'quick' ? 'Total cooking time should be under 30 minutes.' :
                     cookingTime === 'medium' ? 'Total cooking time should be between 30-60 minutes.' :
                     cookingTime === 'long' ? 'Total cooking time can be over 60 minutes for a more elaborate dish.' : '';

    const systemPrompt = `You are a world-class chef and recipe creator. Create delicious, practical recipes based on available ingredients. Your recipes should be clear, well-structured, and achievable for home cooks.

Always respond with valid JSON matching this exact structure:
{
  "title": "Recipe Name",
  "description": "A brief, appetizing description of the dish",
  "prepTime": "15 mins",
  "cookTime": "30 mins",
  "totalTime": "45 mins",
  "servings": 4,
  "difficulty": "Easy" | "Medium" | "Hard",
  "ingredients": [
    { "item": "ingredient name", "amount": "quantity with unit" }
  ],
  "instructions": [
    { "step": 1, "text": "Clear instruction text" }
  ],
  "tips": ["Helpful tip 1", "Helpful tip 2"],
  "nutritionInfo": {
    "calories": "350",
    "protein": "25g",
    "carbs": "30g",
    "fat": "12g"
  }
}`;

    const userPrompt = `Create a recipe using these main ingredients: ${ingredients.join(', ')}.

Requirements:
- Serves ${servings} ${servings === 1 ? 'person' : 'people'}
${dietaryNote}
${cuisineNote}
${timeNote}

You may add common pantry staples (salt, pepper, oil, basic spices) but the dish should primarily feature the provided ingredients. Make the recipe creative but practical.`;

    console.log("Calling AI gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to generate recipe. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    console.log("AI response received");

    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Extract JSON from the response (handle markdown code blocks)
    let jsonString = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim();
    }

    // Parse and validate the recipe
    const recipe = JSON.parse(jsonString);

    // Basic validation
    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      throw new Error("Invalid recipe structure");
    }

    console.log("Recipe generated successfully:", recipe.title);

    return new Response(
      JSON.stringify({ recipe }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-recipe:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
