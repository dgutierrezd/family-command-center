"use server";

import { prisma } from "@/lib/prisma";
import { requireFamily } from "@/lib/auth/session";
import { eventSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getEventsForRange(startDate: string, endDate: string) {
  const { membership } = await requireFamily();

  const events = await prisma.event.findMany({
    where: {
      familyId: membership.family_id,
      startTime: { gte: new Date(startDate) },
      endTime: { lte: new Date(endDate) },
    },
    orderBy: { startTime: "asc" },
  });

  return events.map((e) => ({
    id: e.id,
    family_id: e.familyId,
    title: e.title,
    description: e.description,
    start_time: e.startTime.toISOString(),
    end_time: e.endTime.toISOString(),
    all_day: e.allDay,
    recurrence_rule: e.recurrenceRule,
    google_event_id: e.googleEventId,
    color: e.color,
    created_by: e.createdBy,
    created_at: e.createdAt.toISOString(),
  }));
}

export async function createEvent(formData: FormData) {
  const { session, membership } = await requireFamily();

  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    all_day: formData.get("all_day") === "true",
    recurrence_rule: formData.get("recurrence_rule") || null,
    color: formData.get("color") || "blue",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.event.create({
    data: {
      familyId: membership.family_id,
      createdBy: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      startTime: new Date(parsed.data.start_time),
      endTime: new Date(parsed.data.end_time),
      allDay: parsed.data.all_day,
      recurrenceRule: parsed.data.recurrence_rule ?? null,
      color: parsed.data.color,
    },
  });

  revalidatePath("/calendar");
  return { success: true };
}

export async function updateEvent(eventId: string, formData: FormData) {
  const { membership } = await requireFamily();

  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    all_day: formData.get("all_day") === "true",
    recurrence_rule: formData.get("recurrence_rule") || null,
    color: formData.get("color") || "blue",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.event.updateMany({
    where: { id: eventId, familyId: membership.family_id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      startTime: new Date(parsed.data.start_time),
      endTime: new Date(parsed.data.end_time),
      allDay: parsed.data.all_day,
      recurrenceRule: parsed.data.recurrence_rule ?? null,
      color: parsed.data.color,
    },
  });

  revalidatePath("/calendar");
  return { success: true };
}

export async function deleteEvent(eventId: string) {
  const { membership } = await requireFamily();

  await prisma.event.deleteMany({
    where: { id: eventId, familyId: membership.family_id },
  });

  revalidatePath("/calendar");
  return { success: true };
}
