"use client";

import { useTransition } from "react";
import { approveRedemption, denyRedemption } from "@/actions/rewards";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import type { Redemption } from "@/types";

interface RedemptionListProps {
  redemptions: Redemption[];
  isParent: boolean;
}

export function RedemptionList({
  redemptions,
  isParent,
}: RedemptionListProps) {
  if (redemptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No pending redemptions.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {redemptions.map((r) => (
        <RedemptionRow key={r.id} redemption={r} isParent={isParent} />
      ))}
    </div>
  );
}

function RedemptionRow({
  redemption,
  isParent,
}: {
  redemption: Redemption;
  isParent: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveRedemption(redemption.id);
      if (result.error) toast.error(result.error);
      else toast.success("Approved!");
    });
  }

  function handleDeny() {
    startTransition(async () => {
      const result = await denyRedemption(redemption.id);
      if (result.error) toast.error(result.error);
      else toast.success("Denied");
    });
  }

  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium">
          {redemption.redeemer?.name ?? "Unknown"} wants{" "}
          <span className="font-semibold">{redemption.reward?.name}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {redemption.reward?.points_cost} pts &middot;{" "}
          {new Date(redemption.created_at).toLocaleDateString()}
        </p>
      </div>
      {isParent && (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleApprove}
            disabled={isPending}
            className="text-emerald-600 hover:text-emerald-700"
          >
            <Check className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDeny}
            disabled={isPending}
            className="text-destructive hover:text-destructive"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
