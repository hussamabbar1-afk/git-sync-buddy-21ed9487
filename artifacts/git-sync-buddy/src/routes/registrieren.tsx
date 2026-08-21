import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Bot, MailCheck } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { germanAuthError } from "@/lib/auth-errors";

export const Route = createFileRoute("/registrieren")({
  head: () => ({
    meta: [
      { title: "Konto erstellen – HandwerkAI" },
      {
        name: "description",
        content:
          "Registrieren Sie Ihren SHK-Betrieb bei HandwerkAI und richten Sie Ihren KI-Mitarbeiter in wenigen Minuten ein.",
      },
      { property: "og:title", content: "Konto erstellen – HandwerkAI" },
      {
        property: "og:description",
        content: "Kostenlos starten: KI-Mitarbeiter für Heizung, Sanitär und Klima.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email || !password || !passwordConfirm) {
      setError("Bitte füllen Sie alle Felder aus.");
      return;
    }
    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    if (!terms) {
      setError("Bitte akzeptieren Sie die AGB und die Datenschutzerklärung.");
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    setLoading(false);

    if (signUpError) {
      setError(germanAuthError(signUpError.message));
      return;
    }

    // Mit aktivierter E-Mail-Bestätigung gibt Supabase keine Session zurück.
    if (data.session) {
      navigate({ to: "/dashboard", replace: true });
      return;
    }

    setConfirmationSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bot className="size-5" />
          </span>
          <span className="font-display text-xl font-semibold">HandwerkAI</span>
        </div>

        {confirmationSent ? (
          <div className="surface-panel space-y-4 p-6">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <MailCheck className="size-5" />
            </span>
            <h1 className="text-2xl font-semibold">Bitte E-Mail bestätigen</h1>
            <p className="text-sm text-muted-foreground">
              Wir haben einen Bestätigungslink an <span className="font-medium">{email}</span>{" "}
              gesendet. Öffnen Sie den Link, um Ihr Konto zu aktivieren. Danach können Sie sich
              anmelden.
            </p>
            <Button asChild className="w-full">
              <Link to="/login">Zur Anmeldung</Link>
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Konto erstellen</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              14 Tage kostenlos testen. Keine Kreditkarte erforderlich.
            </p>

            <form className="surface-panel mt-6 space-y-4 p-6" onSubmit={handleSubmit}>
              {error ? (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email">Geschäftliche E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@betrieb.de"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mindestens 6 Zeichen"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Passwort bestätigen</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder="Passwort wiederholen"
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <Checkbox
                  id="terms"
                  className="mt-0.5"
                  checked={terms}
                  onCheckedChange={(v) => setTerms(v === true)}
                />
                Ich akzeptiere die AGB und die Datenschutzerklärung.
              </label>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Konto wird erstellt …" : "Kostenlos starten"}
              </Button>
            </form>
          </>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          Sie haben bereits ein Konto?{" "}
          <Link to="/login" className="font-medium text-primary">
            Zur Anmeldung
          </Link>
        </p>
      </div>
    </div>
  );
}
