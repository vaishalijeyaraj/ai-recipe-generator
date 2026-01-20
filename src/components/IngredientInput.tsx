import { useState, KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface IngredientInputProps {
  ingredients: string[];
  onAdd: (ingredient: string) => void;
  onRemove: (ingredient: string) => void;
}

export function IngredientInput({ ingredients, onAdd, onRemove }: IngredientInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !ingredients.includes(trimmed.toLowerCase())) {
      onAdd(trimmed.toLowerCase());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">
        What ingredients do you have?
      </label>
      
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type an ingredient and press Enter..."
          className="flex-1 bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 h-12 text-base"
        />
        <Button
          type="button"
          onClick={handleAdd}
          className="gradient-bg hover:opacity-90 transition-opacity h-12 px-4"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ingredient) => (
            <Badge
              key={ingredient}
              variant="secondary"
              className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 px-3 py-1.5 text-sm cursor-pointer transition-colors group"
            >
              {ingredient}
              <button
                onClick={() => onRemove(ingredient)}
                className="ml-2 hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {ingredients.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add at least 2-3 ingredients to get started
        </p>
      )}
    </div>
  );
}
