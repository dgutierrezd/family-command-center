import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getUserFamily } from "@/lib/auth/session";
import { syncGoogleEvents } from "@/lib/google/calendar";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getUserFamily(session.user.id);
  if (!membership) {
    return NextResponse.json({ error: "No family" }, { status: 400 });
  }

  const now = new Date();
  const timeMin = startOfMonth(now).toISOString();
  const timeMax = endOfMonth(addMonths(now, 2)).toISOString();

  try {
    const result = await syncGoogleEvents(
      session.user.id,
      membership.family_id,
      timeMin,
      timeMax
    );

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
