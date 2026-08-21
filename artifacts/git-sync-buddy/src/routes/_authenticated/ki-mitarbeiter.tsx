import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, Check, Globe, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { WidgetSettingsCard } from "@/components/widget-settings-card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/ki-mitarbeiter")({
  head: () => ({
    meta: [
      { title: "KI-Mitarbeiter – HandwerkAI" },
      {
        name: "description",
        content:
          "Namen, Tonalität, Aufgaben und Website-Chat-Widget Ihres KI-Mitarbeiters konfigurieren.",
      },
      { property: "og:title", content: "KI-Mitarbeiter – HandwerkAI" },
      {
        property: "og:description",
        content: "Konfiguration von Auftreten, Aufgaben und Chat-Widget des KI-Mitarbeiters.",
      },
    ],
  }),
  component: AiEmployeePage,
});

const capabilities = [
  { title: "Anfragen entgegennehmen", description: "Rund um die Uhr, auch außerhalb der Öffnungszeiten." },
  { title: "Anliegen qualifizieren", description: "Art der Störung, Dringlichkeit und Objektdaten erfassen." },
  { title: "Terminwunsch aufnehmen", description: "Wunschtermine sammeln und im Lead vermerken." },
  { title: "Notfälle erkennen", description: "Bei Wasserschaden oder Gasgeruch an das Büro übergeben." },
];

type AgentForm = {
  name: string;
  description: string;
  is_active: boolean;
  language: string;
  response_style: string;
  welcome_message: string;
  fallback_message: string;
  human_handoff_enabled: boolean;
};

const emptyForm: AgentForm = {
  name: "",
  description: "",
  is_active: true,
  language: "de",
  response_style: "professionell",
  welcome_message: "",
  fallback_message: "",
  human_handoff_enabled: true,
};

function AiEmployeePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [noCompany, setNoCompany] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [form, setForm] = useState<AgentForm>(emptyForm);

  const set = <K extends keyof AgentForm>(key: K, value: AgentForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        if (!cancelled) {
          setError("Sie sind nicht angemeldet. Bitte melden Sie sich an.");
          setLoading(false);
        }
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        setError(`Fehler beim Laden des Profils: ${profileError.message}`);
        setLoading(false);
        return;
      }

      if (!profile?.company_id) {
        setNoCompany(true);
        setLoading(false);
        return;
      }

      const { data: agent, error: agentError } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("company_id", profile.company_id)
        .maybeSingle();

      if (cancelled) return;

      if (agentError) {
        setError(`Fehler beim Laden des KI-Mitarbeiters: ${agentError.message}`);
        setLoading(false);
        return;
      }

      if (agent) {
        setAgentId(agent.id);
        setForm({
          name: agent.name ?? "",
          description: agent.description ?? "",
          is_active: agent.is_active ?? true,
          language: agent.language ?? "de",
          response_style: agent.response_style ?? "professionell",
          welcome_message: agent.welcome_message ?? "",
          fallback_message: agent.fallback_message ?? "",
          human_handoff_enabled: agent.human_handoff_enabled ?? true,
        });
      }

      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    if (saving) return;

    if (!form.name.trim()) {
      setError("Bitte geben Sie einen Namen für den KI-Mitarbeiter ein.");
      setSuccess(null);
      return;
    }

    setError(null);
    setSuccess(null);
    setSaving(true);

    if (agentId) {
      const { error: updateError } = await supabase
        .from("ai_agents")
        .update({
          name: form.name.trim(),
          description: form.description.trim() || null,
          is_active: form.is_active,
          language: form.language,
          response_style: form.response_style,
          welcome_message: form.welcome_message.trim() || null,
          fallback_message: form.fallback_message.trim() || null,
          human_handoff_enabled: form.human_handoff_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", agentId);

      setSaving(false);

      if (updateError) {
        setError(`Fehler beim Speichern: ${updateError.message}`);
        return;
      }

      setSuccess("KI-Mitarbeiter erfolgreich gespeichert.");
      return;
    }

    const { data, error: rpcError } = await supabase.rpc(
      "create_ai_agent_for_current_company",
      {
        agent_name: form.name.trim(),
        agent_description: form.description.trim(),
        agent_language: form.language,
        agent_response_style: form.response_style,
        agent_welcome_message: form.welcome_message.trim(),
        agent_fallback_message: form.fallback_message.trim(),
        agent_human_handoff_enabled: form.human_handoff_enabled,
      },
    );

    setSaving(false);

    if (rpcError) {
      setError(`Fehler beim Anlegen: ${rpcError.message}`);
      return;
    }

    if (typeof data === "string") setAgentId(data);
    setSuccess("KI-Mitarbeiter erfolgreich gespeichert.");
  };

  if (loading) {
    return (
      <AppShell>
        <PageHeader
          title="KI-Mitarbeiter"
          description="Legen Sie fest, wie sich Ihr digitaler Mitarbeiter gegenüber Kunden verhält."
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Daten werden geladen …
        </div>
      </AppShell>
    );
  }

  if (noCompany) {
    return (
      <AppShell>
        <PageHeader
          title="KI-Mitarbeiter"
          description="Legen Sie fest, wie sich Ihr digitaler Mitarbeiter gegenüber Kunden verhält."
        />
        <Card>
          <CardHeader>
            <CardTitle>Unternehmensprofil fehlt</CardTitle>
            <CardDescription>
              Bitte vervollständigen Sie zuerst Ihr Unternehmensprofil, bevor Sie einen
              KI-Mitarbeiter einrichten.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/einrichtung">Zur Einrichtung</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="KI-Mitarbeiter"
        description="Legen Sie fest, wie sich Ihr digitaler Mitarbeiter gegenüber Kunden verhält."
        action={
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {agentId ? "Konfiguration speichern" : "KI-Mitarbeiter erstellen"}
          </Button>
        }
      />

      {error ? (
        <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mb-4 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
          {success}
        </p>
      ) : null}
      {!agentId ? (
        <p className="mb-4 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
          Sie haben noch keinen KI-Mitarbeiter. Füllen Sie die Felder aus und erstellen Sie ihn.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Auftreten</CardTitle>
            <CardDescription>Name, Ansprache und Begrüßung.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assistant">Name des KI-Mitarbeiters</Label>
              <Input
                id="assistant"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="z. B. Lena"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Antwortstil</Label>
              <Select
                value={form.response_style}
                onValueChange={(v) => set("response_style", v)}
              >
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professionell">Professionell (Sie)</SelectItem>
                  <SelectItem value="freundlich">Freundlich</SelectItem>
                  <SelectItem value="kurz_und_direkt">Kurz und direkt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Wofür ist dieser KI-Mitarbeiter zuständig?"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="greeting">Begrüßungsnachricht</Label>
              <Textarea
                id="greeting"
                rows={3}
                value={form.welcome_message}
                onChange={(e) => set("welcome_message", e.target.value)}
                placeholder="Guten Tag, wie kann ich Ihnen helfen?"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fallback">Fallback-Nachricht</Label>
              <Textarea
                id="fallback"
                rows={2}
                value={form.fallback_message}
                onChange={(e) => set("fallback_message", e.target.value)}
                placeholder="Das kann ich leider nicht beantworten – ein Mitarbeiter meldet sich."
              />
            </div>
            <div className="flex items-start justify-between gap-4 rounded-md border p-4 sm:col-span-2">
              <div>
                <p className="text-sm font-medium">Übergabe an Mitarbeiter</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Gespräche bei Bedarf an einen echten Mitarbeiter weiterleiten.
                </p>
              </div>
              <Switch
                checked={form.human_handoff_enabled}
                onCheckedChange={(v) => set("human_handoff_enabled", v)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Status</CardTitle>
                <CardDescription>
                  {form.is_active ? "KI-Mitarbeiter aktiv" : "KI-Mitarbeiter inaktiv"}
                </CardDescription>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => set("is_active", v)}
              />
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Bot className="size-4" /> Modellprofil: Standard
              </p>
              <div className="space-y-2">
                <Label htmlFor="language" className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="size-4" /> Sprache
                </Label>
                <Select value={form.language} onValueChange={(v) => set("language", v)}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">Englisch</SelectItem>
                    <SelectItem value="tr">Türkisch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {agentId ? null : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Chat-Widget</CardTitle>
                <CardDescription>Einbindung auf Ihrer Website.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Erstellen Sie zuerst den KI-Mitarbeiter, um das Chat-Widget einzurichten.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {agentId ? (
        <div className="mt-4">
          <WidgetSettingsCard agentId={agentId} welcomeMessage={form.welcome_message} />
        </div>
      ) : null}


      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Aktuelle Fähigkeiten</CardTitle>
          <CardDescription>
            Diese Aufgaben übernimmt Ihr KI-Mitarbeiter bereits. Die Liste ist informativ und nicht
            einzeln konfigurierbar.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {capabilities.map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-md border p-4">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
