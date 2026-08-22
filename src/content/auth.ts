export const authContent = {
  login: {
    heading: "Zaloguj się do meetflow",
    subheading: "Zarządzaj swoją dostępnością i rezerwacjami.",
    googleButton: "Kontynuuj z Google",
    divider: "lub",
    emailLabel: "Adres e-mail",
    emailPlaceholder: "ty@domena.pl",
    emailButton: "Wyślij link logowania",
    emailSentHeading: "Sprawdź skrzynkę",
    emailSentBody:
      "Wysłaliśmy Ci link do logowania. Kliknij go, żeby się zalogować — wygasa po 10 minutach.",
    backToLogin: "Wróć do logowania",
    terms: "Logując się akceptujesz",
    termsLink: "Warunki użytkowania",
    privacyLink: "Politykę prywatności",
  },
} as const;

export type AuthContent = typeof authContent;
