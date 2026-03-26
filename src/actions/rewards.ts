"use server";

import { prisma } from "@/lib/prisma";
import { requireFamily } from "@/lib/auth/session";
import { rewardSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { notifyUser } from "@/lib/notify";

export async function getRewards() {
  const { membership } = await requireFamily();

  const rewards = await prisma.reward.findMany({
    where: { familyId: membership.family_id, active: true },
    orderBy: { pointsCost: "asc" },
  });

  return rewards.map((r) => ({
    id: r.id,
    family_id: r.familyId,
    name: r.name,
    description: r.description,
    points_cost: r.pointsCost,
    active: r.active,
    created_by: r.createdBy,
    created_at: r.createdAt.toISOString(),
  }));
}

export async function createReward(formData: FormData) {
  const { session, membership } = await requireFamily();

  if (membership.role === "child") {
    return { error: "Only parents can create rewards" };
  }

  const parsed = rewardSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    points_cost: Number(formData.get("points_cost")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.reward.create({
    data: {
      familyId: membership.family_id,
      createdBy: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      pointsCost: parsed.data.points_cost,
    },
  });

  revalidatePath("/rewards");
  return { success: true };
}

export async function updateReward(rewardId: string, formData: FormData) {
  const { membership } = await requireFamily();

  if (membership.role === "child") {
    return { error: "Only parents can edit rewards" };
  }

  const parsed = rewardSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    points_cost: Number(formData.get("points_cost")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.reward.updateMany({
    where: { id: rewardId, familyId: membership.family_id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      pointsCost: parsed.data.points_cost,
    },
  });

  revalidatePath("/rewards");
  return { success: true };
}

export async function deleteReward(rewardId: string) {
  const { membership } = await requireFamily();

  if (membership.role === "child") {
    return { error: "Only parents can delete rewards" };
  }

  await prisma.reward.deleteMany({
    where: { id: rewardId, familyId: membership.family_id },
  });

  revalidatePath("/rewards");
  return { success: true };
}

export async function redeemReward(rewardId: string) {
  const { session, membership } = await requireFamily();

  const reward = await prisma.reward.findFirst({
    where: { id: rewardId, familyId: membership.family_id, active: true },
  });

  if (!reward) return { error: "Reward not found" };

  const balance = await getPointsBalance(session.user.id);
  if (balance < reward.pointsCost) {
    return { error: `Not enough points. You have ${balance}, need ${reward.pointsCost}` };
  }

  await prisma.redemption.create({
    data: {
      rewardId,
      redeemedBy: session.user.id,
      status: "pending",
    },
  });

  revalidatePath("/rewards");
  return { success: true };
}

export async function getPendingRedemptions() {
  const { membership } = await requireFamily();

  const redemptions = await prisma.redemption.findMany({
    where: {
      status: "pending",
      reward: { familyId: membership.family_id },
    },
    include: {
      reward: true,
      redeemer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return redemptions.map((r) => ({
    id: r.id,
    reward_id: r.rewardId,
    redeemed_by: r.redeemedBy,
    status: r.status as "pending" | "approved" | "denied",
    approved_by: r.approvedBy,
    created_at: r.createdAt.toISOString(),
    resolved_at: r.resolvedAt?.toISOString() ?? null,
    reward: {
      id: r.reward.id,
      family_id: r.reward.familyId,
      name: r.reward.name,
      description: r.reward.description,
      points_cost: r.reward.pointsCost,
      active: r.reward.active,
      created_by: r.reward.createdBy,
      created_at: r.reward.createdAt.toISOString(),
    },
    redeemer: r.redeemer
      ? {
          id: r.redeemer.id,
          email: r.redeemer.email,
          name: r.redeemer.name,
          avatar_url: r.redeemer.avatarUrl,
          google_refresh_token: r.redeemer.googleRefreshToken,
          created_at: r.redeemer.createdAt.toISOString(),
        }
      : undefined,
  }));
}

export async function approveRedemption(redemptionId: string) {
  const { session, membership } = await requireFamily();

  if (membership.role === "child") {
    return { error: "Only parents can approve redemptions" };
  }

  const redemption = await prisma.redemption.update({
    where: { id: redemptionId },
    data: {
      status: "approved",
      approvedBy: session.user.id,
      resolvedAt: new Date(),
    },
    include: { reward: true },
  });

  // Notify the redeemer (push + email)
  notifyUser(redemption.redeemedBy, "rewardApprovals", {
    title: "Reward approved!",
    body: `Your "${redemption.reward.name}" reward was approved`,
    url: "/rewards",
  }).catch(() => {});

  revalidatePath("/rewards");
  return { success: true };
}

export async function denyRedemption(redemptionId: string) {
  const { session, membership } = await requireFamily();

  if (membership.role === "child") {
    return { error: "Only parents can deny redemptions" };
  }

  await prisma.redemption.update({
    where: { id: redemptionId },
    data: {
      status: "denied",
      approvedBy: session.user.id,
      resolvedAt: new Date(),
    },
  });

  revalidatePath("/rewards");
  return { success: true };
}

export async function getPointsBalance(userId: string): Promise<number> {
  const { membership } = await requireFamily();

  // Total earned from chore completions
  const completions = await prisma.choreCompletion.findMany({
    where: {
      completedBy: userId,
      chore: { familyId: membership.family_id },
    },
    include: { chore: { select: { points: true } } },
  });

  const earned = completions.reduce((sum, c) => sum + c.chore.points, 0);

  // Total spent on approved redemptions
  const redemptions = await prisma.redemption.findMany({
    where: {
      redeemedBy: userId,
      status: "approved",
      reward: { familyId: membership.family_id },
    },
    include: { reward: { select: { pointsCost: true } } },
  });

  const spent = redemptions.reduce((sum, r) => sum + r.reward.pointsCost, 0);

  // Pending redemptions (reserved but not yet approved)
  const pendingRedemptions = await prisma.redemption.findMany({
    where: {
      redeemedBy: userId,
      status: "pending",
      reward: { familyId: membership.family_id },
    },
    include: { reward: { select: { pointsCost: true } } },
  });

  const pending = pendingRedemptions.reduce(
    (sum, r) => sum + r.reward.pointsCost,
    0
  );

  return earned - spent - pending;
}
