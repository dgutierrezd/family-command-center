"use client";

import { useState, useTransition } from "react";
import { updateFamilyPreferences } from "@/actions/preferences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Kosher",
  "Halal",
];

const CUISINE_OPTIONS = [
  "Italian",
  "Mexican",
  "Asian",
  "Indian",
  "Mediterranean",
  "American",
  "Japanese",
  "Thai",
  "French",
  "Middle Eastern",
];

interface DietaryPreferencesProps {
  initialDietary: string[];
  initialCuisines: string[];
  initialHouseholdSize: number | null;
}

export function DietaryPreferences({
  initialDietary,
  initialCuisines,
  initialHouseholdSize,
}: DietaryPreferencesProps) {
  const [dietary, setDietary] = useState<string[]>(initialDietary);
  const [cuisines, setCuisines] = useState<string[]>(initialCuisines);
  const [householdSize, setHouseholdSize] = useState(
    initialHouseholdSize?.toString() ?? ""
  );
  const [isPending, startTransition] = useTransition();

  function toggleDietary(item: string) {
    setDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  }

  function toggleCuisine(item: string) {
    setCuisines((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  }

  function handleSave() {
    const formData = new FormData();
    formData.set("dietary_restrictions", JSON.stringify(dietary));
    formData.set("cuisine_preferences", JSON.stringify(cuisines));
    if (householdSize) formData.set("household_size", householdSize);

    startTransition(async () => {
      const result = await updateFamilyPreferences(formData);
      if (result.error) toast.error(result.error);
      else toast.success("Preferences saved");
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Dietary Restrictions</p>
        <div className="flex flex-wrap gap-3">
          {DIETARY_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 text-sm">
              <Checkbox
                checked={dietary.includes(opt)}
                onCheckedChange={() => toggleDietary(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Cuisine Preferences</p>
        <div className="flex flex-wrap gap-3">
          {CUISINE_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 text-sm">
              <Checkbox
                checked={cuisines.includes(opt)}
                onCheckedChange={() => toggleCuisine(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Household Size</label>
        <Input
          type="number"
          min={1}
          max={20}
          value={householdSize}
          onChange={(e) => setHouseholdSize(e.target.value)}
          placeholder="e.g. 4"
          className="w-24 mt-1"
        />
      </div>

      <Button onClick={handleSave} disabled={isPending} size="sm">
        {isPending ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  );
}
