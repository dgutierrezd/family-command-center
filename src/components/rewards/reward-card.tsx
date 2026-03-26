"use client";

import { useTransition } from "react";
import { redeemReward } from "@/actions/rewards";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";
import type { Reward } from "@/types";

interface RewardCardProps {
  reward: Reward;
  balance: number;
  canRedeem: boolean;
}

export function RewardCard({ reward, balance, canRedeem }: RewardCardProps) {
  const [isPending, startTransition] = useTransition();
  const canAfford = balance >= reward.points_cost;

  function handleRedeem() {
    startTransition(async () => {
      const result = await redeemReward(reward.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Redemption requested! Waiting for approval.");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="size-4 text-amber-500" />
          {reward.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reward.description && (
          <p className="text-sm text-muted-foreground">{reward.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-amber-600">
            {reward.points_cost} pts
          </span>
          {canRedeem && (
            <Button
              size="sm"
              onClick={handleRedeem}
              disabled={isPending || !canAfford}
            >
              {isPending ? "..." : canAfford ? "Redeem" : "Not enough pts"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
