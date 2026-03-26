import { requireFamily } from "@/lib/auth/session";
import { getFamilyMembers } from "@/actions/family";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FamilyMember, User } from "@/types";
import { CopyInviteCode } from "./copy-invite-code";
import { GoogleCalendarSync } from "./google-calendar-sync";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const { membership } = await requireFamily();
  const familyId = membership.family_id;
  const family = membership.families as unknown as {
    id: string;
    name: string;
    invite_code: string;
    created_at: string;
  };

  const membersRaw = await getFamilyMembers(familyId);
  const members = membersRaw as (FamilyMember & { user: User })[];

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Family Info */}
        <Card>
          <CardHeader>
            <CardTitle>Family</CardTitle>
            <CardDescription>
              Manage your family details and invite code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Family name
              </p>
              <p className="text-lg font-semibold">{family.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Invite code
              </p>
              <CopyInviteCode code={family.invite_code} />
            </div>
          </CardContent>
        </Card>

        {/* Google Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>
              Connect external services to your family.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleCalendarSync />
          </CardContent>
        </Card>

        {/* Members */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Family Members</CardTitle>
            <CardDescription>
              {members.length} member{members.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {members.map((m) => (
                <li
                  key={m.user_id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{m.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.user.email}
                    </p>
                  </div>
                  <Badge
                    variant={m.role === "admin" ? "default" : "secondary"}
                  >
                    {m.role}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
