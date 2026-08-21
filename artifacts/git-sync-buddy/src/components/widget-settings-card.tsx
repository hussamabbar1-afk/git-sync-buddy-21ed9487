import { Check, Code2, Copy, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ChatWidget } from "@/components/chat-widget";
import { Badge } from "@/components/ui/badge";
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
import { supabase } from "@/integrations/supabase/client";

type EmbedInfo = {
  configured?: boolean;
  agent_id?: string;
  agent_name?: string;
  widget_key?: string;
  active?: boolean;
  loader_url?: string;
  script_tag?: string;
  public_widget_base_url?: string | null;
  ready_to_embed?: boolean;
  platform_hints?: Record<string, string>;
};

type Installation = {
  origin?: string;
  platform?: string | null;
  last_seen_at?: string | null;
  loads_count?: number | null;
};

type DistributionEntry = {
  agent_id?: string;
  installed_domains?: number;
  installations?: Installation[];
};

type DisplaySettings = {
  enabled: boolean;
  position: string;
  primary_color: string;
  launcher_label: string;
  show_branding: boolean;
  mobile_fullscreen: boolean;
};

const platformLabels: Record<string, string> = {
  wordpress: "WordPress",
  wix: "Wix",
  jimdo: "Jimdo",
  custom: "Eigene Website",
  generic: "Allgemein",
};

export function WidgetSettingsCard({
  agentId,
  welcomeMessage,
}: {
  agentId: string;
  welcomeMessage?: string | null;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [embed, setEmbed] = useState<EmbedInfo | null>(null);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [settings, setSettings] = useState<DisplaySettings | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [embedRes, distRes, settingsRes] = await Promise.all([
      supabase.rpc("get_widget_embed_info", { p_ai_agent_id: agentId }),
      supabase.rpc("get_widget_distribution_status"),
      supabase
        .from("widget_display_settings")
        .select(
          "enabled, position, primary_color, launcher_label, show_branding, mobile_fullscreen",
        )
        .eq("ai_agent_id", agentId)
        .maybeSingle(),
    ]);

    if (embedRes.error) {
      setError("Widget-Informationen konnten nicht geladen werden.");
      setLoading(false);
      return;
    }

    setEmbed((embedRes.data ?? null) as EmbedInfo | null);

    const entries = (distRes.data ?? []) as DistributionEntry[];
    const entry = Array.isArray(entries) ? entries.find((e) => e.agent_id === agentId) : undefined;
    setInstallations(entry?.installations ?? []);

    setSettings(
      settingsRes.data
        ? {
            enabled: settingsRes.data.enabled,
            position: settingsRes.data.position,
            primary_color: settingsRes.data.primary_color,
            launcher_label: settingsRes.data.launcher_label,
            show_branding: settingsRes.data.show_branding,
            mobile_fullscreen: settingsRes.data.mobile_fullscreen,
          }
        : null,
    );

    setLoading(false);
  }, [agentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const set = <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) =>
    setSettings((s) => (s ? { ...s, [key]: value } : s));

  const handleSave = async () => {
    if (!settings || saving) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Only display fields are written; company_id, ai_agent_id, widget_key and
    // public_widget_base_url are never editable from the frontend.
    const { error: updateError } = await supabase
      .from("widget_display_settings")
      .update({
        enabled: settings.enabled,
        position: settings.position,
        primary_color: settings.primary_color,
        launcher_label: settings.launcher_label,
        show_branding: settings.show_branding,
        mobile_fullscreen: settings.mobile_fullscreen,

      })
      .eq("ai_agent_id", agentId);

    setSaving(false);
    if (updateError) {
      setError(`Speichern fehlgeschlagen: ${updateError.message}`);
      return;
    }
    setSuccess("Widget-Einstellungen gespeichert.");
  };

  const scriptTag = embed?.script_tag ?? null;
  const published = Boolean(embed?.public_widget_base_url);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chat-Widget</CardTitle>
          <CardDescription>Einbindung auf Ihrer Website.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Widget-Daten werden geladen …
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat-Widget</CardTitle>
        <CardDescription>Einbindung, Darstellung und Status Ihres Website-Chats.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {error ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
            {success}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={embed?.active ? "secondary" : "outline"}>
            {embed?.active ? "KI aktiv" : "KI inaktiv"}
          </Badge>
          <Badge variant={settings?.enabled ? "secondary" : "outline"}>
            {settings?.enabled ? "Widget aktiviert" : "Widget deaktiviert"}
          </Badge>
          <Badge variant={published ? "secondary" : "outline"}>
            {published ? "Veröffentlicht" : "Noch nicht veröffentlicht"}
          </Badge>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Widget-Schlüssel</Label>
          <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs">
            {embed?.widget_key ?? "—"}
          </code>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Einbettungscode</Label>
          {published && scriptTag ? (
            <>
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{scriptTag}</pre>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void navigator.clipboard.writeText(scriptTag);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Kopiert" : "Code kopieren"}
              </Button>
            </>
          ) : (
            <p className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
              Noch nicht veröffentlicht – der Einbettungscode steht zur Verfügung, sobald Ihr
              Chat-Widget freigeschaltet wurde. Bitte wenden Sie sich an den Support.
            </p>
          )}
        </div>

        {settings ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-4 rounded-md border p-3 sm:col-span-2">
              <div>
                <p className="text-sm font-medium">Widget aktiv</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Steuert, ob der Chat auf Ihrer Website ausgeliefert wird.
                </p>
              </div>
              <Switch checked={settings.enabled} onCheckedChange={(v) => set("enabled", v)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="widget-position">Position</Label>
              <Select value={settings.position} onValueChange={(v) => set("position", v)}>
                <SelectTrigger id="widget-position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom_right">Unten rechts</SelectItem>
                  <SelectItem value="bottom_left">Unten links</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="widget-color">Primärfarbe</Label>
              <div className="flex gap-2">
                <Input
                  id="widget-color"
                  value={settings.primary_color}
                  onChange={(e) => set("primary_color", e.target.value)}
                  placeholder="#111827"
                />
                <input
                  type="color"
                  aria-label="Farbe wählen"
                  className="h-9 w-10 shrink-0 rounded-md border bg-background"
                  value={
                    /^#[0-9a-fA-F]{6}$/.test(settings.primary_color)
                      ? settings.primary_color
                      : "#111827"
                  }
                  onChange={(e) => set("primary_color", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="widget-label">Beschriftung des Chat-Buttons</Label>
              <Input
                id="widget-label"
                value={settings.launcher_label}
                onChange={(e) => set("launcher_label", e.target.value)}
                placeholder="Chat"
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-md border p-3">
              <p className="text-sm font-medium">Mobil im Vollbild</p>
              <Switch
                checked={settings.mobile_fullscreen}
                onCheckedChange={(v) => set("mobile_fullscreen", v)}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-md border p-3">
              <p className="text-sm font-medium">HandwerkAI-Hinweis zeigen</p>
              <Switch
                checked={settings.show_branding}
                onCheckedChange={(v) => set("show_branding", v)}
              />
            </div>

            <div className="sm:col-span-2">
              <Button onClick={() => void handleSave()} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                Widget-Einstellungen speichern
              </Button>
            </div>
          </div>
        ) : (
          <p className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            Für diesen KI-Mitarbeiter sind noch keine Widget-Darstellungseinstellungen hinterlegt.
          </p>
        )}

        {embed?.platform_hints ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Einbindung nach Plattform</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {Object.entries(embed.platform_hints).map(([platform, hint]) => (
                <li key={platform}>
                  <span className="font-medium text-foreground">
                    {platformLabels[platform] ?? platform}:
                  </span>{" "}
                  {hint}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {installations.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Erkannte Domains</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {installations.map((item, index) => (
                <li key={`${item.origin}-${index}`} className="flex justify-between gap-3">
                  <span className="truncate">{item.origin}</span>
                  <span>
                    {item.last_seen_at
                      ? new Date(item.last_seen_at).toLocaleDateString("de-DE")
                      : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {embed?.widget_key ? (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Code2 className="size-4" /> Testchat
            </p>
            <ChatWidget widgetKey={embed.widget_key} welcomeMessage={welcomeMessage ?? null} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
