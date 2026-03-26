"use client";

import { useState, useTransition } from "react";
import { suggestMeals, acceptSuggestion } from "@/actions/suggestions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { MealSuggestion } from "@/types";
import { format } from "date-fns";

export function MealSuggestions() {
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSuggest() {
    setIsLoading(true);
    try {
      const result = await suggestMeals();
      setSuggestions(result);
    } catch {
      toast.error("Could not generate suggestions. Is GROQ_API_KEY configured?");
    } finally {
      setIsLoading(false);
    }
  }

  function handleAccept(suggestion: MealSuggestion) {
    const today = format(new Date(), "yyyy-MM-dd");
    startTransition(async () => {
      const result = await acceptSuggestion(suggestion, today);
      if (result.success) {
        toast.success(`Added "${suggestion.name}" to today's meals`);
        setSuggestions((prev) => prev.filter((s) => s.name !== suggestion.name));
      }
    });
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSuggest}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="size-4 mr-1.5 animate-spin" />
        ) : (
          <Sparkles className="size-4 mr-1.5" />
        )}
        {isLoading ? "Thinking..." : "Suggest Meals"}
      </Button>

      {suggestions.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {suggestions.map((suggestion, i) => (
            <Card key={i} className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Sparkles className="size-3 text-violet-500" />
                  {suggestion.name}
                </CardTitle>
                <p className="text-[10px] font-medium uppercase text-muted-foreground">
                  {suggestion.meal_type}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {suggestion.ingredients.slice(0, 5).map((ing, j) => (
                    <li key={j}>
                      {ing.name}
                      {ing.quantity ? ` (${ing.quantity})` : ""}
                    </li>
                  ))}
                  {suggestion.ingredients.length > 5 && (
                    <li>+{suggestion.ingredients.length - 5} more</li>
                  )}
                </ul>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleAccept(suggestion)}
                  disabled={isPending}
                >
                  <Plus className="size-3 mr-1" />
                  Add to Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
