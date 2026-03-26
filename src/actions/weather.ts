"use server";

import { prisma } from "@/lib/prisma";
import { requireFamily } from "@/lib/auth/session";
import { locationSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import type { WeatherData } from "@/types";

const weatherCache = new Map<
  string,
  { data: WeatherData; timestamp: number }
>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function getWeather(): Promise<WeatherData | null> {
  const { membership } = await requireFamily();
  const familyId = membership.family_id;

  const family = await prisma.family.findUnique({
    where: { id: familyId },
    select: { latitude: true, longitude: true },
  });

  if (!family?.latitude || !family?.longitude) {
    return null;
  }

  const cached = weatherCache.get(familyId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${family.latitude}&longitude=${family.longitude}&current=temperature_2m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto&forecast_days=3&temperature_unit=fahrenheit`;

  const res = await fetch(url);
  if (!res.ok) {
    return cached?.data ?? null;
  }

  const json = await res.json();

  const data: WeatherData = {
    current_temp: Math.round(json.current.temperature_2m),
    high: Math.round(json.daily.temperature_2m_max[0]),
    low: Math.round(json.daily.temperature_2m_min[0]),
    precipitation_probability: json.daily.precipitation_probability_max[0],
    weather_code: json.current.weather_code,
    forecast: json.daily.time.map((date: string, i: number) => ({
      date,
      high: Math.round(json.daily.temperature_2m_max[i]),
      low: Math.round(json.daily.temperature_2m_min[i]),
      precipitation_probability: json.daily.precipitation_probability_max[i],
      weather_code: json.daily.weather_code[i],
    })),
  };

  weatherCache.set(familyId, { data, timestamp: Date.now() });
  return data;
}

export async function updateFamilyLocation(latitude: number, longitude: number) {
  const { membership } = await requireFamily();

  const parsed = locationSchema.safeParse({ latitude, longitude });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.family.update({
    where: { id: membership.family_id },
    data: {
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
    },
  });

  // Clear weather cache for this family
  weatherCache.delete(membership.family_id);

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true };
}
