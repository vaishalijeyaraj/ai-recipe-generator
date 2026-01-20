import { useState } from 'react';
import { Sparkles, ChefHat, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IngredientInput } from '@/components/IngredientInput';
import { PreferenceSelectors } from '@/components/PreferenceSelectors';
import { RecipeCard } from '@/components/RecipeCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useRecipeGenerator } from '@/hooks/useRecipeGenerator';

const Index = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [dietaryPreference, setDietaryPreference] = useState('none');
  const [cuisineType, setCuisineType] = useState('any');
  const [servings, setServings] = useState(2);
  const [cookingTime, setCookingTime] = useState('any');

  const { isLoading, recipe, generateRecipe, clearRecipe } = useRecipeGenerator();

  const handleAddIngredient = (ingredient: string) => {
    setIngredients((prev) => [...prev, ingredient]);
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients((prev) => prev.filter((i) => i !== ingredient));
  };

  const handleGenerate = () => {
    generateRecipe({
      ingredients,
      dietaryPreference,
      cuisineType,
      servings,
      cookingTime,
    });
  };

  const handleStartOver = () => {
    setIngredients([]);
    setDietaryPreference('none');
    setCuisineType('any');
    setServings(2);
    setCookingTime('any');
    clearRecipe();
  };

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <header className="relative overflow-hidden pt-12 pb-8 px-4">
        {/* Background decorations */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="relative max-w-4xl mx-auto text-center">
          {/* Logo/Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-bg glow-primary mb-6">
            <ChefHat className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">Recipe Magic</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Turn your ingredients into delicious meals with AI-powered recipe generation
          </p>

          {/* Floating food icons */}
          <div className="flex justify-center gap-6 mt-8 text-4xl">
            <span className="animate-float" style={{ animationDelay: '0s' }}>🥗</span>
            <span className="animate-float" style={{ animationDelay: '0.5s' }}>🍝</span>
            <span className="animate-float" style={{ animationDelay: '1s' }}>🍜</span>
            <span className="animate-float" style={{ animationDelay: '1.5s' }}>🥘</span>
            <span className="animate-float" style={{ animationDelay: '2s' }}>🍲</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 pb-16">
        {isLoading ? (
          <Card className="glass-card border-border/30">
            <CardContent className="p-0">
              <LoadingSpinner />
            </CardContent>
          </Card>
        ) : recipe ? (
          <RecipeCard
            recipe={recipe}
            onGenerateAnother={handleGenerate}
            onStartOver={handleStartOver}
          />
        ) : (
          <Card className="glass-card glow-primary border-border/30">
            <CardContent className="p-6 md:p-8 space-y-8">
              {/* Ingredient input */}
              <IngredientInput
                ingredients={ingredients}
                onAdd={handleAddIngredient}
                onRemove={handleRemoveIngredient}
              />

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border/50" />
                <Utensils className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 h-px bg-border/50" />
              </div>

              {/* Preferences */}
              <PreferenceSelectors
                dietaryPreference={dietaryPreference}
                cuisineType={cuisineType}
                servings={servings}
                cookingTime={cookingTime}
                onDietaryChange={setDietaryPreference}
                onCuisineChange={setCuisineType}
                onServingsChange={setServings}
                onCookingTimeChange={setCookingTime}
              />

              {/* Generate button */}
              <Button
                onClick={handleGenerate}
                disabled={ingredients.length < 2}
                className="w-full h-14 text-lg font-semibold gradient-bg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-primary"
              >
                <Sparkles className="mr-2 h-6 w-6" />
                Generate Recipe
              </Button>

              {ingredients.length < 2 && ingredients.length > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  Add {2 - ingredients.length} more ingredient{2 - ingredients.length > 1 ? 's' : ''} to generate
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-muted-foreground">
        <p>Powered by AI • Made with Lovable</p>
      </footer>
    </div>
  );
};

export default Index;
