export const homeContent = {
  nav: {
    logo: "meetflow",
    cta: "Zaloguj się",
  },

  hero: {
    badge: "Darmowy do 100 rezerwacji",
    heading: "Rezerwacje bez zamieszania",
    subheading:
      "Ustaw swoje godziny, udostępnij link — resztą zajmie się meetflow. Automatyczne potwierdzenia, plik .ics w mailu i zerowy nakład z Twojej strony.",
    ctaPrimary: "Zacznij za darmo",
    ctaSecondary: "Zobacz demo",
  },

  features: {
    heading: "Wszystko czego potrzebujesz",
    subheading: "Zaprojektowane dla konsultantów, coachów i freelancerów.",
    items: [
      {
        icon: "calendar",
        title: "Twoje godziny, Twoje zasady",
        description:
          "Ustaw dostępność raz — na każdy dzień tygodnia osobno. Dodaj wyjątki na urlopy albo niestandardowe godziny w konkretnym dniu.",
      },
      {
        icon: "globe",
        title: "Strefy czasowe bez bólu głowy",
        description:
          "Klient widzi sloty w swojej strefie czasowej. Ty widzisz w swojej. Konwersja odbywa się automatycznie.",
      },
      {
        icon: "zap",
        title: "Żadnych podwójnych rezerwacji",
        description:
          "Jeśli dwóch klientów kliknie ten sam slot jednocześnie, tylko jeden dostanie potwierdzenie. Gwarantuje to baza danych, nie kod.",
      },
      {
        icon: "mail",
        title: "Potwierdzenia z plikiem .ics",
        description:
          "Oboje otrzymujecie e-mail z potwierdzeniem i załącznikiem .ics. Jedno kliknięcie i spotkanie ląduje w kalendarzu.",
      },
      {
        icon: "refresh",
        title: "Anulowanie i przełożenie",
        description:
          "Klient może anulować lub przełożyć rezerwację bez kontaktu z Tobą — przez unikalny link w mailu.",
      },
      {
        icon: "bar-chart",
        title: "Twoje statystyki",
        description:
          "Panel hosta pokazuje nadchodzące rezerwacje i prosty przegląd tygodnia: ile slotów zajętych, ile wolnych.",
      },
    ],
  },

  howItWorks: {
    heading: "Jak to działa",
    steps: [
      {
        number: "01",
        title: "Ustaw dostępność",
        description:
          "Zaloguj się, wybierz dni i godziny, dodaj typy spotkań. Zajmuje to mniej niż 3 minuty.",
      },
      {
        number: "02",
        title: "Udostępnij link",
        description:
          "Twój publiczny link to meetflow.app/[twoj-slug]. Wrzuć go w bio, e-mail stopkę lub gdziekolwiek chcesz.",
      },
      {
        number: "03",
        title: "Klient rezerwuje, reszta dzieje się sama",
        description:
          "Klient wybiera slot, podaje dane — i oboje dostajecie potwierdzenie z .ics. Gotowe.",
      },
    ],
  },

  finalCta: {
    heading: "Gotowy na pierwsze spotkanie?",
    subheading: "Konfiguracja zajmuje mniej niż 5 minut.",
    button: "Utwórz konto",
  },

  footer: {
    brand: "meetflow",
    tagline: "Rezerwacje dla ludzi, którzy cenią swój czas.",
    links: [
      { label: "Polityka prywatności", href: "/privacy" },
      { label: "Warunki użytkowania", href: "/terms" },
    ],
    copyright: `© ${new Date().getFullYear()} meetflow`,
  },
} as const;

export type HomeContent = typeof homeContent;
