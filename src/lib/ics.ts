import { createEvent, type EventAttributes } from "ics";

export type IcsParams = {
  title: string;
  description: string;
  startTime: Date; // UTC
  endTime: Date; // UTC
  hostName: string;
  hostEmail: string;
  guestName: string;
  guestEmail: string;
};

export function generateIcs(params: IcsParams): string {
  const s = params.startTime;
  const e = params.endTime;

  const attrs: EventAttributes = {
    start: [
      s.getUTCFullYear(),
      s.getUTCMonth() + 1,
      s.getUTCDate(),
      s.getUTCHours(),
      s.getUTCMinutes(),
    ],
    startInputType: "utc",
    end: [
      e.getUTCFullYear(),
      e.getUTCMonth() + 1,
      e.getUTCDate(),
      e.getUTCHours(),
      e.getUTCMinutes(),
    ],
    endInputType: "utc",
    title: params.title,
    description: params.description,
    organizer: { name: params.hostName, email: params.hostEmail },
    attendees: [
      {
        name: params.guestName,
        email: params.guestEmail,
        rsvp: true,
        partstat: "ACCEPTED",
      },
    ],
  };

  const { error, value } = createEvent(attrs);
  if (error || !value) {
    throw new Error(`ICS generation failed: ${error?.message}`);
  }
  return value;
}
