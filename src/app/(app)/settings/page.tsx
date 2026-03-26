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
import { LocationPicker } from "@/components/settings/location-picker";
import { NotificationPreferences } from "@/components/settings/notification-preferences";
import { getNotificationPreferences } from "@/actions/notifications";
import { DietaryPreferences } from "@/components/settings/dietary-preferences";
import { getFamilyPreferences } from "@/actions/preferences";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const { membership } = await requireFamily();
  const familyId = membership.family_id;
  const rawFamily = membership.families as Record<string, unknown>;
  const family = {
    id: rawFamily.id as string,
    name: rawFamily.name as string,
    invite_code: (rawFamily.inviteCode ?? rawFamily.invite_code) as string,
    created_at: String(rawFamily.createdAt ?? rawFamily.created_at ?? ""),
    latitude: (rawFamily.latitude ?? null) as number | null,
    longitude: (rawFamily.longitude ?? null) as number | null,
  };

  const [membersRaw, notifPrefs, dietaryPrefs] = await Promise.all([
    getFamilyMembers(familyId),
    getNotificationPreferences(),
    getFamilyPreferences(),
  ]);
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

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Enable push notifications to stay on top of events and chores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationPreferences initialPrefs={notifPrefs} />
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>
              Set your location for weather forecasts on the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LocationPicker
              initialLat={family.latitude}
              initialLng={family.longitude}
            />
          </CardContent>
        </Card>

        {/* Dietary Preferences */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Dietary Preferences</CardTitle>
            <CardDescription>
              Configure dietary needs and cuisine preferences for AI meal suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DietaryPreferences
              initialDietary={dietaryPrefs.dietary_restrictions}
              initialCuisines={dietaryPrefs.cuisine_preferences}
              initialHouseholdSize={dietaryPrefs.household_size}
            />
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
