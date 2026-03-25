"use server";

import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { requireSession, getUserFamily } from "@/lib/auth/session";
import { createFamilySchema, joinFamilySchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function createFamily(formData: FormData) {
  const session = await requireSession();
  const parsed = createFamilySchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const inviteCode = nanoid(8);

  const family = await prisma.family.create({
    data: { name: parsed.data.name, inviteCode },
  });

  await prisma.familyMember.create({
    data: {
      familyId: family.id,
      userId: session.user.id,
      role: "admin",
    },
  });

  revalidatePath("/dashboard");
  return { success: true, familyId: family.id };
}

export async function joinFamily(formData: FormData) {
  const session = await requireSession();
  const parsed = joinFamilySchema.safeParse({
    inviteCode: formData.get("inviteCode"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await getUserFamily(session.user.id);
  if (existing) return { error: "You already belong to a family" };

  const family = await prisma.family.findUnique({
    where: { inviteCode: parsed.data.inviteCode },
  });

  if (!family) return { error: "Invalid invite code" };

  await prisma.familyMember.create({
    data: {
      familyId: family.id,
      userId: session.user.id,
      role: "member",
    },
  });

  revalidatePath("/dashboard");
  return { success: true, familyId: family.id };
}

export async function joinFamilyByCode(code: string) {
  const formData = new FormData();
  formData.set("inviteCode", code);
  return joinFamily(formData);
}

export async function getFamilyMembers(familyId: string) {
  const members = await prisma.familyMember.findMany({
    where: { familyId },
    include: { user: true },
  });
  return members.map((m) => ({
    family_id: m.familyId,
    user_id: m.userId,
    role: m.role,
    joined_at: m.joinedAt.toISOString(),
    user: {
      id: m.user.id,
      email: m.user.email,
      name: m.user.name,
      avatar_url: m.user.avatarUrl,
      google_refresh_token: m.user.googleRefreshToken,
      created_at: m.user.createdAt.toISOString(),
    },
  }));
}
