// All copy for the host dashboard.

export const dashboardContent = {
  nav: {
    brand: "meetflow",
    overview: "Przegląd",
    bookings: "Rezerwacje",
    eventTypes: "Typy spotkań",
    availability: "Dostępność",
    settings: "Ustawienia",
    signOut: "Wyloguj",
  },

  overview: {
    heading: "Dzień dobry",
    stats: {
      upcoming: "Nadchodzące",
      thisWeek: "W tym tygodniu",
      total: "Łącznie",
    },
    upcomingHeading: "Najbliższe spotkania",
    emptyUpcoming: "Brak nadchodzących rezerwacji.",
    viewAll: "Zobacz wszystkie",
  },

  bookings: {
    heading: "Rezerwacje",
    columns: {
      guest: "Gość",
      event: "Typ spotkania",
      date: "Data i godzina",
      status: "Status",
      actions: "Akcje",
    },
    statusConfirmed: "Potwierdzona",
    statusCancelled: "Anulowana",
    statusRescheduled: "Przełożona",
    empty: "Brak rezerwacji.",
    cancelButton: "Anuluj",
    cancelConfirm: "Anulować tę rezerwację?",
  },

  eventTypes: {
    heading: "Typy spotkań",
    newButton: "Nowy typ",
    minutesSuffix: "min",
    activeLabel: "Aktywny",
    inactiveLabel: "Nieaktywny",
    editButton: "Edytuj",
    deleteButton: "Usuń",
    deleteConfirm: "Usunąć ten typ spotkania? Tej operacji nie można cofnąć.",
    empty: "Nie masz jeszcze żadnych typów spotkań.",
    publicLinkLabel: "Twój link",
  },

  eventTypeForm: {
    headingNew: "Nowy typ spotkania",
    headingEdit: "Edytuj typ spotkania",
    nameLabel: "Nazwa",
    namePlaceholder: "np. Konsultacja 30 min",
    slugLabel: "Slug (część URL)",
    slugPlaceholder: "konsultacja-30min",
    descriptionLabel: "Opis (opcjonalnie)",
    descriptionPlaceholder: "Krótki opis czego dotyczy spotkanie…",
    durationLabel: "Czas trwania (minuty)",
    colorLabel: "Kolor",
    saveButton: "Zapisz",
    saving: "Zapisywanie…",
    cancelButton: "Anuluj",
  },

  availability: {
    heading: "Dostępność",
    subheading:
      "Ustaw godziny w jakich jesteś dostępny w każdy dzień tygodnia.",
    days: {
      MONDAY: "Poniedziałek",
      TUESDAY: "Wtorek",
      WEDNESDAY: "Środa",
      THURSDAY: "Czwartek",
      FRIDAY: "Piątek",
      SATURDAY: "Sobota",
      SUNDAY: "Niedziela",
    },
    fromLabel: "Od",
    toLabel: "Do",
    saveButton: "Zapisz dostępność",
    saving: "Zapisywanie…",
    savedMessage: "Dostępność zapisana.",
    exceptionsHeading: "Wyjątki",
    exceptionsSubheading:
      "Zablokuj konkretny dzień (urlop) lub ustaw niestandardowe godziny.",
    addExceptionButton: "Dodaj wyjątek",
    exceptionDateLabel: "Data",
    exceptionTypeLabel: "Typ",
    exceptionTypeBlocked: "Dzień wolny",
    exceptionTypeCustom: "Niestandardowe godziny",
    exceptionFromLabel: "Od",
    exceptionToLabel: "Do",
    addButton: "Dodaj",
    deleteExceptionButton: "Usuń",
    noExceptions: "Brak wyjątków.",
  },

  settings: {
    heading: "Ustawienia konta",
    slugLabel: "Twój slug (publiczny URL)",
    slugPrefix: "meetflow.app/",
    timezoneLabel: "Strefa czasowa",
    bufferLabel: "Bufor po spotkaniu (minuty)",
    bufferHelp: "Czas przerwy między spotkaniami.",
    windowLabel: "Okno rezerwacji (dni)",
    windowHelp: "Jak daleko w przyszłość klienci mogą rezerwować.",
    saveButton: "Zapisz ustawienia",
    saving: "Zapisywanie…",
    savedMessage: "Ustawienia zapisane.",
  },
} as const;

export type DashboardContent = typeof dashboardContent;
