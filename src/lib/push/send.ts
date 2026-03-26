import webpush from "web-push";
import { prisma } from "@/lib/prisma";

if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webpush.setVapidDetails(
    "mailto:noreply@familycommandcenter.app",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

async function sendToSubscription(
  subscriptionId: string,
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: PushPayload
) {
  try {
    await webpush.sendNotification(
      {
        endpoint,
        keys: { p256dh, auth },
      },
      JSON.stringify(payload)
    );
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 410 || statusCode === 404) {
      // Subscription expired — clean up
      await prisma.pushSubscription.delete({
        where: { id: subscriptionId },
      }).catch(() => {});
    }
  }
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  await Promise.allSettled(
    subscriptions.map((sub) =>
      sendToSubscription(sub.id, sub.endpoint, sub.p256dh, sub.auth, payload)
    )
  );
}

export async function sendPushToFamily(familyId: string, payload: PushPayload) {
  const members = await prisma.familyMember.findMany({
    where: { familyId },
    select: { userId: true },
  });

  await Promise.allSettled(
    members.map((m) => sendPushToUser(m.userId, payload))
  );
}
