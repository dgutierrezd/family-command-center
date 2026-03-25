"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Meal, MealType } from "@/types";
import { createMeal, updateMeal, deleteMeal } from "@/actions/meals";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, TrashIcon } from "lucide-react";

interface Ingredient {
  name: string;
  quantity: string;
  category: string;
}

interface MealFormProps {
  meal?: Meal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  defaultMealType?: MealType;
}

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

const INGREDIENT_CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat",
  "Seafood",
  "Bakery",
  "Pantry",
  "Frozen",
  "Beverages",
  "Condiments",
  "Other",
];

export function MealForm({
  meal,
  open,
  onOpenChange,
  defaultDate,
  defaultMealType,
}: MealFormProps) {
  const [isPending, startTransition] = useTransition();
  const [mealType, setMealType] = useState<MealType>(
    meal?.meal_type ?? defaultMealType ?? "dinner"
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    meal?.ingredients?.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity ?? "",
      category: ing.category,
    })) ?? []
  );

  function addIngredient() {
    setIngredients((prev) => [
      ...prev,
      { name: "", quantity: "", category: "Other" },
    ]);
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function updateIngredient(
    index: number,
    field: keyof Ingredient,
    value: string
  ) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("meal_type", mealType);
    formData.set(
      "ingredients",
      JSON.stringify(ingredients.filter((ing) => ing.name.trim()))
    );

    startTransition(async () => {
      const result = (meal
        ? await updateMeal(meal.id, formData)
        : await createMeal(formData)) as { success?: boolean; error?: string };

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(meal ? "Meal updated" : "Meal added");
      onOpenChange(false);
    });
  }

  function handleDelete() {
    if (!meal) return;
    startTransition(async () => {
      const result = await deleteMeal(meal.id) as { success?: boolean; error?: string };
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Meal deleted");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{meal ? "Edit Meal" : "Add Meal"}</DialogTitle>
          <DialogDescription>
            {meal
              ? "Update the meal details below."
              : "Fill in the details for this meal."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Chicken stir-fry"
              defaultValue={meal?.name ?? ""}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Meal Type</Label>
              <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={meal?.date ?? defaultDate ?? ""}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="recipe_url">Recipe URL</Label>
            <Input
              id="recipe_url"
              name="recipe_url"
              type="url"
              placeholder="https://..."
              defaultValue={meal?.recipe_url ?? ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any notes about this meal..."
              defaultValue={meal?.notes ?? ""}
              rows={2}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Ingredients</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addIngredient}
              >
                <PlusIcon data-icon="inline-start" />
                Add
              </Button>
            </div>

            {ingredients.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No ingredients added yet.
              </p>
            )}

            <div className="grid gap-2">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Input
                    placeholder="Name"
                    value={ing.name}
                    onChange={(e) =>
                      updateIngredient(index, "name", e.target.value)
                    }
                    className="flex-1"
                  />
                  <Input
                    placeholder="Qty"
                    value={ing.quantity}
                    onChange={(e) =>
                      updateIngredient(index, "quantity", e.target.value)
                    }
                    className="w-20"
                  />
                  <Select
                    value={ing.category}
                    onValueChange={(v) =>
                      v && updateIngredient(index, "category", v)
                    }
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INGREDIENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeIngredient(index)}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            {meal && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                Delete
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : meal ? "Update" : "Add Meal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
