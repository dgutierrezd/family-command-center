import { getServerSession } from "next-auth";
import { authOptions } from "./options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

export async function getUserFamily(userId: string) {
  const membership = await prisma.familyMember.findFirst({
    where: { userId },
    include: { family: true },
  });
  if (!membership) return null;
  return {
    family_id: membership.familyId,
    role: membership.role,
    families: membership.family,
  };
}

export async function requireFamily() {
  const session = await requireSession();
  const membership = await getUserFamily(session.user.id);
  if (!membership) {
    redirect("/setup");
  }
  return { session, membership };
}
