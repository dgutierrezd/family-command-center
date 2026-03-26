"use client";

import { useState, useTransition } from "react";
import { updateNotificationPreferences } from "@/actions/notifications";
import { usePushSubscription } from "@/hooks/use-push-subscription";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

interface NotificationPreferencesProps {
  initialPrefs: {
    event_reminders: boolean;
    chore_assignments: boolean;
    morning_digest: boolean;
    reward_approvals: boolean;
  };
}

const PREF_LABELS: Record<string, string> = {
  event_reminders: "Event reminders (30 min before)",
  chore_assignments: "Chore assignments",
  morning_digest: "Morning digest (7 AM)",
  reward_approvals: "Reward approvals",
};

export function NotificationPreferences({
  initialPrefs,
}: NotificationPreferencesProps) {
  const { isSubscribed, isSupported, subscribe, unsubscribe } =
    usePushSubscription();
  const [prefs, setPrefs] = useState(initialPrefs);
  const [isPending, startTransition] = useTransition();

  function handleTogglePush() {
    startTransition(async () => {
      if (isSubscribed) {
        await unsubscribe();
        toast.success("Notifications disabled");
      } else {
        const ok = await subscribe();
        if (ok) toast.success("Notifications enabled");
        else toast.error("Could not enable notifications");
      }
    });
  }

  function handlePrefChange(key: string, checked: boolean) {
    const newPrefs = { ...prefs, [key]: checked };
    setPrefs(newPrefs);

    const formData = new FormData();
    Object.entries(newPrefs).forEach(([k, v]) =>
      formData.set(k, String(v))
    );

    startTransition(async () => {
      await updateNotificationPreferences(formData);
    });
  }

  if (!isSupported) {
    return (
      <p className="text-sm text-muted-foreground">
        Push notifications are not supported in this browser.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        variant={isSubscribed ? "outline" : "default"}
        size="sm"
        onClick={handleTogglePush}
        disabled={isPending}
      >
        {isSubscribed ? (
          <>
            <BellOff className="size-4 mr-1.5" />
            Disable Notifications
          </>
        ) : (
          <>
            <Bell className="size-4 mr-1.5" />
            Enable Notifications
          </>
        )}
      </Button>

      {isSubscribed && (
        <div className="space-y-3">
          {Object.entries(PREF_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-3">
              <Checkbox
                checked={prefs[key as keyof typeof prefs]}
                onCheckedChange={(checked) =>
                  handlePrefChange(key, !!checked)
                }
                disabled={isPending}
              />
              <label className="text-sm">{label}</label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
