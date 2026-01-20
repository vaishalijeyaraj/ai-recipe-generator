import { ChefHat } from 'lucide-react';

const loadingMessages = [
  "Mixing ingredients...",
  "Preheating the AI oven...",
  "Adding a pinch of creativity...",
  "Simmering the perfect recipe...",
  "Taste-testing virtually...",
];

export function LoadingSpinner() {
  const message = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full gradient-bg opacity-20 blur-xl animate-pulse-slow scale-150" />
        
        {/* Spinning ring */}
        <div className="relative w-24 h-24 rounded-full border-4 border-border/30">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ChefHat className="h-10 w-10 text-primary animate-bounce" />
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-lg font-medium text-foreground">{message}</p>
      <p className="mt-2 text-sm text-muted-foreground">This usually takes 5-10 seconds</p>
    </div>
  );
}
