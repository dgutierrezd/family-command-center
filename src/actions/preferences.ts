"use server";

import { prisma } from "@/lib/prisma";
import { requireFamily } from "@/lib/auth/session";
import { familyPreferencesSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getFamilyPreferences() {
  const { membership } = await requireFamily();

  const prefs = await prisma.familyPreferences.findUnique({
    where: { familyId: membership.family_id },
  });

  return {
    dietary_restrictions: prefs?.dietaryRestrictions
      ? (JSON.parse(prefs.dietaryRestrictions) as string[])
      : [],
    cuisine_preferences: prefs?.cuisinePreferences
      ? (JSON.parse(prefs.cuisinePreferences) as string[])
      : [],
    household_size: prefs?.householdSize ?? null,
  };
}

export async function updateFamilyPreferences(formData: FormData) {
  const { membership } = await requireFamily();

  if (membership.role === "child") {
    return { error: "Only parents can update preferences" };
  }

  const dietaryRaw = formData.get("dietary_restrictions");
  const cuisineRaw = formData.get("cuisine_preferences");
  const householdSize = formData.get("household_size");

  const parsed = familyPreferencesSchema.safeParse({
    dietary_restrictions: dietaryRaw ? JSON.parse(dietaryRaw as string) : [],
    cuisine_preferences: cuisineRaw ? JSON.parse(cuisineRaw as string) : [],
    household_size: householdSize ? Number(householdSize) : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.familyPreferences.upsert({
    where: { familyId: membership.family_id },
    update: {
      dietaryRestrictions: JSON.stringify(parsed.data.dietary_restrictions ?? []),
      cuisinePreferences: JSON.stringify(parsed.data.cuisine_preferences ?? []),
      householdSize: parsed.data.household_size ?? null,
    },
    create: {
      familyId: membership.family_id,
      dietaryRestrictions: JSON.stringify(parsed.data.dietary_restrictions ?? []),
      cuisinePreferences: JSON.stringify(parsed.data.cuisine_preferences ?? []),
      householdSize: parsed.data.household_size ?? null,
    },
  });

  revalidatePath("/settings");
  return { success: true };
}
