"use server";

import { prisma } from "@/lib/prisma";
import { requireFamily } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function getNotificationPreferences() {
  const { session } = await requireFamily();

  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: session.user.id },
  });

  return {
    event_reminders: prefs?.eventReminders ?? true,
    chore_assignments: prefs?.choreAssignments ?? true,
    morning_digest: prefs?.morningDigest ?? true,
    reward_approvals: prefs?.rewardApprovals ?? true,
  };
}

export async function updateNotificationPreferences(formData: FormData) {
  const { session } = await requireFamily();

  await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    update: {
      eventReminders: formData.get("event_reminders") === "true",
      choreAssignments: formData.get("chore_assignments") === "true",
      morningDigest: formData.get("morning_digest") === "true",
      rewardApprovals: formData.get("reward_approvals") === "true",
    },
    create: {
      userId: session.user.id,
      eventReminders: formData.get("event_reminders") === "true",
      choreAssignments: formData.get("chore_assignments") === "true",
      morningDigest: formData.get("morning_digest") === "true",
      rewardApprovals: formData.get("reward_approvals") === "true",
    },
  });

  revalidatePath("/settings");
  return { success: true };
}
