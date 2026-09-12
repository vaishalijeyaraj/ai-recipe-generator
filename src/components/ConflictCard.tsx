import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FeasibilityResult } from '@/hooks/useRecipeGenerator';

interface ConflictCardProps {
  conflict: FeasibilityResult;
  onAcceptSwap: () => void;
  onDismiss: () => void;
}

export function ConflictCard({ conflict, onAcceptSwap, onDismiss }: ConflictCardProps) {
  return (
    <Card className="glass-card border-border/30">
      <CardContent className="p-6 md:p-8 space-y-6">
        {conflict.conflicts.map((c, i) => (
          <div key={i} className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">{c.ingredient} doesn't quite fit</p>
              <p className="text-sm text-muted-foreground">{c.issue}</p>
              <p className="text-sm text-muted-foreground">{c.why_it_matters}</p>
              <p className="text-sm">
                Try <span className="font-semibold">{c.suggestion}</span> instead — {c.why_the_swap_works}
              </p>
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={onAcceptSwap} className="flex-1">
            Use the suggested swaps
          </Button>
          <Button onClick={onDismiss} variant="outline" className="flex-1">
            Keep my ingredients, change diet instead
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}