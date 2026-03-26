import { getChoresWithCompletions, getPointsTally } from "@/actions/chores";
import { getFamilyMembers } from "@/actions/family";
import { requireFamily } from "@/lib/auth/session";
import { ChoreList } from "@/components/chores/chore-list";
import { ChorePageActions } from "./chore-page-actions";
import { PointsBoard } from "@/components/chores/points-board";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FamilyMember, User } from "@/types";

export const metadata = {
  title: "Chores",
};

export default async function ChoresPage() {
  const { membership } = await requireFamily();
  const familyId = membership.family_id;

  const [chores, tally, membersRaw] = await Promise.all([
    getChoresWithCompletions(),
    getPointsTally(),
    getFamilyMembers(familyId),
  ]);

  const members = membersRaw as (FamilyMember & { user: User })[];

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Chores</h1>
        <ChorePageActions members={members} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Chores</CardTitle>
          </CardHeader>
          <CardContent>
            <ChoreList
              chores={chores}
              members={members}
              familyId={familyId}
            />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <PointsBoard tally={tally} members={members} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
