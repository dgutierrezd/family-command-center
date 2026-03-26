import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notify";
import { startOfDay, endOfDay, format } from "date-fns";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cleanup: delete old checked grocery items
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  await prisma.groceryItem.deleteMany({
    where: {
      checked: true,
      createdAt: { lt: sevenDaysAgo },
    },
  });

  // Morning digest
  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);
  const todayStr = format(today, "yyyy-MM-dd");

  const families = await prisma.family.findMany({
    include: {
      members: { select: { userId: true } },
      events: {
        where: { startTime: { gte: dayStart, lte: dayEnd } },
        select: { title: true },
      },
      meals: {
        where: { date: todayStr },
        select: { name: true, mealType: true },
      },
      chores: {
        select: { title: true, assignedTo: true },
      },
    },
  });

  let digestsSent = 0;

  for (const family of families) {
    const eventCount = family.events.length;
    const mealCount = family.meals.length;
    const choreCount = family.chores.length;

    if (eventCount === 0 && mealCount === 0 && choreCount === 0) continue;

    const parts: string[] = [];
    if (eventCount > 0)
      parts.push(`${eventCount} event${eventCount > 1 ? "s" : ""}`);
    if (mealCount > 0)
      parts.push(`${mealCount} meal${mealCount > 1 ? "s" : ""} planned`);
    if (choreCount > 0)
      parts.push(`${choreCount} chore${choreCount > 1 ? "s" : ""}`);

    const body = parts.join(", ");

    for (const member of family.members) {
      await notifyUser(member.userId, "morningDigest", {
        title: `Good morning! Here's your day`,
        body,
        url: "/dashboard",
      });
      digestsSent++;
    }
  }

  return NextResponse.json({ success: true, digestsSent });
}
