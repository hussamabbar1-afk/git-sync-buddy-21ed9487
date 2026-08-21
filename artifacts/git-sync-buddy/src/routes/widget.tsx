import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { ChatWidget, type ChatMetadata } from "@/components/chat-widget";
import { SUPABASE_FUNCTIONS_URL } from "@/lib/supabase-urls";

type WidgetSearch = {
  key?: string | undefined;
  client_id?: string | undefined;
  origin?: string | undefined;
  page_url?: string | undefined;
  page_title?: string | undefined;
  referrer?: string | undefined;
  utm_source?: string | undefined;
  utm_medium?: string | undefined;
  utm_campaign?: string | undefined;
  utm_content?: string | undefined;
  utm_term?: string | undefined;
};

const asString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

export const Route = createFileRoute("/widget")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): WidgetSearch => ({
    key: asString(search["key"]),
    client_id: asString(search["client_id"]),
    origin: asString(search["origin"]),
    page_url: asString(search["page_url"]),
    page_title: asString(search["page_title"]),
    referrer: asString(search["referrer"]),
    utm_source: asString(search["utm_source"]),
    utm_medium: asString(search["utm_medium"]),
    utm_campaign: asString(search["utm_campaign"]),
    utm_content: asString(search["utm_content"]),
    utm_term: asString(search["utm_term"]),
  }),
  head: () => ({
    meta: [
      { title: "Chat – HandwerkAI" },
      {
        name: "description",
        content: "Eingebetteter HandwerkAI-Chat für Kundenanfragen an Ihren Handwerksbetrieb.",
      },
      { property: "og:title", content: "Chat – HandwerkAI" },
      {
        property: "og:description",
        content: "Eingebetteter HandwerkAI-Chat für Kundenanfragen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WidgetPage,
});

type WidgetConfig = {
  active?: boolean;
  agent_name?: string;
  welcome_message?: string | null;
  primary_color?: string;
  launcher_label?: string;
  show_branding?: boolean;
};

function WidgetPage() {
  const search = Route.useSearch();
  const widgetKey = search.key ?? null;

  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    if (!widgetKey) {
      setStatus("error");
      setMessage("Dieser Chat ist nicht verfügbar. Es wurde kein gültiger Zugang übergeben.");
      return;
    }

    const load = async () => {
      setStatus("loading");
      try {
        const res = await fetch(
          `${SUPABASE_FUNCTIONS_URL}/widget-config?key=${encodeURIComponent(widgetKey)}`,
        );
        const body = (await res.json().catch(() => null)) as {
          ok?: boolean;
          config?: WidgetConfig;
        } | null;

        if (cancelled) return;

        if (!res.ok || !body?.ok || !body.config) {
          setStatus("error");
          setMessage("Dieser Chat ist derzeit nicht verfügbar.");
          return;
        }

        if (body.config.active === false) {
          setStatus("error");
          setMessage("Der Chat ist momentan deaktiviert. Bitte versuchen Sie es später erneut.");
          return;
        }

        setConfig(body.config);
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Der Chat konnte nicht geladen werden. Bitte versuchen Sie es später erneut.");
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [widgetKey]);

  // Host-page metadata comes from widget-loader v2 — never overwritten with the iframe origin.
  const metadata: ChatMetadata = {
    ...(search.client_id ? { client_id: search.client_id } : {}),
    ...(search.origin ? { origin: search.origin } : {}),
    ...(search.page_url ? { page_url: search.page_url } : {}),
    ...(search.page_title ? { page_title: search.page_title } : {}),
    ...(search.referrer ? { referrer: search.referrer } : {}),
    ...(search.utm_source ? { utm_source: search.utm_source } : {}),
    ...(search.utm_medium ? { utm_medium: search.utm_medium } : {}),
    ...(search.utm_campaign ? { utm_campaign: search.utm_campaign } : {}),
    ...(search.utm_content ? { utm_content: search.utm_content } : {}),
    ...(search.utm_term ? { utm_term: search.utm_term } : {}),
  };

  return (
    <div className="flex min-h-screen flex-col bg-background p-3">
      {status === "loading" ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Chat wird geladen …
        </div>
      ) : status === "error" ? (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
          {message}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-medium">{config?.agent_name ?? "Chat"}</p>
          </div>
          <div className="flex min-h-0 flex-1 flex-col [&>div]:h-full">
            <ChatWidget
              widgetKey={widgetKey as string}
              welcomeMessage={config?.welcome_message ?? null}
              metadata={metadata}
            />
          </div>
          {config?.show_branding ? (
            <p className="px-1 text-center text-[10px] text-muted-foreground">
              Unterstützt von HandwerkAI
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
