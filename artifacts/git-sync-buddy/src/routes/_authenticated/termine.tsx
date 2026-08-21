import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/termine")({
  head: () => ({
    meta: [
      { title: "Termine – HandwerkAI" },
      {
        name: "description",
        content: "Alle vom KI-Mitarbeiter gebuchten Kundentermine im Monatskalender.",
      },
      { property: "og:title", content: "Termine – HandwerkAI" },
      {
        property: "og:description",
        content: "Kundentermine Ihres Unternehmens als schreibgeschützte Kalenderansicht.",
      },
    ],
  }),
  component: TerminePage,
});

type AppointmentRow = {
  id: string;
  lead_id: string | null;
  conversation_id: string | null;
  customer_name: string | null;
  appointment_date: string | null;
  start_time: string | null;
  end_time: string | null;
  service_type: string | null;
  address: string | null;
  postal_code: string | null;
  notes: string | null;
  status: string;
  updated_at: string;
};

const SELECT_COLUMNS =
  "id, lead_id, conversation_id, customer_name, appointment_date, start_time, end_time, service_type, address, postal_code, notes, status, updated_at";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function cleanText(value: string | null | undefined) {
  const v = (value ?? "").trim();
  if (!v || v.toUpperCase() === "EMPTY" || v.toLowerCase() === "null") return "";
  return v;
}

function customerName(value: string | null) {
  return cleanText(value) || "Unbekannter Kunde";
}

function serviceType(value: string | null) {
  return cleanText(value) || "Dienstleistung nicht angegeben";
}

function statusLabel(status: string) {
  switch (cleanText(status).toLowerCase()) {
    case "requested":
      return "Angefragt";
    case "confirmed":
      return "Bestätigt";
    case "cancelled":
      return "Storniert";
    default:
      return cleanText(status) || "Unbekannt";
  }
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (cleanText(status).toLowerCase()) {
    case "requested":
      return "secondary";
    case "confirmed":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

function formatTime(value: string | null) {
  const v = cleanText(value);
  if (!v) return "";
  const parts = v.split(":");
  if (parts.length < 2) return v;
  return `${parts[0]!.padStart(2, "0")}:${parts[1]}`;
}

function formatTimeRange(start: string | null, end: string | null) {
  const s = formatTime(start);
  const e = formatTime(end);
  if (s && e) return `${s} – ${e} Uhr`;
  if (s) return `${s} Uhr`;
  return "Uhrzeit offen";
}

function formatDateKey(key: string | null) {
  const v = cleanText(key);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!match) return "—";
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0);
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(date);
}

function TerminePage() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [authState, setAuthState] = useState<"loading" | "unauthenticated" | "no-company" | "ready">(
    "loading",
  );
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("alle");
  const [serviceFilter, setServiceFilter] = useState("alle");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AppointmentRow | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    let cancelled = false;

    async function loadTenant() {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (cancelled) return;

      if (userError || !userData.user) {
        setAuthState("unauthenticated");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        setError("Die Termine konnten nicht geladen werden.");
        setLoading(false);
        return;
      }

      if (!profile?.company_id) {
        setAuthState("no-company");
        setLoading(false);
        return;
      }

      setCompanyId(profile.company_id);
      setAuthState("ready");
    }

    void loadTenant();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!companyId) return;

    let cancelled = false;
    const monthStart = toDateKey(year, month, 1);
    const monthEnd = toDateKey(year, month, new Date(year, month + 1, 0).getDate());

    async function loadAppointments() {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("appointments")
        .select(SELECT_COLUMNS)
        .eq("company_id", companyId!)
        .gte("appointment_date", monthStart)
        .lte("appointment_date", monthEnd)
        .order("appointment_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (cancelled) return;

      if (queryError) {
        setError("Die Termine konnten nicht geladen werden.");
        setAppointments([]);
      } else {
        setAppointments((data ?? []) as AppointmentRow[]);
      }
      setLoading(false);
    }

    void loadAppointments();
    return () => {
      cancelled = true;
    };
  }, [companyId, year, month]);

  const serviceOptions = useMemo(() => {
    const set = new Set<string>();
    for (const a of appointments) {
      const s = cleanText(a.service_type);
      if (s) set.add(s);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "de-DE"));
  }, [appointments]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return appointments.filter((a) => {
      if (statusFilter !== "alle" && cleanText(a.status).toLowerCase() !== statusFilter) {
        return false;
      }
      if (serviceFilter !== "alle" && cleanText(a.service_type) !== serviceFilter) {
        return false;
      }
      if (!term) return true;
      return [
        customerName(a.customer_name),
        serviceType(a.service_type),
        cleanText(a.address),
        cleanText(a.postal_code),
        cleanText(a.notes),
        statusLabel(a.status),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [appointments, search, serviceFilter, statusFilter]);

  const byDay = useMemo(() => {
    const map = new Map<string, AppointmentRow[]>();
    for (const a of visible) {
      const key = cleanText(a.appointment_date);
      if (!key) continue;
      const list = map.get(key);
      if (list) list.push(a);
      else map.set(key, [a]);
    }
    return map;
  }, [visible]);

  const monthLabel = new Intl.DateTimeFormat("de-DE", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(new Date(year, month, 15, 12, 0, 0));

  const days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const startDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const todayKey = (() => {
    const n = new Date();
    return toDateKey(n.getFullYear(), n.getMonth(), n.getDate());
  })();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => {
    const n = new Date();
    setCurrentDate(new Date(n.getFullYear(), n.getMonth(), 1));
  };

  if (authState === "unauthenticated") {
    return (
      <AppShell>
        <PageHeader title="Termine" description="Kundentermine Ihres Unternehmens." />
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Sie sind nicht angemeldet. Bitte melden Sie sich an, um Ihre Termine zu sehen.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (authState === "no-company") {
    return (
      <AppShell>
        <PageHeader title="Termine" description="Kundentermine Ihres Unternehmens." />
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Bitte schließen Sie zuerst die Einrichtung Ihres Unternehmens ab.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Termine"
        description={`${visible.length} Termine in ${monthLabel}.`}
      />

      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-md border border-dashed bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <Info className="size-4 shrink-0" />
          Termine werden über den KI-Mitarbeiter gebucht, verschoben oder storniert.
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Vorheriger Monat">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={today}>
              Heute
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Nächster Monat">
              <ChevronRight className="size-4" />
            </Button>
            <span className="ml-2 text-lg font-semibold">{monthLabel}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Suchen"
              className="sm:w-48"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Status</SelectItem>
                <SelectItem value="requested">Angefragt</SelectItem>
                <SelectItem value="confirmed">Bestätigt</SelectItem>
                <SelectItem value="cancelled">Storniert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Leistungen</SelectItem>
                {serviceOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <CalendarIcon className="size-4 text-muted-foreground" />
              Kalenderansicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Termine werden geladen …
              </div>
            ) : error ? (
              <p className="py-10 text-center text-sm text-destructive">{error}</p>
            ) : (
              <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border bg-muted">
                {days.map((d) => (
                  <div
                    key={d}
                    className="bg-card p-2 text-center text-xs font-medium text-muted-foreground"
                  >
                    {d}
                  </div>
                ))}
                {Array.from({ length: startDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[96px] bg-card p-2" />
                ))}
                {Array.from({ length: totalDays }).map((_, i) => {
                  const key = toDateKey(year, month, i + 1);
                  const items = byDay.get(key) ?? [];
                  return (
                    <div key={key} className="min-h-[96px] space-y-1 bg-card p-2">
                      <span
                        className={
                          key === todayKey
                            ? "inline-flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                            : "text-sm text-muted-foreground"
                        }
                      >
                        {i + 1}
                      </span>
                      {items.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setSelected(a)}
                          className="block w-full rounded border bg-muted/50 p-1.5 text-left text-[11px] leading-tight transition-colors hover:bg-muted"
                        >
                          <span className="block font-medium">
                            {formatTimeRange(a.start_time, a.end_time)}
                          </span>
                          <span className="block truncate">{customerName(a.customer_name)}</span>
                          <span className="block truncate text-muted-foreground">
                            {serviceType(a.service_type)}
                          </span>
                          <Badge variant={statusVariant(a.status)} className="mt-1 px-1 py-0 text-[10px]">
                            {statusLabel(a.status)}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {!loading && !error && visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <CalendarIcon className="size-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Keine Termine in diesem Monat</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              In {monthLabel} sind keine Termine vorhanden. Termine entstehen automatisch über den
              KI-Mitarbeiter.
            </p>
          </div>
        ) : null}
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Termindetails</DialogTitle>
            <DialogDescription>Schreibgeschützte Ansicht des Termins.</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Datum</p>
                <p>{formatDateKey(selected.appointment_date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Uhrzeit</p>
                <p>{formatTimeRange(selected.start_time, selected.end_time)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kunde</p>
                <p>{customerName(selected.customer_name)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Leistung</p>
                <p>{serviceType(selected.service_type)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Adresse</p>
                <p>
                  {[cleanText(selected.postal_code), cleanText(selected.address)]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Notizen</p>
                <p className="whitespace-pre-wrap">{cleanText(selected.notes) || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={statusVariant(selected.status)}>{statusLabel(selected.status)}</Badge>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
