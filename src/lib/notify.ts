import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push/send";

type NotificationCategory =
  | "eventReminders"
  | "choreAssignments"
  | "morningDigest"
  | "rewardApprovals";

interface NotifyPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Send push notification to a user.
 * Checks user preferences for the given category before sending.
 */
export async function notifyUser(
  userId: string,
  category: NotificationCategory,
  payload: NotifyPayload
) {
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  // Check if this category is enabled (defaults to true if no prefs row)
  const categoryEnabled = prefs ? prefs[category] !== false : true;
  if (!categoryEnabled) return;

  await sendPushToUser(userId, payload).catch(() => {});
}

/**
 * Send push notification to all members of a family.
 */
export async function notifyFamily(
  familyId: string,
  category: NotificationCategory,
  payload: NotifyPayload
) {
  const members = await prisma.familyMember.findMany({
    where: { familyId },
    select: { userId: true },
  });

  await Promise.allSettled(
    members.map((m) => notifyUser(m.userId, category, payload))
  );
}
