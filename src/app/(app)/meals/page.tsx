import Link from "next/link";
import { getMealsForWeek } from "@/actions/meals";
import { MealGrid } from "@/components/meals/meal-grid";
import { GenerateListButton } from "@/components/meals/generate-list-button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

function getMonday(dateStr?: string): Date {
  const d = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatWeekLabel(monday: Date): string {
  const sunday = addDays(monday, 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${monday.toLocaleDateString("en-US", opts)} - ${sunday.toLocaleDateString("en-US", opts)}`;
}

export default async function MealsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const weekParam = typeof params.week === "string" ? params.week : undefined;

  const monday = getMonday(weekParam);
  const sunday = addDays(monday, 6);
  const weekStart = formatDate(monday);
  const weekEnd = formatDate(sunday);

  const prevWeek = formatDate(addDays(monday, -7));
  const nextWeek = formatDate(addDays(monday, 7));

  const meals = await getMealsForWeek(weekStart, weekEnd);

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Meal Planner</h1>
        <GenerateListButton weekStart={weekStart} weekEnd={weekEnd} />
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={`/meals?week=${prevWeek}`}
          className="inline-flex items-center justify-center size-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
        >
          <ChevronLeftIcon />
        </Link>
        <span className="text-base font-semibold">
          {formatWeekLabel(monday)}
        </span>
        <Link
          href={`/meals?week=${nextWeek}`}
          className="inline-flex items-center justify-center size-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
        >
          <ChevronRightIcon />
        </Link>
      </div>

      <MealGrid meals={meals} weekStart={weekStart} />
    </div>
  );
}
