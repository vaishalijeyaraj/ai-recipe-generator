import { useState } from 'react';
import { Recipe, RecipePreferences } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';

export interface FeasibilityConflict {
  ingredient: string;
  issue: string;
  why_it_matters: string;
  suggestion: string;
  why_the_swap_works: string;
}

export interface FeasibilityResult {
  feasible: boolean;
  conflicts: FeasibilityConflict[];
}

export function useRecipeGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<FeasibilityResult | null>(null);
  const [pendingPreferences, setPendingPreferences] = useState<RecipePreferences | null>(null);
  const { toast } = useToast();

  const callGenerateEndpoint = async (preferences: RecipePreferences) => {
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
      title: 'Recipe generated!',
      description: `Your ${data.recipe.title} is ready!`,
    });
  };

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
    setConflict(null);

    try {
      try {
        const feasibilityResponse = await fetch(`${import.meta.env.VITE_API_URL}/check-feasibility`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ingredients: preferences.ingredients,
            dietaryPreference: preferences.dietaryPreference,
          }),
        });

        const feasibilityData: FeasibilityResult = await feasibilityResponse.json();

        if (feasibilityResponse.ok && !feasibilityData.feasible) {
          setConflict(feasibilityData);
          setPendingPreferences(preferences);
          setIsLoading(false);
          return;
        }
      } catch (feasibilityErr) {
        console.warn('Feasibility check failed, proceeding anyway:', feasibilityErr);
      }

      await callGenerateEndpoint(preferences);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate recipe';
      setError(message);
      toast({ title: 'Generation failed', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const acceptSwap = async () => {
    if (!pendingPreferences || !conflict) return;

    const updatedIngredients = pendingPreferences.ingredients.map((ing) => {
      const match = conflict.conflicts.find(
        (c) => c.ingredient.toLowerCase() === ing.toLowerCase()
      );
      return match ? match.suggestion : ing;
    });

    const updatedPreferences = { ...pendingPreferences, ingredients: updatedIngredients };
    setConflict(null);
    setPendingPreferences(null);
    setIsLoading(true);
    try {
      await callGenerateEndpoint(updatedPreferences);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate recipe';
      setError(message);
      toast({ title: 'Generation failed', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const dismissConflict = () => {
    setConflict(null);
    setPendingPreferences(null);
    toast({
      title: 'Pick a different diet, or edit your ingredients',
      description: 'Change your dietary preference above, then generate again.',
    });
  };

  const clearRecipe = () => {
    setRecipe(null);
    setError(null);
    setConflict(null);
    setPendingPreferences(null);
  };

  return {
    isLoading,
    recipe,
    error,
    conflict,
    generateRecipe,
    acceptSwap,
    dismissConflict,
    clearRecipe,
  };
}