import { createFileRoute } from "@tanstack/react-router";
import { Bell, Key, Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/einstellungen")({
  head: () => ({
    meta: [
      { title: "Einstellungen – HandwerkAI" },
      {
        name: "description",
        content: "Verwalten Sie Ihre Kontoeinstellungen in HandwerkAI.",
      },
      { property: "og:title", content: "Einstellungen – HandwerkAI" },
      {
        property: "og:description",
        content: "Kontoeinstellungen, Benachrichtigungen und allgemeine Konfiguration.",
      },
    ],
  }),
  component: SettingsPage,
});

type Preferences = {
  language: string;
  timezone: string;
  dark_mode: boolean;
};

const defaultPreferences: Preferences = {
  language: "Deutsch",
  timezone: "Europe/Berlin",
  dark_mode: false,
};

function parsePreferences(value: unknown): Preferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaultPreferences;
  const raw = value as Record<string, unknown>;
  return {
    language: typeof raw['language'] === "string" ? raw['language'] : defaultPreferences.language,
    timezone: typeof raw['timezone'] === "string" ? raw['timezone'] : defaultPreferences.timezone,
    dark_mode: typeof raw['dark_mode'] === "boolean" ? raw['dark_mode'] : false,
  };
}

function applyDarkMode(enabled: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", enabled);
}

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [originalEmail, setOriginalEmail] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

  const [accountSaving, setAccountSaving] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null);

  const [generalSaving, setGeneralSaving] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (cancelled) return;

      if (userError || !userData.user) {
        setLoadError("Sie sind nicht angemeldet.");
        setLoading(false);
        return;
      }

      setUserId(userData.user.id);
      setOriginalEmail(userData.user.email ?? "");
      setEmail(userData.user.email ?? "");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, preferences")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        setLoadError("Die Einstellungen konnten nicht geladen werden.");
        setLoading(false);
        return;
      }

      setFullName(profile?.full_name ?? "");
      const prefs = parsePreferences(profile?.preferences);
      setPreferences(prefs);
      applyDarkMode(prefs.dark_mode);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveAccount = async () => {
    if (accountSaving || !userId) return;
    setAccountSaving(true);
    setAccountError(null);
    setAccountSuccess(null);

    const messages: string[] = [];

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null })
      .eq("id", userId);

    if (profileError) {
      setAccountError(`Fehler beim Speichern des Namens: ${profileError.message}`);
      setAccountSaving(false);
      return;
    }
    messages.push("Name gespeichert.");

    const nextEmail = email.trim();
    if (nextEmail && nextEmail !== originalEmail) {
      const { error: emailError } = await supabase.auth.updateUser({ email: nextEmail });
      if (emailError) {
        setAccountError(`Fehler beim Ändern der E-Mail: ${emailError.message}`);
        setAccountSaving(false);
        return;
      }
      messages.push("Bestätigungs-E-Mail zur Adressänderung versendet.");
    }

    if (password.trim()) {
      const { error: passwordError } = await supabase.auth.updateUser({ password });
      if (passwordError) {
        setAccountError(`Fehler beim Ändern des Passworts: ${passwordError.message}`);
        setAccountSaving(false);
        return;
      }
      setPassword("");
      messages.push("Passwort aktualisiert.");
    }

    setAccountSaving(false);
    setAccountSuccess(messages.join(" "));
  };

  const handleSaveGeneral = async () => {
    if (generalSaving || !userId) return;
    setGeneralSaving(true);
    setGeneralError(null);
    setGeneralSuccess(null);

    const { error } = await supabase
      .from("profiles")
      .update({ preferences })
      .eq("id", userId);

    setGeneralSaving(false);

    if (error) {
      setGeneralError(`Fehler beim Speichern: ${error.message}`);
      return;
    }
    setGeneralSuccess("Einstellungen gespeichert.");
  };

  if (loading) {
    return (
      <AppShell>
        <PageHeader title="Einstellungen" description="Verwalten Sie Ihre Kontoeinstellungen." />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Einstellungen werden geladen …
        </div>
      </AppShell>
    );
  }

  if (loadError) {
    return (
      <AppShell>
        <PageHeader title="Einstellungen" description="Verwalten Sie Ihre Kontoeinstellungen." />
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {loadError}
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Einstellungen"
        description="Verwalten Sie Ihre Kontoeinstellungen."
      />

      <Tabs defaultValue="konto">
        <TabsList>
          <TabsTrigger value="konto">Konto</TabsTrigger>
          <TabsTrigger value="benachrichtigungen">Benachrichtigungen</TabsTrigger>
          <TabsTrigger value="allgemein">Allgemein</TabsTrigger>
        </TabsList>

        <TabsContent value="konto" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-4" />
                Kontodaten
              </CardTitle>
              <CardDescription>Ihre persönlichen Anmeldedaten verwalten.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Ihr Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Neues Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Nur ausfüllen, wenn Sie es ändern möchten"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSaveAccount} disabled={accountSaving}>
                  {accountSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                  Speichern
                </Button>
              </div>
              {accountError ? (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive sm:col-span-2">
                  {accountError}
                </p>
              ) : null}
              {accountSuccess ? (
                <p className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary sm:col-span-2">
                  {accountSuccess}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benachrichtigungen" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="size-4" />
                Benachrichtigungen
              </CardTitle>
              <CardDescription>Status Ihrer Benachrichtigungen.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
                In-App-Benachrichtigungen sind aktiv: neue Leads, Gespräche und Übergaben erscheinen
                in Echtzeit im Glockensymbol in der Kopfzeile. Einstellungen für den Versand per
                E-Mail oder Push sind derzeit noch nicht konfigurierbar.
              </p>
            </CardContent>

          </Card>
        </TabsContent>

        <TabsContent value="allgemein" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="size-4" />
                Allgemeine Konfiguration
              </CardTitle>
              <CardDescription>Grundeinstellungen für Ihr Konto.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">Sprache</Label>
                <Input
                  id="language"
                  placeholder="Deutsch"
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Zeitzone</Label>
                <Input
                  id="timezone"
                  placeholder="Europe/Berlin"
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3 sm:col-span-2">
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">
                    Dunkles Erscheinungsbild aktivieren.
                  </p>
                </div>
                <Switch
                  checked={preferences.dark_mode}
                  onCheckedChange={(checked) => {
                    setPreferences({ ...preferences, dark_mode: checked });
                    applyDarkMode(checked);
                  }}
                />
              </div>
              <div className="sm:col-span-2">
                <Button onClick={handleSaveGeneral} disabled={generalSaving}>
                  {generalSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                  Speichern
                </Button>
              </div>
              {generalError ? (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive sm:col-span-2">
                  {generalError}
                </p>
              ) : null}
              {generalSuccess ? (
                <p className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary sm:col-span-2">
                  {generalSuccess}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
