import { requireFamily } from "@/lib/auth/session";
import {
  getRewards,
  getPendingRedemptions,
  getPointsBalance,
} from "@/actions/rewards";
import { RewardCard } from "@/components/rewards/reward-card";
import { RedemptionList } from "@/components/rewards/redemption-list";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star, Gift } from "lucide-react";
import { RewardsPageClient } from "./rewards-page-client";

export const metadata = {
  title: "Rewards",
};

export default async function RewardsPage() {
  const { session, membership } = await requireFamily();
  const isParent = membership.role !== "child";

  const [rewards, pending, balance] = await Promise.all([
    getRewards(),
    getPendingRedemptions(),
    getPointsBalance(session.user.id),
  ]);

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Rewards</h1>
        {isParent && <RewardsPageClient />}
      </div>

      {/* Points Balance */}
      <Card className="border-t-2 border-t-amber-400">
        <CardContent className="flex items-center gap-3 py-4">
          <Star className="size-6 text-amber-500" />
          <div>
            <p className="text-2xl font-bold">{balance} pts</p>
            <p className="text-xs text-muted-foreground">Your balance</p>
          </div>
        </CardContent>
      </Card>

      {/* Reward Store */}
      {rewards.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <Gift className="size-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            No rewards yet.{" "}
            {isParent
              ? "Create one to get started!"
              : "Ask a parent to set up rewards!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              balance={balance}
              canRedeem={true}
            />
          ))}
        </div>
      )}

      {/* Pending Approvals */}
      {(isParent || pending.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <RedemptionList redemptions={pending} isParent={isParent} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
