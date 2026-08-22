import { Resend } from "resend";
import { generateIcs } from "@/lib/ics";
import {
  guestConfirmation,
  hostNotification,
  guestCancellationConfirmation,
  type BookingEmailData,
} from "@/content/emails";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM ?? "meetflow <onboarding@resend.dev>";

export async function sendBookingConfirmations(data: BookingEmailData) {
  const icsContent = generateIcs({
    title: `${data.eventName} z ${data.hostName}`,
    description: `Spotkanie zarezerwowane przez meetflow`,
    startTime: data.startTime,
    endTime: data.endTime,
    hostName: data.hostName,
    hostEmail: data.hostEmail,
    guestName: data.guestName,
    guestEmail: data.guestEmail,
  });

  const icsAttachment = {
    filename: "spotkanie.ics",
    content: Buffer.from(icsContent).toString("base64"),
  };

  const guestEmail = guestConfirmation(data);
  const hostEmail = hostNotification(data);

  const results = await Promise.allSettled([
    resend.emails.send({
      from: FROM,
      to: data.guestEmail,
      subject: guestEmail.subject,
      html: guestEmail.html,
      attachments: [icsAttachment],
    }),
    resend.emails.send({
      from: FROM,
      to: data.hostEmail,
      subject: hostEmail.subject,
      html: hostEmail.html,
      attachments: [icsAttachment],
    }),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[mail] Failed to send email:", result.reason);
    }
  }
}

export async function sendCancellationEmail(params: {
  guestName: string;
  guestEmail: string;
  eventName: string;
  hostName: string;
  startTime: Date;
  guestTimezone: string;
}) {
  const content = guestCancellationConfirmation(params);
  const { error } = await resend.emails.send({
    from: FROM,
    to: params.guestEmail,
    subject: content.subject,
    html: content.html,
  });

  if (error) {
    console.error("[mail] Failed to send cancellation email:", error);
  }
}
