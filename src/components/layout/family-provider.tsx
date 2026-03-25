"use client";

import { FamilyContext } from "@/hooks/use-family";
import type { Family, FamilyMember, User } from "@/types";

interface FamilyProviderProps {
  family: Family;
  membership: FamilyMember;
  members: (FamilyMember & { user: User })[];
  userId: string;
  children: React.ReactNode;
}

export function FamilyProvider({
  family,
  membership,
  members,
  userId,
  children,
}: FamilyProviderProps) {
  return (
    <FamilyContext.Provider value={{ family, membership, members, userId }}>
      {children}
    </FamilyContext.Provider>
  );
}
