"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface UseRealtimeOptions {
  table: string;
  familyId: string;
  interval?: number;
  onInsert?: unknown;
  onUpdate?: unknown;
  onDelete?: unknown;
}

/**
 * Polls for updates by refreshing the router on an interval.
 * Replaces Supabase Realtime with simple polling — fine for family-sized apps.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRealtime<T = any>({
  interval = 5000,
}: UseRealtimeOptions) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, interval);

    return () => clearInterval(id);
  }, [router, interval]);
}
