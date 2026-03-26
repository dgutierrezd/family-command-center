"use server";

import { prisma } from "@/lib/prisma";
import { requireFamily } from "@/lib/auth/session";
import { choreSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { notifyUser } from "@/lib/notify";

export async function getChores() {
  const { membership } = await requireFamily();

  const chores = await prisma.chore.findMany({
    where: { familyId: membership.family_id },
    include: { assignee: true },
    orderBy: { createdAt: "asc" },
  });

  return chores.map((c) => ({
    id: c.id,
    family_id: c.familyId,
    title: c.title,
    description: c.description,
    assigned_to: c.assignedTo,
    recurrence_rule: c.recurrenceRule,
    points: c.points,
    created_by: c.createdBy,
    created_at: c.createdAt.toISOString(),
    assignee: c.assignee
      ? {
          id: c.assignee.id,
          email: c.assignee.email,
          name: c.assignee.name,
          avatar_url: c.assignee.avatarUrl,
          google_refresh_token: c.assignee.googleRefreshToken,
          created_at: c.assignee.createdAt.toISOString(),
        }
      : null,
  }));
}

export async function getChoresWithCompletions() {
  const { membership } = await requireFamily();

  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);

  const chores = await prisma.chore.findMany({
    where: { familyId: membership.family_id },
    include: {
      assignee: true,
      completions: {
        where: {
          completedAt: { gte: dayStart, lte: dayEnd },
        },
        include: { completer: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return chores.map((c) => ({
    id: c.id,
    family_id: c.familyId,
    title: c.title,
    description: c.description,
    assigned_to: c.assignedTo,
    recurrence_rule: c.recurrenceRule,
    points: c.points,
    created_by: c.createdBy,
    created_at: c.createdAt.toISOString(),
    assignee: c.assignee
      ? {
          id: c.assignee.id,
          email: c.assignee.email,
          name: c.assignee.name,
          avatar_url: c.assignee.avatarUrl,
          google_refresh_token: c.assignee.googleRefreshToken,
          created_at: c.assignee.createdAt.toISOString(),
        }
      : null,
    completions: c.completions.map((comp) => ({
      id: comp.id,
      chore_id: comp.choreId,
      completed_by: comp.completedBy,
      completed_at: comp.completedAt.toISOString(),
      verified_by: comp.verifiedBy,
      completer: comp.completer
        ? {
            id: comp.completer.id,
            email: comp.completer.email,
            name: comp.completer.name,
            avatar_url: comp.completer.avatarUrl,
            google_refresh_token: comp.completer.googleRefreshToken,
            created_at: comp.completer.createdAt.toISOString(),
          }
        : undefined,
    })),
  }));
}

export async function createChore(formData: FormData) {
  const { session, membership } = await requireFamily();

  const parsed = choreSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    assigned_to: formData.get("assigned_to") || null,
    recurrence_rule: formData.get("recurrence_rule") || null,
    points: Number(formData.get("points") || 1),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.chore.create({
    data: {
      familyId: membership.family_id,
      createdBy: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      assignedTo: parsed.data.assigned_to || null,
      recurrenceRule: parsed.data.recurrence_rule ?? null,
      points: parsed.data.points,
    },
  });

  // Notify assignee (push + email based on their prefs)
  if (parsed.data.assigned_to) {
    notifyUser(parsed.data.assigned_to, "choreAssignments", {
      title: "New chore assigned",
      body: parsed.data.title,
      url: "/chores",
    }).catch(() => {});
  }

  revalidatePath("/chores");
  return { success: true };
}

export async function updateChore(choreId: string, formData: FormData) {
  const { membership } = await requireFamily();

  const parsed = choreSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    assigned_to: formData.get("assigned_to") || null,
    recurrence_rule: formData.get("recurrence_rule") || null,
    points: Number(formData.get("points") || 1),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.chore.updateMany({
    where: { id: choreId, familyId: membership.family_id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      assignedTo: parsed.data.assigned_to || null,
      recurrenceRule: parsed.data.recurrence_rule ?? null,
      points: parsed.data.points,
    },
  });

  revalidatePath("/chores");
  return { success: true };
}

export async function deleteChore(choreId: string) {
  const { membership } = await requireFamily();

  await prisma.chore.deleteMany({
    where: { id: choreId, familyId: membership.family_id },
  });

  revalidatePath("/chores");
  return { success: true };
}

export async function completeChore(choreId: string) {
  const { session } = await requireFamily();

  await prisma.choreCompletion.create({
    data: {
      choreId,
      completedBy: session.user.id,
    },
  });

  revalidatePath("/chores");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function verifyCompletion(completionId: string) {
  const { session } = await requireFamily();

  await prisma.choreCompletion.update({
    where: { id: completionId },
    data: { verifiedBy: session.user.id },
  });

  revalidatePath("/chores");
  return { success: true };
}

export async function getPointsTally() {
  const { membership } = await requireFamily();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const completions = await prisma.choreCompletion.findMany({
    where: {
      completedAt: { gte: weekStart, lte: weekEnd },
      chore: { familyId: membership.family_id },
    },
    include: { chore: { select: { points: true } } },
  });

  const tally: Record<string, number> = {};
  for (const c of completions) {
    tally[c.completedBy] = (tally[c.completedBy] ?? 0) + c.chore.points;
  }

  return tally;
}
