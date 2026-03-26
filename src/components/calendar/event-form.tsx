"use client";

import { useState, useTransition } from "react";
import type { CalendarEvent } from "@/types";
import { createEvent, updateEvent, deleteEvent } from "@/actions/events";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const PRESET_COLORS = [
  { label: "Indigo", value: "#6366f1" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Emerald", value: "#10b981" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Sky", value: "#0ea5e9" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Pink", value: "#ec4899" },
  { label: "Teal", value: "#14b8a6" },
];

interface EventFormProps {
  event?: CalendarEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
}

export function EventForm({
  event,
  open,
  onOpenChange,
  defaultDate,
}: EventFormProps) {
  const isEditing = !!event;
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [startDate, setStartDate] = useState(
    event?.start_time
      ? new Date(event.start_time).toISOString().slice(0, 10)
      : (defaultDate ?? new Date().toISOString().slice(0, 10))
  );
  const [startTime, setStartTime] = useState(
    event?.start_time
      ? new Date(event.start_time).toISOString().slice(11, 16)
      : "09:00"
  );
  const [endDate, setEndDate] = useState(
    event?.end_time
      ? new Date(event.end_time).toISOString().slice(0, 10)
      : (defaultDate ?? new Date().toISOString().slice(0, 10))
  );
  const [endTime, setEndTime] = useState(
    event?.end_time
      ? new Date(event.end_time).toISOString().slice(11, 16)
      : "10:00"
  );
  const [allDay, setAllDay] = useState(event?.all_day ?? false);
  const [color, setColor] = useState(event?.color ?? PRESET_COLORS[0].value);
  const [recurrence, setRecurrence] = useState(
    event?.recurrence_rule ?? "none"
  );

  function resetForm() {
    setTitle("");
    setDescription("");
    setStartDate(defaultDate ?? new Date().toISOString().slice(0, 10));
    setStartTime("09:00");
    setEndDate(defaultDate ?? new Date().toISOString().slice(0, 10));
    setEndTime("10:00");
    setAllDay(false);
    setColor(PRESET_COLORS[0].value);
    setRecurrence("none");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const fd = new FormData();
    fd.set("title", title);
    fd.set("description", description || "");
    fd.set("start_time", allDay ? `${startDate}T00:00:00` : `${startDate}T${startTime}:00`);
    fd.set("end_time", allDay ? `${endDate}T23:59:59` : `${endDate}T${endTime}:00`);
    fd.set("all_day", String(allDay));
    fd.set("color", color);
    fd.set("recurrence_rule", recurrence === "none" ? "" : recurrence);

    startTransition(async () => {
      if (isEditing && event) {
        await updateEvent(event.id, fd);
      } else {
        await createEvent(fd);
      }
      resetForm();
      onOpenChange(false);
    });
  }

  function handleDelete() {
    if (!event) return;
    startTransition(async () => {
      await deleteEvent(event.id);
      resetForm();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Event" : "New Event"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="event-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="event-description"
              className="text-sm font-medium"
            >
              Description
            </label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="all-day"
              checked={allDay}
              onCheckedChange={(checked) => setAllDay(checked === true)}
            />
            <label htmlFor="all-day" className="text-sm font-medium">
              All day
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="start-date" className="text-sm font-medium">
                Start date
              </label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            {!allDay && (
              <div className="space-y-2">
                <label htmlFor="start-time" className="text-sm font-medium">
                  Start time
                </label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="end-date" className="text-sm font-medium">
                End date
              </label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            {!allDay && (
              <div className="space-y-2">
                <label htmlFor="end-time" className="text-sm font-medium">
                  End time
                </label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Color</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className="h-8 w-8 rounded-full border-2 transition-all duration-150 hover:scale-115 hover:shadow-md active:scale-100"
                  style={{
                    backgroundColor: c.value,
                    borderColor:
                      color === c.value ? "white" : "transparent",
                    boxShadow:
                      color === c.value
                        ? `0 0 0 2px ${c.value}`
                        : "none",
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Recurrence</label>
            <Select value={recurrence} onValueChange={(v) => v && setRecurrence(v)}>
              <SelectTrigger>
                <SelectValue placeholder="No recurrence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                Delete
              </Button>
            )}
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Update Event"
                  : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
