"use client";

import type { CalendarEvent } from "@/types";

interface EventChipProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  compact?: boolean;
}

export function EventChip({ event, onClick, compact = false }: EventChipProps) {
  const startTime = event.start_time
    ? new Date(event.start_time).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      className="flex w-full items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-left text-xs font-medium text-white transition-all duration-150 hover:opacity-85 hover:shadow-sm hover:scale-[1.02] active:scale-100"
      style={{ backgroundColor: event.color ?? "#6366f1" }}
      title={event.title}
    >
      {!compact && startTime && (
        <span className="shrink-0 opacity-90">{startTime}</span>
      )}
      <span className="truncate">{event.title}</span>
    </button>
  );
}
