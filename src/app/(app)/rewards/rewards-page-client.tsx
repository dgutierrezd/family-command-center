"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RewardForm } from "@/components/rewards/reward-form";

export function RewardsPageClient() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="size-4 mr-1.5" />
        New Reward
      </Button>
      <RewardForm open={open} onOpenChange={setOpen} />
    </>
  );
}
