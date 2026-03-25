"use server";

import { prisma } from "@/lib/prisma";
import { requireFamily } from "@/lib/auth/session";
import { mealSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import type { MealType } from "@/types";

export async function getMealsForWeek(startDate: string, endDate: string) {
  const { membership } = await requireFamily();

  const meals = await prisma.meal.findMany({
    where: {
      familyId: membership.family_id,
      date: { gte: startDate, lte: endDate },
    },
    include: { ingredients: true },
    orderBy: { date: "asc" },
  });

  return meals.map((m) => ({
    id: m.id,
    family_id: m.familyId,
    name: m.name,
    date: m.date,
    meal_type: m.mealType as MealType,
    recipe_url: m.recipeUrl,
    notes: m.notes,
    created_by: m.createdBy,
    created_at: m.createdAt.toISOString(),
    ingredients: m.ingredients.map((i) => ({
      id: i.id,
      meal_id: i.mealId,
      name: i.name,
      quantity: i.quantity,
      category: i.category,
    })),
  }));
}

export async function createMeal(formData: FormData) {
  const { session, membership } = await requireFamily();

  const ingredientsRaw = formData.get("ingredients");
  const ingredients = ingredientsRaw ? JSON.parse(ingredientsRaw as string) : [];

  const parsed = mealSchema.safeParse({
    name: formData.get("name"),
    date: formData.get("date"),
    meal_type: formData.get("meal_type"),
    recipe_url: formData.get("recipe_url") || undefined,
    notes: formData.get("notes") || undefined,
    ingredients,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { ingredients: parsedIngredients, ...mealData } = parsed.data;

  await prisma.meal.create({
    data: {
      familyId: membership.family_id,
      createdBy: session.user.id,
      name: mealData.name,
      date: mealData.date,
      mealType: mealData.meal_type,
      recipeUrl: mealData.recipe_url || null,
      notes: mealData.notes || null,
      ingredients: {
        create: (parsedIngredients ?? []).map((ing) => ({
          name: ing.name,
          quantity: ing.quantity || null,
          category: ing.category,
        })),
      },
    },
  });

  revalidatePath("/meals");
  return { success: true };
}

export async function updateMeal(mealId: string, formData: FormData) {
  const { membership } = await requireFamily();

  const ingredientsRaw = formData.get("ingredients");
  const ingredients = ingredientsRaw ? JSON.parse(ingredientsRaw as string) : [];

  const parsed = mealSchema.safeParse({
    name: formData.get("name"),
    date: formData.get("date"),
    meal_type: formData.get("meal_type"),
    recipe_url: formData.get("recipe_url") || undefined,
    notes: formData.get("notes") || undefined,
    ingredients,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { ingredients: parsedIngredients, ...mealData } = parsed.data;

  // Verify ownership
  const meal = await prisma.meal.findFirst({
    where: { id: mealId, familyId: membership.family_id },
  });
  if (!meal) return { error: "Meal not found" };

  await prisma.$transaction([
    prisma.meal.update({
      where: { id: mealId },
      data: {
        name: mealData.name,
        date: mealData.date,
        mealType: mealData.meal_type,
        recipeUrl: mealData.recipe_url || null,
        notes: mealData.notes || null,
      },
    }),
    prisma.mealIngredient.deleteMany({ where: { mealId } }),
    ...(parsedIngredients && parsedIngredients.length > 0
      ? [
          prisma.mealIngredient.createMany({
            data: parsedIngredients.map((ing) => ({
              mealId,
              name: ing.name,
              quantity: ing.quantity || null,
              category: ing.category,
            })),
          }),
        ]
      : []),
  ]);

  revalidatePath("/meals");
  return { success: true };
}

export async function deleteMeal(mealId: string) {
  const { membership } = await requireFamily();

  await prisma.meal.deleteMany({
    where: { id: mealId, familyId: membership.family_id },
  });

  revalidatePath("/meals");
  return { success: true };
}

export async function generateGroceryList(startDate: string, endDate: string) {
  const { membership } = await requireFamily();

  const meals = await prisma.meal.findMany({
    where: {
      familyId: membership.family_id,
      date: { gte: startDate, lte: endDate },
    },
    include: { ingredients: true },
  });

  // Deduplicate by lowercase name + category
  const deduped = new Map<
    string,
    { name: string; quantity: string; category: string; sourceMealId: string }
  >();

  for (const meal of meals) {
    for (const ing of meal.ingredients) {
      const key = `${ing.name.toLowerCase()}-${ing.category.toLowerCase()}`;
      const existing = deduped.get(key);
      if (existing && ing.quantity && existing.quantity) {
        existing.quantity = `${existing.quantity}, ${ing.quantity}`;
      } else if (!existing) {
        deduped.set(key, {
          name: ing.name,
          quantity: ing.quantity ?? "",
          category: ing.category,
          sourceMealId: meal.id,
        });
      }
    }
  }

  const items = Array.from(deduped.values());

  if (items.length > 0) {
    await prisma.groceryItem.createMany({
      data: items.map((item) => ({
        familyId: membership.family_id,
        name: item.name,
        quantity: item.quantity || null,
        category: item.category,
        sourceMealId: item.sourceMealId,
        checked: false,
      })),
    });
  }

  revalidatePath("/grocery-list");
  return { success: true, count: items.length };
}
