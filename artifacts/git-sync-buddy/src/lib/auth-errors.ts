export function germanAuthError(message?: string): string {
  const m = (message ?? "").toLowerCase();

  if (m.includes("invalid login credentials")) return "E-Mail-Adresse oder Passwort ist falsch.";
  if (m.includes("email not confirmed"))
    return "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse über den Link in Ihrem Postfach.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Für diese E-Mail-Adresse existiert bereits ein Konto.";
  if (m.includes("password should be at least"))
    return "Das Passwort muss mindestens 6 Zeichen lang sein.";
  if (m.includes("unable to validate email") || m.includes("invalid email") || m.includes("is invalid"))
    return "Bitte geben Sie eine gültige E-Mail-Adresse ein.";

  if (m.includes("rate limit") || m.includes("too many"))
    return "Zu viele Versuche. Bitte warten Sie einen Moment und versuchen Sie es erneut.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "Verbindung fehlgeschlagen. Bitte prüfen Sie Ihre Internetverbindung.";

  return "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.";
}
