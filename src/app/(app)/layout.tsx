import { requireFamily } from "@/lib/auth/session";
import { getFamilyMembers } from "@/actions/family";
import { SessionProvider } from "@/components/layout/session-provider";
import { FamilyProvider } from "@/components/layout/family-provider";
import { AppNav } from "@/components/layout/app-nav";
import { Toaster } from "@/components/ui/sonner";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, membership } = await requireFamily();
  const familyId = membership.family_id;
  // Prisma returns camelCase — normalize to snake_case for the frontend types
  const rawFamily = membership.families as Record<string, unknown>;
  const family = {
    id: rawFamily.id as string,
    name: rawFamily.name as string,
    invite_code: (rawFamily.inviteCode ?? rawFamily.invite_code) as string,
    created_at: String(rawFamily.createdAt ?? rawFamily.created_at ?? ""),
  };
  const members = await getFamilyMembers(familyId);

  return (
    <SessionProvider>
      <FamilyProvider
        family={family}
        membership={{
          family_id: membership.family_id,
          user_id: session.user.id,
          role: membership.role as "admin" | "member" | "child",
          joined_at: "",
        }}
        members={members as never}
        userId={session.user.id}
      >
        <AppNav>{children}</AppNav>
        <Toaster richColors position="bottom-center" />
      </FamilyProvider>
    </SessionProvider>
  );
}
