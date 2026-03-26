"use server";

import { prisma } from "@/lib/prisma";
import { requireFamily } from "@/lib/auth/session";
import { suggestMealsFromAI } from "@/lib/ai/suggest-meals";
import { revalidatePath } from "next/cache";
import { format, subDays } from "date-fns";
import type { MealSuggestion, MealType } from "@/types";

export async function suggestMeals() {
  const { membership } = await requireFamily();

  const today = new Date();
  const weekAgo = subDays(today, 7);
  const todayStr = format(today, "yyyy-MM-dd");
  const weekAgoStr = format(weekAgo, "yyyy-MM-dd");

  const [recentMeals, familyPrefs] = await Promise.all([
    prisma.meal.findMany({
      where: {
        familyId: membership.family_id,
        date: { gte: weekAgoStr, lte: todayStr },
      },
      select: { name: true, mealType: true },
    }),
    prisma.familyPreferences.findUnique({
      where: { familyId: membership.family_id },
    }),
  ]);

  const suggestions = await suggestMealsFromAI({
    recentMeals: recentMeals.map((m) => ({
      name: m.name,
      meal_type: m.mealType,
    })),
    dietaryRestrictions: familyPrefs?.dietaryRestrictions
      ? JSON.parse(familyPrefs.dietaryRestrictions)
      : [],
    cuisinePreferences: familyPrefs?.cuisinePreferences
      ? JSON.parse(familyPrefs.cuisinePreferences)
      : [],
    householdSize: familyPrefs?.householdSize ?? null,
  });

  return suggestions;
}

export async function acceptSuggestion(suggestion: MealSuggestion, date: string) {
  const { session, membership } = await requireFamily();

  const validTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
  const mealType = validTypes.includes(suggestion.meal_type as MealType)
    ? suggestion.meal_type
    : "dinner";

  // Create meal with ingredients and grocery items in one transaction
  await prisma.$transaction([
    prisma.meal.create({
      data: {
        familyId: membership.family_id,
        createdBy: session.user.id,
        name: suggestion.name,
        date,
        mealType,
        ingredients: {
          create: suggestion.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity || null,
            category: ing.category || "Other",
          })),
        },
      },
    }),
    // Also add ingredients to grocery list
    prisma.groceryItem.createMany({
      data: suggestion.ingredients.map((ing) => ({
        familyId: membership.family_id,
        name: ing.name,
        quantity: ing.quantity || null,
        category: ing.category || "Other",
        checked: false,
      })),
    }),
  ]);

  revalidatePath("/meals");
  revalidatePath("/grocery-list");
  return { success: true };
}
