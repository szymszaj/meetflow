import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export type BookingEmailData = {
  guestName: string;
  guestEmail: string;
  hostName: string;
  hostEmail: string;
  eventName: string;
  startTime: Date; // UTC
  endTime: Date; // UTC
  guestTimezone: string;
  hostTimezone: string;
  cancelUrl: string;
  rescheduleUrl: string;
  durationMinutes: number;
};

function formatInTz(date: Date, tz: string): string {
  return format(toZonedTime(date, tz), "EEEE, d MMMM yyyy 'o' HH:mm");
}

export function guestConfirmation(d: BookingEmailData) {
  const localTime = formatInTz(d.startTime, d.guestTimezone);

  return {
    subject: `Potwierdzone: ${d.eventName} z ${d.hostName}`,
    html: `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"><title>Potwierdzenie rezerwacji</title></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b">
  <h1 style="font-size:24px;font-weight:700;margin-bottom:4px">Spotkanie potwierdzone ✓</h1>
  <p style="color:#71717a;margin-top:0">Cześć ${d.guestName},</p>

  <table style="width:100%;border-radius:12px;background:#f4f4f5;padding:20px;margin:24px 0;border-spacing:0">
    <tr><td style="font-weight:600;padding:6px 0">${d.eventName}</td></tr>
    <tr><td style="color:#52525b;padding:6px 0">z ${d.hostName}</td></tr>
    <tr><td style="padding:6px 0">
      <strong>${localTime}</strong>
      <span style="color:#71717a;font-size:13px"> (${d.guestTimezone})</span>
    </td></tr>
    <tr><td style="color:#52525b;padding:6px 0">${d.durationMinutes} minut</td></tr>
  </table>

  <p style="color:#52525b;font-size:14px">
    W załączniku znajdziesz plik <strong>.ics</strong> — kliknij go, żeby dodać spotkanie do swojego kalendarza.
  </p>

  <p style="margin-top:32px;font-size:13px;color:#71717a">
    Musisz coś zmienić?<br>
    <a href="${d.rescheduleUrl}" style="color:#6366f1">Przesuń spotkanie</a>
    &nbsp;·&nbsp;
    <a href="${d.cancelUrl}" style="color:#ef4444">Anuluj</a>
  </p>

  <hr style="border:none;border-top:1px solid #e4e4e7;margin:32px 0">
  <p style="font-size:12px;color:#a1a1aa;text-align:center">meetflow · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#a1a1aa">meetflow.app</a></p>
</body>
</html>`,
  };
}

export function hostNotification(d: BookingEmailData) {
  const localTime = formatInTz(d.startTime, d.hostTimezone);

  return {
    subject: `Nowa rezerwacja: ${d.eventName} od ${d.guestName}`,
    html: `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"><title>Nowa rezerwacja</title></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b">
  <h1 style="font-size:24px;font-weight:700;margin-bottom:4px">Nowa rezerwacja</h1>
  <p style="color:#71717a;margin-top:0">Ktoś właśnie zarezerwował czas w Twoim kalendarzu.</p>

  <table style="width:100%;border-radius:12px;background:#f4f4f5;padding:20px;margin:24px 0;border-spacing:0">
    <tr><td style="font-weight:600;padding:6px 0">${d.eventName}</td></tr>
    <tr><td style="padding:6px 0">
      <strong>${localTime}</strong>
      <span style="color:#71717a;font-size:13px"> (${d.hostTimezone})</span>
    </td></tr>
    <tr><td style="color:#52525b;padding:6px 0">${d.durationMinutes} minut</td></tr>
    <tr><td style="padding:16px 0 6px;font-size:13px;color:#52525b">
      <strong>Klient:</strong> ${d.guestName} (${d.guestEmail})
    </td></tr>
  </table>

  <p style="font-size:14px;color:#52525b">
    Plik .ics w załączniku — dodaj spotkanie do kalendarza jednym kliknięciem.
  </p>

  <hr style="border:none;border-top:1px solid #e4e4e7;margin:32px 0">
  <p style="font-size:12px;color:#a1a1aa;text-align:center">meetflow · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#a1a1aa">meetflow.app</a></p>
</body>
</html>`,
  };
}

export function guestCancellationConfirmation(d: {
  guestName: string;
  eventName: string;
  hostName: string;
  startTime: Date;
  guestTimezone: string;
}) {
  const localTime = formatInTz(d.startTime, d.guestTimezone);
  return {
    subject: `Anulowane: ${d.eventName} z ${d.hostName}`,
    html: `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b">
  <h1 style="font-size:24px;font-weight:700">Rezerwacja anulowana</h1>
  <p>Cześć ${d.guestName},</p>
  <p>Twoja rezerwacja <strong>${d.eventName}</strong> z ${d.hostName} na <strong>${localTime}</strong> została anulowana.</p>
  <hr style="border:none;border-top:1px solid #e4e4e7;margin:32px 0">
  <p style="font-size:12px;color:#a1a1aa;text-align:center">meetflow</p>
</body>
</html>`,
  };
}
