export const bookingContent = {
  hostPage: {
    eventTypesHeading: "Wybierz rodzaj spotkania",
    minutesLabel: "min",
    bookButton: "Zarezerwuj",
  },

  calendar: {
    heading: "Wybierz datę",
    timezoneLabel: "Twoja strefa czasowa",
    noSlots: "Brak wolnych terminów w tym dniu.",
    loadingSlots: "Ładowanie...",
    back: "← Zmień datę",
  },

  slotList: {
    heading: "Dostępne godziny",
    selectPrompt: "Wybierz termin",
  },

  form: {
    heading: "Twoje dane",
    nameLabel: "Imię i nazwisko",
    namePlaceholder: "Jan Kowalski",
    emailLabel: "Adres e-mail",
    emailPlaceholder: "jan@example.com",
    notesLabel: "Uwagi (opcjonalnie)",
    notesPlaceholder: "Temat spotkania, pytania, dodatkowe informacje…",
    submit: "Zarezerwuj spotkanie",
    submitting: "Rezerwowanie…",
    back: "← Zmień termin",
  },

  success: {
    icon: "✓",
    heading: "Rezerwacja potwierdzona!",
    subheading:
      "Wysłaliśmy potwierdzenie na Twój adres e-mail razem z plikiem .ics. Kliknij go, żeby dodać spotkanie do kalendarza.",
    manageHeading: "Zarządzaj rezerwacją",
    manageDescription:
      "Możesz anulować lub przełożyć spotkanie w dowolnej chwili.",
    cancelLink: "Anuluj lub przełóż",
    newBooking: "Zarezerwuj kolejne spotkanie",
  },

  errors: {
    slotTaken: "Ten termin właśnie został zajęty. Wybierz inny.",
    generic: "Coś poszło nie tak. Spróbuj ponownie.",
  },
} as const;

export type BookingContent = typeof bookingContent;
