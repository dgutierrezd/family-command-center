import type { WeatherData } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CloudSun } from "lucide-react";
import Link from "next/link";

function weatherCodeToLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

function weatherCodeToIcon(code: number): string {
  if (code === 0) return "\u2600\uFE0F";
  if (code <= 2) return "\u26C5";
  if (code === 3) return "\u2601\uFE0F";
  if (code <= 48) return "\uD83C\uDF2B\uFE0F";
  if (code <= 57) return "\uD83C\uDF26\uFE0F";
  if (code <= 67) return "\uD83C\uDF27\uFE0F";
  if (code <= 77) return "\u2744\uFE0F";
  if (code <= 82) return "\uD83C\uDF26\uFE0F";
  if (code <= 86) return "\uD83C\uDF28\uFE0F";
  if (code <= 99) return "\u26C8\uFE0F";
  return "\uD83C\uDF24\uFE0F";
}

function formatDay(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = date.getTime() - today.getTime();
  const daysDiff = Math.round(diff / (1000 * 60 * 60 * 24));
  if (daysDiff === 0) return "Today";
  if (daysDiff === 1) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function WeatherCard({ weather }: { weather: WeatherData | null }) {
  if (!weather) {
    return (
      <Card className="border-t-2 border-t-sky-400">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudSun className="size-4 text-sky-500" />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-4">
            <CloudSun className="size-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No location set.{" "}
              <Link href="/settings" className="text-primary hover:underline">
                Add your location
              </Link>{" "}
              to see the forecast.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-t-2 border-t-sky-400">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <CloudSun className="size-4 text-sky-500" />
          Weather
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current conditions */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{weatherCodeToIcon(weather.weather_code)}</span>
          <div>
            <p className="text-2xl font-bold">{weather.current_temp}&deg;F</p>
            <p className="text-xs text-muted-foreground">
              {weatherCodeToLabel(weather.weather_code)} &middot; H:{weather.high}&deg; L:{weather.low}&deg;
            </p>
          </div>
          {weather.precipitation_probability > 0 && (
            <div className="ml-auto text-right">
              <p className="text-sm font-medium text-sky-600">
                {weather.precipitation_probability}%
              </p>
              <p className="text-[10px] text-muted-foreground">precip</p>
            </div>
          )}
        </div>

        {/* 3-day forecast */}
        <div className="flex gap-2">
          {weather.forecast.map((day) => (
            <div
              key={day.date}
              className="flex-1 rounded-lg bg-muted/50 p-2 text-center"
            >
              <p className="text-[10px] font-medium text-muted-foreground">
                {formatDay(day.date)}
              </p>
              <p className="text-lg">{weatherCodeToIcon(day.weather_code)}</p>
              <p className="text-xs font-medium">
                {day.high}&deg;
                <span className="text-muted-foreground"> {day.low}&deg;</span>
              </p>
              {day.precipitation_probability > 0 && (
                <p className="text-[10px] text-sky-600">
                  {day.precipitation_probability}%
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
