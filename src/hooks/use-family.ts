"use client";

import { createContext, useContext } from "react";
import type { Family, FamilyMember, User } from "@/types";

interface FamilyContextValue {
  family: Family;
  membership: FamilyMember;
  members: (FamilyMember & { user: User })[];
  userId: string;
}

export const FamilyContext = createContext<FamilyContextValue | null>(null);

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamily must be used within FamilyProvider");
  return ctx;
}
