"use client";

import { useState } from "react";
import type { Meal, MealType } from "@/types";
import { useFamily } from "@/hooks/use-family";
import { useRealtime } from "@/hooks/use-realtime";
import { MealForm } from "./meal-form";
import { Card } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";

interface MealGridProps {
  meals: Meal[];
  weekStart: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

function getDateForDay(weekStart: string, dayIndex: number): string {
  const date = new Date(weekStart + "T00:00:00");
  date.setDate(date.getDate() + dayIndex);
  return date.toISOString().split("T")[0];
}

export function MealGrid({ meals, weekStart }: MealGridProps) {
  const { family } = useFamily();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | undefined>();
  const [defaultDate, setDefaultDate] = useState<string>();
  const [defaultMealType, setDefaultMealType] = useState<MealType>();

  useRealtime({ table: "meals", familyId: family.id });

  function getMealForCell(date: string, mealType: MealType): Meal | undefined {
    return meals.find((m) => m.date === date && m.meal_type === mealType);
  }

  function handleCellClick(date: string, mealType: MealType) {
    const existing = getMealForCell(date, mealType);
    if (existing) {
      setSelectedMeal(existing);
      setDefaultDate(undefined);
      setDefaultMealType(undefined);
    } else {
      setSelectedMeal(undefined);
      setDefaultDate(date);
      setDefaultMealType(mealType);
    }
    setFormOpen(true);
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header row */}
          <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-1">
            <div />
            {DAYS.map((day, i) => {
              const date = getDateForDay(weekStart, i);
              const d = new Date(date + "T00:00:00");
              return (
                <div
                  key={day}
                  className="text-center text-sm font-medium py-2"
                >
                  <div>{day}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.getMonth() + 1}/{d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meal rows */}
          {MEAL_TYPES.map((type) => (
            <div
              key={type.value}
              className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-1"
            >
              <div className="flex items-center text-sm font-medium text-muted-foreground px-2">
                {type.label}
              </div>
              {DAYS.map((_, dayIndex) => {
                const date = getDateForDay(weekStart, dayIndex);
                const meal = getMealForCell(date, type.value);

                return (
                  <Card
                    key={dayIndex}
                    className="group p-2 min-h-16 cursor-pointer hover:bg-accent/50 transition-colors flex items-center justify-center"
                    onClick={() => handleCellClick(date, type.value)}
                  >
                    {meal ? (
                      <span className="text-xs text-center leading-tight line-clamp-2">
                        {meal.name}
                      </span>
                    ) : (
                      <PlusIcon className="size-4 text-muted-foreground/40 transition-all group-hover:text-primary group-hover:scale-110" />
                    )}
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <MealForm
        key={selectedMeal?.id ?? `new-${defaultDate}-${defaultMealType}`}
        meal={selectedMeal}
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultDate={defaultDate}
        defaultMealType={defaultMealType}
      />
    </>
  );
}
