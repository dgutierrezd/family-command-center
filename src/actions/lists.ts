"use server";

import { prisma } from "@/lib/prisma";
import { requireFamily } from "@/lib/auth/session";
import { sharedListSchema, sharedListItemSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getSharedLists(includeArchived = false) {
  const { membership } = await requireFamily();

  const lists = await prisma.sharedList.findMany({
    where: {
      familyId: membership.family_id,
      ...(includeArchived ? {} : { archived: false }),
    },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return lists.map((l) => ({
    id: l.id,
    family_id: l.familyId,
    name: l.name,
    template: l.template,
    archived: l.archived,
    created_by: l.createdBy,
    created_at: l.createdAt.toISOString(),
    _count: l._count,
  }));
}

export async function getSharedList(listId: string) {
  const { membership } = await requireFamily();

  const list = await prisma.sharedList.findFirst({
    where: { id: listId, familyId: membership.family_id },
    include: {
      items: { orderBy: [{ checked: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!list) return null;

  return {
    id: list.id,
    family_id: list.familyId,
    name: list.name,
    template: list.template,
    archived: list.archived,
    created_by: list.createdBy,
    created_at: list.createdAt.toISOString(),
    items: list.items.map((i) => ({
      id: i.id,
      list_id: i.listId,
      name: i.name,
      checked: i.checked,
      created_by: i.createdBy,
      created_at: i.createdAt.toISOString(),
    })),
  };
}

export async function createSharedList(formData: FormData) {
  const { session, membership } = await requireFamily();

  const parsed = sharedListSchema.safeParse({
    name: formData.get("name"),
    template: formData.get("template") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const list = await prisma.sharedList.create({
    data: {
      familyId: membership.family_id,
      createdBy: session.user.id,
      name: parsed.data.name,
      template: parsed.data.template ?? null,
    },
  });

  revalidatePath("/lists");
  return { success: true, id: list.id };
}

export async function archiveSharedList(listId: string) {
  const { membership } = await requireFamily();

  await prisma.sharedList.updateMany({
    where: { id: listId, familyId: membership.family_id },
    data: { archived: true },
  });

  revalidatePath("/lists");
  return { success: true };
}

export async function deleteSharedList(listId: string) {
  const { membership } = await requireFamily();

  await prisma.sharedList.deleteMany({
    where: { id: listId, familyId: membership.family_id },
  });

  revalidatePath("/lists");
  return { success: true };
}

export async function addListItem(listId: string, formData: FormData) {
  const { session, membership } = await requireFamily();

  const parsed = sharedListItemSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Verify list belongs to family
  const list = await prisma.sharedList.findFirst({
    where: { id: listId, familyId: membership.family_id },
  });
  if (!list) return { error: "List not found" };

  await prisma.sharedListItem.create({
    data: {
      listId,
      name: parsed.data.name,
      createdBy: session.user.id,
    },
  });

  revalidatePath(`/lists/${listId}`);
  return { success: true };
}

export async function toggleListItem(itemId: string, checked: boolean) {
  const { membership } = await requireFamily();

  const item = await prisma.sharedListItem.findUnique({
    where: { id: itemId },
    include: { list: { select: { familyId: true, id: true } } },
  });

  if (!item || item.list.familyId !== membership.family_id) {
    return { error: "Item not found" };
  }

  await prisma.sharedListItem.update({
    where: { id: itemId },
    data: { checked },
  });

  revalidatePath(`/lists/${item.list.id}`);
  return { success: true };
}

export async function deleteListItem(itemId: string) {
  const { membership } = await requireFamily();

  const item = await prisma.sharedListItem.findUnique({
    where: { id: itemId },
    include: { list: { select: { familyId: true, id: true } } },
  });

  if (!item || item.list.familyId !== membership.family_id) {
    return { error: "Item not found" };
  }

  await prisma.sharedListItem.delete({ where: { id: itemId } });

  revalidatePath(`/lists/${item.list.id}`);
  return { success: true };
}
