import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarClock,
  Flame,
  LifeBuoy,
  Loader2,
  MessageSquare,
  Users,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import {
  asArray,
  asRecord,
  bool,
  customerName,
  formatCents,
  formatDateTime,
  leadStatusLabel,
  num,
  optionalNum,
  priorityLabel,
  resolveExistingRoute,
  str,
  temperatureLabel,
} from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard – HandwerkAI" },
      {
        name: "description",
        content:
          "Übersicht über Gespräche, Leads und die Auslastung Ihres KI-Mitarbeiters im SHK-Betrieb.",
      },
      { property: "og:title", content: "Dashboard – HandwerkAI" },
      {
        property: "og:description",
        content: "Kennzahlen zu Gesprächen, Leads und Terminanfragen auf einen Blick.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

type DashboardMetrics = {
  open_leads: number;
  new_leads_7d: number;
  overdue_followups: number;
  overdue_new_leads: number;
  needs_human: number;
  overdue_handoffs: number;
  conversations_7d: number;
  appointments_today: number;
  upcoming_appointments: number;
};

type CustomerMetrics = { total_customers: number; active_30d: number };

type SetupCore = {
  company_profile: boolean;
  contact: boolean;
  services: number;
  service_areas: number;
  open_days: number;
  ai_agent: boolean;
  knowledge_items: number;
};

type TopLead = {
  id: string;
  name: string | null;
  issue_type: string | null;
  status: string | null;
  priority: string | null;
  lead_score: number | null;
  temperature: string | null;
  estimated_value_cents: number | null;
};

type Overview = {
  dashboard: DashboardMetrics;
  customers: CustomerMetrics;
  setupScore: number;
  setupCore: SetupCore;
  companyId: string | null;
  topLeads: TopLead[];
};

type AttentionItem = {
  item_type: string;
  entity_id: string;
  title: string | null;
  subtitle: string | null;
  due_at: string | null;
  priority: string | null;
  route: string | null;
};

function parseOverview(payload: unknown): Overview {
  const root = asRecord(payload);
  const dashboard = asRecord(root["dashboard"]);
  const customers = asRecord(root["customers"]);
  const setup = asRecord(root["setup"]);
  const core = asRecord(setup["core"]);

  return {
    dashboard: {
      open_leads: num(dashboard["open_leads"]),
      new_leads_7d: num(dashboard["new_leads_7d"]),
      overdue_followups: num(dashboard["overdue_followups"]),
      overdue_new_leads: num(dashboard["overdue_new_leads"]),
      needs_human: num(dashboard["needs_human"]),
      overdue_handoffs: num(dashboard["overdue_handoffs"]),
      conversations_7d: num(dashboard["conversations_7d"]),
      appointments_today: num(dashboard["appointments_today"]),
      upcoming_appointments: num(dashboard["upcoming_appointments"]),
    },
    customers: {
      total_customers: num(customers["total_customers"]),
      active_30d: num(customers["active_30d"]),
    },
    setupScore: Math.max(0, Math.min(100, num(setup["score"]))),
    setupCore: {
      company_profile: bool(core["company_profile"]),
      contact: bool(core["contact"]),
      services: num(core["services"]),
      service_areas: num(core["service_areas"]),
      open_days: num(core["open_days"]),
      ai_agent: bool(core["ai_agent"]),
      knowledge_items: num(core["knowledge_items"]),
    },
    companyId: str(setup["company_id"]),
    topLeads: asArray(root["top_leads"])
      .map((entry) => {
        const lead = asRecord(entry);
        const id = str(lead["id"]);
        if (!id) return null;
        return {
          id,
          name: str(lead["name"]),
          issue_type: str(lead["issue_type"]),
          status: str(lead["status"]),
          priority: str(lead["priority"]),
          lead_score: optionalNum(lead["lead_score"]),
          temperature: str(lead["temperature"]),
          estimated_value_cents: optionalNum(lead["estimated_value_cents"]),
        } satisfies TopLead;
      })
      .filter((lead): lead is TopLead => lead !== null),
  };
}


function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [queue, setQueue] = useState<AttentionItem[]>([]);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setQueueError(null);

      const [overviewRes, queueRes] = await Promise.all([
        supabase.rpc("get_business_overview", { p_days: 30 }),
        supabase.rpc("get_attention_queue", { p_limit: 8 }),
      ]);

      if (cancelled) return;

      if (overviewRes.error) {
        setError("Die Kennzahlen konnten nicht geladen werden.");
        setLoading(false);
        return;
      }

      const parsed = parseOverview(overviewRes.data);
      if (!parsed.companyId) {
        setError("Bitte schließen Sie zuerst die Einrichtung Ihres Unternehmens ab.");
        setLoading(false);
        return;
      }

      setOverview(parsed);

      if (queueRes.error) {
        setQueueError("Die Aufgabenliste konnte nicht geladen werden.");
        setQueue([]);
      } else {
        setQueue(
          (queueRes.data ?? []).map((row) => ({
            item_type: row.item_type,
            entity_id: row.entity_id,
            title: row.title,
            subtitle: row.subtitle,
            due_at: row.due_at,
            priority: row.priority,
            route: row.route,
          })),
        );
      }

      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Daten werden geladen …
        </div>
      </AppShell>
    );
  }

  if (error || !overview) {
    return (
      <AppShell>
        <PageHeader title="Übersicht" description="Ihre Kennzahlen auf einen Blick." />
        <Card>
          <CardContent className="space-y-4 py-10 text-center">
            <p className="text-sm text-destructive">
              {error ?? "Die Kennzahlen konnten nicht geladen werden."}
            </p>
            <Button variant="outline" asChild>
              <Link to="/einrichtung">Zur Einrichtung</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const d = overview.dashboard;

  const cards = [
    { label: "Offene Leads", value: d.open_leads, hint: `${d.new_leads_7d} neu in 7 Tagen`, icon: Users },
    {
      label: "Gespräche (7 Tage)",
      value: d.conversations_7d,
      hint: d.needs_human > 0 ? `${d.needs_human} warten auf Übernahme` : "Keine offenen Übergaben",
      icon: MessageSquare,
    },
    {
      label: "Übergaben offen",
      value: d.needs_human,
      hint: d.overdue_handoffs > 0 ? `${d.overdue_handoffs} über SLA` : "Innerhalb der SLA",
      icon: LifeBuoy,
    },
    {
      label: "Termine heute",
      value: d.appointments_today,
      hint: `${d.upcoming_appointments} kommende Termine`,
      icon: CalendarClock,
    },
    {
      label: "Überfällig",
      value: d.overdue_followups + d.overdue_new_leads,
      hint: `${d.overdue_followups} Follow-ups · ${d.overdue_new_leads} unbearbeitete Leads`,
      icon: AlertTriangle,
    },
    {
      label: "Kunden",
      value: overview.customers.total_customers,
      hint: `${overview.customers.active_30d} aktiv in 30 Tagen`,
      icon: UserCheck,
      to: "/kunden" as const,
    },
  ];

  const setupChecks = [
    { label: "Unternehmensprofil hinterlegt", done: overview.setupCore.company_profile },
    { label: "Kontaktdaten vollständig", done: overview.setupCore.contact },
    { label: "Leistungen aktiv", done: overview.setupCore.services > 0 },
    { label: "Servicegebiete definiert", done: overview.setupCore.service_areas > 0 },
    { label: "Öffnungszeiten gepflegt", done: overview.setupCore.open_days > 0 },
    { label: "KI-Mitarbeiter aktiv", done: overview.setupCore.ai_agent },
    { label: "Wissensdatenbank gefüllt", done: overview.setupCore.knowledge_items > 0 },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Übersicht"
        description="Operativer Stand aus Leads, Gesprächen, Terminen und Kundenstamm."
        action={
          <Button asChild>
            <Link to="/konversationen">Zu den Gesprächen</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
              {stat.to ? (
                <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs" asChild>
                  <Link to={stat.to}>Kundenstamm öffnen</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Priorisierte Leads</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/leads">Alle Leads</Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y">
            {overview.topLeads.length === 0 ? (
              <div className="space-y-3 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Aktuell sind keine offenen Leads vorhanden.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/leads">Zu den Leads</Link>
                </Button>
              </div>
            ) : (
              overview.topLeads.map((lead) => (
                <Link
                  key={lead.id}
                  to="/leads"
                  className="flex items-center justify-between gap-4 py-3 hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{customerName(lead.name)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {lead.issue_type ?? "Kein Anliegen hinterlegt"}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>Priorität: {priorityLabel(lead.priority)}</span>
                      {lead.lead_score !== null ? <span>Score: {lead.lead_score}</span> : null}
                      {lead.temperature ? (
                        <span className="inline-flex items-center gap-1">
                          <Flame className="size-3" />
                          {temperatureLabel(lead.temperature)}
                        </span>
                      ) : null}
                      {lead.estimated_value_cents !== null ? (
                        <span>{formatCents(lead.estimated_value_cents)}</span>
                      ) : null}
                    </p>
                  </div>
                  <Badge variant={lead.priority === "urgent" ? "destructive" : "secondary"}>
                    {leadStatusLabel(lead.status)}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Einrichtung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Fortschritt</span>
                <span className="font-medium">{overview.setupScore} %</span>
              </div>
              <Progress value={overview.setupScore} className="mt-2" />
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {setupChecks.map((check) => (
                <li key={check.label}>
                  {check.done ? "✓" : "○"} {check.label}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/einrichtung">
                {overview.setupScore >= 100 ? "Einrichtung bearbeiten" : "Einrichtung fortsetzen"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Aufmerksamkeit erforderlich</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {queueError ? (
            <p className="py-8 text-center text-sm text-destructive">{queueError}</p>
          ) : queue.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aktuell gibt es nichts zu erledigen.
            </p>
          ) : (
            queue.map((item) => {
              const target = resolveExistingRoute(item.route);
              const body = (
                <div className="flex w-full items-start justify-between gap-4 py-3 text-left">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.title ?? "Ohne Titel"}</p>
                    {item.subtitle ? (
                      <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                    ) : null}
                    {item.due_at ? (
                      <p className="text-xs text-muted-foreground">
                        Fällig: {formatDateTime(item.due_at)}
                      </p>
                    ) : null}
                    {!target ? (
                      <p className="text-[11px] text-muted-foreground">
                        Ansicht noch nicht verfügbar
                      </p>
                    ) : null}
                  </div>
                  <Badge variant={item.priority === "urgent" ? "destructive" : "secondary"}>
                    {priorityLabel(item.priority)}
                  </Badge>
                </div>
              );

              return target ? (
                <Link
                  key={`${item.item_type}-${item.entity_id}`}
                  to={target}
                  className="block hover:bg-muted/40"
                >
                  {body}
                </Link>
              ) : (
                <div
                  key={`${item.item_type}-${item.entity_id}`}
                  className="cursor-default opacity-70"
                >
                  {body}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
