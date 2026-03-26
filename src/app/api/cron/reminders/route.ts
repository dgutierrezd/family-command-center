import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notify";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const thirtyMinFromNow = new Date(now.getTime() + 30 * 60 * 1000);
  const fortyFiveMinFromNow = new Date(now.getTime() + 45 * 60 * 1000);

  // Find events starting in ~30 minutes (window: 30-45 min to avoid duplicates with 15 min cron)
  const events = await prisma.event.findMany({
    where: {
      startTime: {
        gte: thirtyMinFromNow,
        lt: fortyFiveMinFromNow,
      },
    },
    include: {
      family: {
        include: {
          members: true,
        },
      },
    },
  });

  let sent = 0;

  for (const event of events) {
    for (const member of event.family.members) {
      await notifyUser(member.userId, "eventReminders", {
        title: `Upcoming: ${event.title}`,
        body: `Starting in 30 minutes`,
        url: "/calendar",
      });
      sent++;
    }
  }

  return NextResponse.json({ success: true, sent });
}
