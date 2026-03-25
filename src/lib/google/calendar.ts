import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
}

async function getAuthenticatedClient(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { googleRefreshToken: true },
  });

  if (!user?.googleRefreshToken) return null;

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });

  return oauth2Client;
}

export async function fetchGoogleCalendarEvents(
  userId: string,
  timeMin: string,
  timeMax: string
) {
  const auth = await getAuthenticatedClient(userId);
  if (!auth) return [];

  const calendar = google.calendar({ version: "v3", auth });

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  });

  return (response.data.items ?? []).map((event) => ({
    googleEventId: event.id!,
    title: event.summary ?? "Untitled",
    description: event.description ?? null,
    startTime: new Date(event.start?.dateTime ?? event.start?.date ?? ""),
    endTime: new Date(event.end?.dateTime ?? event.end?.date ?? ""),
    allDay: !event.start?.dateTime,
    color: event.colorId ?? "blue",
  }));
}

export async function syncGoogleEvents(
  userId: string,
  familyId: string,
  timeMin: string,
  timeMax: string
) {
  const events = await fetchGoogleCalendarEvents(userId, timeMin, timeMax);
  if (events.length === 0) return { synced: 0 };

  let synced = 0;
  for (const event of events) {
    try {
      await prisma.event.upsert({
        where: { googleEventId: event.googleEventId },
        update: {
          title: event.title,
          description: event.description,
          startTime: event.startTime,
          endTime: event.endTime,
          allDay: event.allDay,
          color: event.color,
        },
        create: {
          familyId,
          createdBy: userId,
          ...event,
        },
      });
      synced++;
    } catch {
      // Skip events that fail to upsert
    }
  }

  return { synced };
}
