import { useState } from 'react';
import { Clock, Users, ChefHat, Check, RotateCcw, Sparkles } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface RecipeCardProps {
  recipe: Recipe;
  onGenerateAnother: () => void;
  onStartOver: () => void;
}

export function RecipeCard({ recipe, onGenerateAnother, onStartOver }: RecipeCardProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const difficultyColor = {
    Easy: 'bg-accent/20 text-accent border-accent/30',
    Medium: 'bg-primary/20 text-primary border-primary/30',
    Hard: 'bg-secondary/20 text-secondary border-secondary/30',
  };

  return (
    <Card className="glass-card glow-primary border-border/30 overflow-hidden">
      {/* Header with gradient */}
      <div className="gradient-bg p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl md:text-3xl font-bold mb-2">
              {recipe.title}
            </CardTitle>
            <p className="text-white/80 text-sm md:text-base">
              {recipe.description}
            </p>
          </div>
          <Badge className={difficultyColor[recipe.difficulty]}>
            {recipe.difficulty}
          </Badge>
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{recipe.totalTime}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">{recipe.servings} servings</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <ChefHat className="h-4 w-4" />
            <span className="text-sm">Prep: {recipe.prepTime}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <Accordion type="multiple" defaultValue={['ingredients', 'instructions']} className="w-full">
          {/* Ingredients */}
          <AccordionItem value="ingredients" className="border-border/30">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">Ingredients</span>
                <Badge variant="outline" className="ml-2">
                  {checkedIngredients.size}/{recipe.ingredients.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Checkbox
                      checked={checkedIngredients.has(index)}
                      onCheckedChange={() => toggleIngredient(index)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span
                      className={`flex-1 ${
                        checkedIngredients.has(index)
                          ? 'line-through text-muted-foreground'
                          : ''
                      }`}
                    >
                      <span className="font-medium text-primary">{ingredient.amount}</span>{' '}
                      {ingredient.item}
                    </span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Instructions */}
          <AccordionItem value="instructions" className="border-border/30">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
              <span className="text-lg font-semibold">Instructions</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white font-semibold text-sm">
                      {instruction.step}
                    </div>
                    <p className="flex-1 text-foreground/90 leading-relaxed pt-1">
                      {instruction.text}
                    </p>
                  </li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>

          {/* Tips */}
          {recipe.tips && recipe.tips.length > 0 && (
            <AccordionItem value="tips" className="border-border/30">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <span className="text-lg font-semibold">Tips & Variations</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <ul className="space-y-2">
                  {recipe.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{tip}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Nutrition Info */}
          {recipe.nutritionInfo && (
            <AccordionItem value="nutrition" className="border-none">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
                <span className="text-lg font-semibold">Nutrition (per serving)</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-primary">{recipe.nutritionInfo.calories}</p>
                    <p className="text-sm text-muted-foreground">Calories</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-accent">{recipe.nutritionInfo.protein}</p>
                    <p className="text-sm text-muted-foreground">Protein</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-secondary">{recipe.nutritionInfo.carbs}</p>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-foreground">{recipe.nutritionInfo.fat}</p>
                    <p className="text-sm text-muted-foreground">Fat</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {/* Action buttons */}
        <div className="p-6 border-t border-border/30 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onGenerateAnother}
            className="flex-1 gradient-bg hover:opacity-90 transition-opacity h-12"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Another Recipe
          </Button>
          <Button
            onClick={onStartOver}
            variant="outline"
            className="flex-1 h-12 border-border/50 hover:bg-muted/50"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Start Over
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
