"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function GoogleSyncButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSync() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/google-calendar/sync", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Sync failed");
      }

      toast.success("Google Calendar synced successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to sync Google Calendar"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleSync}
      disabled={isLoading}
      className="gap-2"
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
          fill="currentColor"
        />
      </svg>
      {isLoading ? "Syncing..." : "Sync Google Calendar"}
    </Button>
  );
}
