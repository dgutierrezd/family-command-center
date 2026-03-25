"use client";

import { useState } from "react";
import type { FamilyMember, User } from "@/types";
import { ChoreForm } from "@/components/chores/chore-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ChorePageActionsProps {
  members: (FamilyMember & { user: User })[];
}

export function ChorePageActions({ members }: ChorePageActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Add Chore
      </Button>
      <ChoreForm open={open} onOpenChange={setOpen} members={members} />
    </>
  );
}
