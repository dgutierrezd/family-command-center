import { getEventsForRange } from "@/actions/events";
import { requireFamily } from "@/lib/auth/session";
import { CalendarView } from "@/components/calendar/calendar-view";
import { GoogleSyncButton } from "@/components/calendar/google-sync-button";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";

export default async function CalendarPage() {
  const { membership } = await requireFamily();
  const now = new Date();
  const rangeStart = startOfWeek(startOfMonth(now));
  const rangeEnd = endOfWeek(endOfMonth(now));

  const events = await getEventsForRange(
    rangeStart.toISOString(),
    rangeEnd.toISOString()
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Calendar</h1>
        <GoogleSyncButton />
      </div>

      <CalendarView events={events} familyId={membership.family_id} />
    </div>
  );
}
