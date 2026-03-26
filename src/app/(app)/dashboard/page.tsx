import { requireFamily } from "@/lib/auth/session";
import { getEventsForRange } from "@/actions/events";
import { getMealsForWeek } from "@/actions/meals";
import { getChoresWithCompletions } from "@/actions/chores";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { startOfDay, endOfDay, format } from "date-fns";
import Link from "next/link";
import {
  CalendarDays,
  UtensilsCrossed,
  ListChecks,
  Plus,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { session, membership } = await requireFamily();
  const family = membership.families as unknown as {
    id: string;
    name: string;
  };

  const today = new Date();
  const dayStart = startOfDay(today).toISOString();
  const dayEnd = endOfDay(today).toISOString();
  const todayStr = format(today, "yyyy-MM-dd");

  const [events, meals, chores] = await Promise.all([
    getEventsForRange(dayStart, dayEnd),
    getMealsForWeek(todayStr, todayStr),
    getChoresWithCompletions(),
  ]);

  const pendingChores = chores.filter(
    (c) => !c.completions || c.completions.length === 0
  );

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Welcome, {session.user.name ?? "there"}!
        </h1>
        <p className="text-muted-foreground">
          {family.name} &mdash; {format(today, "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/calendar" className={cn(buttonVariants({ size: "sm" }))}>
          <Plus className="size-3.5" />
          Add Event
        </Link>
        <Link href="/meals" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          <Plus className="size-3.5" />
          Plan Meal
        </Link>
        <Link href="/chores" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          <Plus className="size-3.5" />
          Add Chore
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Events */}
        <Card className="border-t-2 border-t-indigo-400">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4 text-indigo-500" />
              Today&apos;s Events
            </CardTitle>
            <Link href="/calendar" className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}>
              <ArrowRight className="size-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <CalendarDays className="size-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No events today -- enjoy the free time!</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {events.slice(0, 5).map((event) => (
                  <li key={event.id} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.all_day
                          ? "All day"
                          : `${format(new Date(event.start_time), "h:mm a")} - ${format(new Date(event.end_time), "h:mm a")}`}
                      </p>
                    </div>
                  </li>
                ))}
                {events.length > 5 && (
                  <li>
                    <Link href="/calendar" className="text-xs font-medium text-primary hover:underline">
                      View all {events.length} events
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Today's Meals */}
        <Card className="border-t-2 border-t-emerald-400">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="size-4 text-emerald-500" />
              Today&apos;s Meals
            </CardTitle>
            <Link href="/meals" className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}>
              <ArrowRight className="size-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {meals.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <UtensilsCrossed className="size-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No meals planned yet. What sounds good?</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {meals.slice(0, 5).map((meal) => (
                  <li key={meal.id} className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase text-muted-foreground w-16 shrink-0">
                      {meal.meal_type}
                    </span>
                    <p className="truncate text-sm">{meal.name}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Chores Due */}
        <Card className="border-t-2 border-t-amber-400">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="size-4 text-amber-500" />
              Chores Due
            </CardTitle>
            <Link href="/chores" className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}>
              <ArrowRight className="size-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {pendingChores.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <ListChecks className="size-8 text-emerald-400" />
                <p className="text-sm text-emerald-600 font-medium">All done for today -- great job!</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {pendingChores.slice(0, 5).map((chore) => (
                  <li key={chore.id} className="flex items-center gap-2">
                    <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
                    <p className="truncate text-sm">{chore.title}</p>
                    {chore.assignee && (
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                        {(chore.assignee as unknown as { name: string }).name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
