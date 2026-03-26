"use client";

import { useState, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
  getHours,
  getMinutes,
  differenceInMinutes,
  parseISO,
} from "date-fns";
import type { CalendarEvent } from "@/types";
import { useRealtime } from "@/hooks/use-realtime";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EventChip } from "./event-chip";
import { EventForm } from "./event-form";

type View = "month" | "week";

interface CalendarViewProps {
  events: CalendarEvent[];
  familyId: string;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function CalendarView({ events, familyId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>("month");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(
    undefined
  );
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  );

  // Poll for updates
  useRealtime({ table: "events", familyId });

  // Navigation helpers
  const goForward = useCallback(() => {
    setCurrentDate((d) => (view === "month" ? addMonths(d, 1) : addWeeks(d, 1)));
  }, [view]);

  const goBack = useCallback(() => {
    setCurrentDate((d) => (view === "month" ? subMonths(d, 1) : subWeeks(d, 1)));
  }, [view]);

  const goToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Event handlers
  function handleDayClick(date: Date) {
    setSelectedEvent(undefined);
    setSelectedDate(format(date, "yyyy-MM-dd"));
    setFormOpen(true);
  }

  function handleEventClick(event: CalendarEvent) {
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setFormOpen(true);
  }

  // Compute days for month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Compute days for week view
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  function getEventsForDay(day: Date) {
    return events.filter((event) => {
      const eventStart = parseISO(event.start_time);
      return isSameDay(eventStart, day);
    });
  }

  // Determine the header label
  const headerLabel =
    view === "month"
      ? format(currentDate, "MMMM yyyy")
      : `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goBack}>
            &larr;
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goForward}>
            &rarr;
          </Button>
          <h2 className="ml-2 text-lg font-semibold">{headerLabel}</h2>
        </div>

        <Tabs
          value={view}
          onValueChange={(v) => setView(v as View)}
        >
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Month View */}
      {view === "month" && (
        <div className="overflow-hidden rounded-lg border">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b bg-muted/50">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {monthDays.map((day) => {
              const dayEvents = getEventsForDay(day);
              const inMonth = isSameMonth(day, currentDate);
              const today = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`flex min-h-24 flex-col border-b border-r p-1 text-left transition-all duration-150 hover:bg-accent/40 hover:shadow-sm ${
                    !inMonth ? "bg-muted/10 text-muted-foreground/50" : ""
                  }`}
                >
                  <span
                    className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      today
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {dayEvents.slice(0, 3).map((event) => (
                      <EventChip
                        key={event.id}
                        event={event}
                        onClick={handleEventClick}
                        compact
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="px-1 text-xs text-primary font-medium">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === "week" && (
        <div className="overflow-auto rounded-lg border">
          {/* Day headers */}
          <div className="sticky top-0 z-10 grid grid-cols-[4rem_repeat(7,1fr)] border-b bg-background">
            <div className="border-r" />
            {weekDays.map((day) => {
              const today = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className="border-r px-2 py-2 text-center transition-colors hover:bg-muted/30"
                >
                  <div className="text-xs text-muted-foreground">
                    {format(day, "EEE")}
                  </div>
                  <div
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      today
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hour rows */}
          <div className="relative grid grid-cols-[4rem_repeat(7,1fr)]">
            {HOURS.map((hour) => (
              <div key={hour} className="col-span-full grid grid-cols-subgrid">
                {/* Time label */}
                <div className="flex h-14 items-start justify-end border-r pr-2 pt-0.5 text-xs text-muted-foreground">
                  {hour === 0 ? "" : format(new Date().setHours(hour, 0), "h a")}
                </div>
                {/* Day columns for this hour */}
                {weekDays.map((day) => (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="relative h-14 border-b border-r"
                  >
                    {getEventsForDay(day)
                      .filter((event) => {
                        const eventStart = parseISO(event.start_time);
                        return getHours(eventStart) === hour;
                      })
                      .map((event) => {
                        const eventStart = parseISO(event.start_time);
                        const eventEnd = event.end_time
                          ? parseISO(event.end_time)
                          : eventStart;
                        const topOffset =
                          (getMinutes(eventStart) / 60) * 56; // 56px = h-14
                        const duration = Math.max(
                          differenceInMinutes(eventEnd, eventStart),
                          30
                        );
                        const height = (duration / 60) * 56;

                        return (
                          <div
                            key={event.id}
                            className="absolute inset-x-0.5 z-10 overflow-hidden rounded px-1 py-0.5 text-xs font-medium text-white"
                            style={{
                              top: `${topOffset}px`,
                              height: `${Math.min(height, 224)}px`,
                              backgroundColor: event.color ?? "#6366f1",
                            }}
                          >
                            <button
                              type="button"
                              className="h-full w-full text-left"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                            >
                              <div className="truncate">{event.title}</div>
                              <div className="truncate opacity-80">
                                {format(eventStart, "h:mm a")}
                              </div>
                            </button>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event create/edit dialog */}
      <EventForm
        key={selectedEvent?.id ?? selectedDate ?? "new"}
        event={selectedEvent}
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultDate={selectedDate}
      />
    </div>
  );
}
