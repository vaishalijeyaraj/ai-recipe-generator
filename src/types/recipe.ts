export interface RecipePreferences {
  ingredients: string[];
  dietaryPreference: string;
  cuisineType: string;
  servings: number;
  cookingTime: string;
}

export interface Recipe {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: {
    item: string;
    amount: string;
    checked?: boolean;
  }[];
  instructions: {
    step: number;
    text: string;
  }[];
  tips: string[];
  nutritionInfo?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
}
