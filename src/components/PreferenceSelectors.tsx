import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface PreferenceSelectorsProps {
  dietaryPreference: string;
  cuisineType: string;
  servings: number;
  cookingTime: string;
  onDietaryChange: (value: string) => void;
  onCuisineChange: (value: string) => void;
  onServingsChange: (value: number) => void;
  onCookingTimeChange: (value: string) => void;
}

const dietaryOptions = [
  { value: 'none', label: 'No restrictions' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'keto', label: 'Keto' },
  { value: 'dairy-free', label: 'Dairy-Free' },
  { value: 'paleo', label: 'Paleo' },
];

const cuisineOptions = [
  { value: 'any', label: 'Any cuisine' },
  { value: 'italian', label: 'Italian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'asian', label: 'Asian' },
  { value: 'indian', label: 'Indian' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'american', label: 'American' },
  { value: 'french', label: 'French' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'thai', label: 'Thai' },
];

const cookingTimeOptions = [
  { value: 'any', label: 'Any time' },
  { value: 'quick', label: 'Quick (< 30 min)' },
  { value: 'medium', label: 'Medium (30-60 min)' },
  { value: 'long', label: 'Long (> 60 min)' },
];

export function PreferenceSelectors({
  dietaryPreference,
  cuisineType,
  servings,
  cookingTime,
  onDietaryChange,
  onCuisineChange,
  onServingsChange,
  onCookingTimeChange,
}: PreferenceSelectorsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Dietary Preference */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Dietary Preference
        </Label>
        <Select value={dietaryPreference} onValueChange={onDietaryChange}>
          <SelectTrigger className="bg-muted/50 border-border/50 h-12">
            <SelectValue placeholder="Select dietary preference" />
          </SelectTrigger>
          <SelectContent>
            {dietaryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cuisine Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Cuisine Type
        </Label>
        <Select value={cuisineType} onValueChange={onCuisineChange}>
          <SelectTrigger className="bg-muted/50 border-border/50 h-12">
            <SelectValue placeholder="Select cuisine type" />
          </SelectTrigger>
          <SelectContent>
            {cuisineOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cooking Time */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Cooking Time
        </Label>
        <Select value={cookingTime} onValueChange={onCookingTimeChange}>
          <SelectTrigger className="bg-muted/50 border-border/50 h-12">
            <SelectValue placeholder="Select cooking time" />
          </SelectTrigger>
          <SelectContent>
            {cookingTimeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Servings */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium text-foreground">
            Servings
          </Label>
          <span className="text-lg font-semibold text-primary">
            {servings} {servings === 1 ? 'person' : 'people'}
          </span>
        </div>
        <Slider
          value={[servings]}
          onValueChange={(value) => onServingsChange(value[0])}
          min={1}
          max={8}
          step={1}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>8</span>
        </div>
      </div>
    </div>
  );
}
