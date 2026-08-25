export const bookingManagementContent = {
  notFound: {
    heading: "Rezerwacja nie istnieje",
    description: "Link mógł wygasnąć albo rezerwacja została już anulowana.",
    homeLink: "Wróć na stronę główną",
  },

  detail: {
    heading: "Twoja rezerwacja",
    withLabel: "z",
    durationSuffix: "min",
    statusLabel: "Status",
    statusConfirmed: "Potwierdzona",
  },

  reschedule: {
    tabLabel: "Przesuń spotkanie",
    calendarHeading: "Wybierz nową datę",
    slotHeading: "Dostępne godziny",
    noSlots: "Brak wolnych terminów w tym dniu.",
    loading: "Ładowanie…",
    confirmButton: "Potwierdź nowy termin",
    confirming: "Zapisywanie…",
    successMessage: "Spotkanie zostało przełożone.",
  },

  cancel: {
    tabLabel: "Anuluj spotkanie",
    warning:
      "Tej operacji nie można cofnąć. Spotkanie zostanie anulowane, a Ty otrzymasz potwierdzenie e-mailem.",
    confirmButton: "Anuluj spotkanie",
    cancelling: "Anulowanie…",
    successMessage: "Spotkanie zostało anulowane.",
  },

  errors: {
    slotTaken: "Wybrany termin jest już zajęty. Spróbuj inny.",
    generic: "Coś poszło nie tak. Spróbuj ponownie.",
  },
} as const;

export type BookingManagementContent = typeof bookingManagementContent;
