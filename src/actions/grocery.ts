"use server";

import { prisma } from "@/lib/prisma";
import { requireFamily } from "@/lib/auth/session";
import { groceryItemSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getGroceryItems() {
  const { membership } = await requireFamily();

  const items = await prisma.groceryItem.findMany({
    where: { familyId: membership.family_id },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return items.map((i) => ({
    id: i.id,
    family_id: i.familyId,
    name: i.name,
    quantity: i.quantity,
    category: i.category,
    source_meal_id: i.sourceMealId,
    checked: i.checked,
    checked_by: i.checkedBy,
    created_at: i.createdAt.toISOString(),
  }));
}

export async function addGroceryItem(formData: FormData) {
  const { membership } = await requireFamily();

  const parsed = groceryItemSchema.safeParse({
    name: formData.get("name"),
    quantity: formData.get("quantity") || undefined,
    category: formData.get("category") || "Other",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.groceryItem.create({
    data: {
      familyId: membership.family_id,
      name: parsed.data.name,
      quantity: parsed.data.quantity || null,
      category: parsed.data.category,
      checked: false,
    },
  });

  revalidatePath("/grocery-list");
  return { success: true };
}

export async function toggleGroceryItem(itemId: string, checked: boolean) {
  const { session, membership } = await requireFamily();

  await prisma.groceryItem.updateMany({
    where: { id: itemId, familyId: membership.family_id },
    data: {
      checked,
      checkedBy: checked ? session.user.id : null,
    },
  });

  revalidatePath("/grocery-list");
  return { success: true };
}

export async function deleteGroceryItem(itemId: string) {
  const { membership } = await requireFamily();

  await prisma.groceryItem.deleteMany({
    where: { id: itemId, familyId: membership.family_id },
  });

  revalidatePath("/grocery-list");
  return { success: true };
}

export async function clearCheckedItems() {
  const { membership } = await requireFamily();

  await prisma.groceryItem.deleteMany({
    where: { familyId: membership.family_id, checked: true },
  });

  revalidatePath("/grocery-list");
  return { success: true };
}
