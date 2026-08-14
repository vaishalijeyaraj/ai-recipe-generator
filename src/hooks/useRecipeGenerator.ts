import { useState } from 'react';
import { Recipe, RecipePreferences } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';

export function useRecipeGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateRecipe = async (preferences: RecipePreferences) => {
    if (preferences.ingredients.length < 2) {
      toast({
        title: 'Not enough ingredients',
        description: 'Please add at least 2 ingredients to generate a recipe.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/generate-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error');
      }

      if (!data?.recipe) {
        throw new Error('No recipe returned from the AI');
      }

      setRecipe(data.recipe);
      toast({
        title: 'Recipe generated! 🎉',
        description: `Your ${data.recipe.title} is ready!`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate recipe';
      setError(message);
      toast({
        title: 'Generation failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearRecipe = () => {
    setRecipe(null);
    setError(null);
  };

  return {
    isLoading,
    recipe,
    error,
    generateRecipe,
    clearRecipe,
  };
}
