"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function GoogleCalendarSync() {
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/google-calendar/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to sync calendar");
      } else {
        toast.success("Calendar synced successfully");
      }
    } catch {
      toast.error("Failed to sync calendar");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Sync your Google Calendar events into the family calendar.
      </p>
      <Button variant="outline" onClick={handleSync} disabled={syncing}>
        <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Syncing..." : "Sync Google Calendar"}
      </Button>
    </div>
  );
}
