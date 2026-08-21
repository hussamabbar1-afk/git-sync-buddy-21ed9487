import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  asArray,
  asRecord,
  bool,
  customerName,
  formatCents,
  formatDate,
  formatDateTime,
  leadStatusLabel,
  num,
  optionalNum,
  str,
  stringArray,
} from "@/lib/crm";

type Customer = {
  display_name: string | null;
  customer_number: string | null;
  customer_type: string | null;
  phone: string | null;
  email: string | null;
  postal_code: string | null;
  address: string | null;
  city: string | null;
  preferred_language: string | null;
  notes: string | null;
  tags: string[];
  last_activity_at: string | null;
};

type Summary = {
  lead_count: number;
  open_lead_count: number;
  appointment_count: number;
  upcoming_appointment_count: number;
  quote_count: number;
  accepted_quote_value_cents: number;
  job_count: number;
  open_job_count: number;
  invoice_count: number;
  open_invoice_value_cents: number;
  paid_invoice_value_cents: number;
  active_contract_count: number;
  asset_count: number;
  open_task_count: number;
  average_rating: number;
};

type ListItem = {
  key: string;
  title: string;
  subtitle: string | null;
  meta: string | null;
};

type Customer360 = {
  found: boolean;
  customer: Customer;
  summary: Summary;
  leads: ListItem[];
  appointments: ListItem[];
  quotes: ListItem[];
  jobs: ListItem[];
  invoices: ListItem[];
  contracts: ListItem[];
  assets: ListItem[];
  tasks: ListItem[];
  activity: ListItem[];
};

function itemKey(record: Record<string, unknown>, index: number, prefix: string) {
  return str(record["id"]) ?? `${prefix}-${index}`;
}

function parse(payload: unknown): Customer360 {
  const root = asRecord(payload);
  const customer = asRecord(root["customer"]);
  const summary = asRecord(root["summary"]);

  const leads = asArray(root["leads"]).map((entry, index) => {
    const row = asRecord(entry);
    return {
      key: itemKey(row, index, "lead"),
      title: str(row["issue_type"]) ?? "Anfrage",
      subtitle: str(row["issue_description"]),
      meta: `${leadStatusLabel(str(row["status"]))} · ${formatDate(str(row["created_at"]))}`,
    } satisfies ListItem;
  });

  const appointments = asArray(root["appointments"]).map((entry, index) => {
    const row = asRecord(entry);
    return {
      key: itemKey(row, index, "appointment"),
      title: str(row["service_name"]) ?? "Termin",
      subtitle: str(row["notes"]),
      meta: `${formatDate(str(row["appointment_date"]))} ${str(row["start_time"]) ?? ""} · ${
        str(row["status"]) ?? "—"
      }`,
    } satisfies ListItem;
  });

  const quotes = asArray(root["quotes"]).map((entry, index) => {
    const row = asRecord(entry);
    return {
      key: itemKey(row, index, "quote"),
      title: str(row["quote_number"]) ?? "Angebot",
      subtitle: formatCents(optionalNum(row["total_cents"])),
      meta: `${str(row["status"]) ?? "—"} · ${formatDate(str(row["created_at"]))}`,
    } satisfies ListItem;
  });

  const jobs = asArray(root["jobs"]).map((entry, index) => {
    const row = asRecord(entry);
    return {
      key: itemKey(row, index, "job"),
      title: str(row["title"]) ?? str(row["job_number"]) ?? "Auftrag",
      subtitle: str(row["description"]),
      meta: `${str(row["status"]) ?? "—"} · ${formatDate(str(row["scheduled_date"]))}`,
    } satisfies ListItem;
  });

  const invoices = asArray(root["invoices"]).map((entry, index) => {
    const row = asRecord(entry);
    return {
      key: itemKey(row, index, "invoice"),
      title: str(row["invoice_number"]) ?? "Rechnung",
      subtitle: formatCents(optionalNum(row["total_cents"])),
      meta: `${str(row["status"]) ?? "—"} · ${formatDate(str(row["due_date"]))}`,
    } satisfies ListItem;
  });

  const contracts = asArray(root["contracts"]).map((entry, index) => {
    const row = asRecord(entry);
    return {
      key: itemKey(row, index, "contract"),
      title: str(row["title"]) ?? "Wartungsvertrag",
      subtitle: str(row["interval_months"]) ? `${str(row["interval_months"])} Monate` : null,
      meta: `${str(row["status"]) ?? "—"} · nächste Fälligkeit ${formatDate(
        str(row["next_due_date"]),
      )}`,
    } satisfies ListItem;
  });

  const assets = asArray(root["assets"]).map((entry, index) => {
    const row = asRecord(entry);
    return {
      key: itemKey(row, index, "asset"),
      title: str(row["name"]) ?? str(row["asset_type"]) ?? "Anlage",
      subtitle: [str(row["manufacturer"]), str(row["model"])].filter(Boolean).join(" ") || null,
      meta: `Installiert: ${formatDate(str(row["installed_at"]))}`,
    } satisfies ListItem;
  });

  const tasks = asArray(root["tasks"]).map((entry, index) => {
    const row = asRecord(entry);
    return {
      key: itemKey(row, index, "task"),
      title: str(row["title"]) ?? "Aufgabe",
      subtitle: str(row["description"]),
      meta: `${str(row["status"]) ?? "—"} · fällig ${formatDateTime(str(row["due_at"]))}`,
    } satisfies ListItem;
  });

  const activity = asArray(root["activity"])
    .slice(0, 25)
    .map((entry, index) => {
      const row = asRecord(entry);
      return {
        key: itemKey(row, index, "activity"),
        title: str(row["action"]) ?? "Aktivität",
        subtitle: str(row["entity_type"]),
        meta: formatDateTime(str(row["created_at"])),
      } satisfies ListItem;
    });

  return {
    found: bool(root["found"]),
    customer: {
      display_name: str(customer["display_name"]),
      customer_number: str(customer["customer_number"]),
      customer_type: str(customer["customer_type"]),
      phone: str(customer["phone"]),
      email: str(customer["email"]),
      postal_code: str(customer["postal_code"]),
      address: str(customer["address"]),
      city: str(customer["city"]),
      preferred_language: str(customer["preferred_language"]),
      notes: str(customer["notes"]),
      tags: stringArray(customer["tags"]),
      last_activity_at: str(customer["last_activity_at"]),
    },
    summary: {
      lead_count: num(summary["lead_count"]),
      open_lead_count: num(summary["open_lead_count"]),
      appointment_count: num(summary["appointment_count"]),
      upcoming_appointment_count: num(summary["upcoming_appointment_count"]),
      quote_count: num(summary["quote_count"]),
      accepted_quote_value_cents: num(summary["accepted_quote_value_cents"]),
      job_count: num(summary["job_count"]),
      open_job_count: num(summary["open_job_count"]),
      invoice_count: num(summary["invoice_count"]),
      open_invoice_value_cents: num(summary["open_invoice_value_cents"]),
      paid_invoice_value_cents: num(summary["paid_invoice_value_cents"]),
      active_contract_count: num(summary["active_contract_count"]),
      asset_count: num(summary["asset_count"]),
      open_task_count: num(summary["open_task_count"]),
      average_rating: num(summary["average_rating"]),
    },
    leads,
    appointments,
    quotes,
    jobs,
    invoices,
    contracts,
    assets,
    tasks,
    activity,
  };
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
        {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="text-sm">{children}</p>
    </div>
  );
}

function ItemList({ items, empty }: { items: ListItem[]; empty: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className="space-y-2">
      {items.slice(0, 10).map((item) => (
        <li key={item.key} className="rounded-md border p-3">
          <p className="text-sm font-medium">{item.title}</p>
          {item.subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
          ) : null}
          {item.meta ? <p className="text-[11px] text-muted-foreground">{item.meta}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export function CustomerDetailSheet({
  customerKey,
  open,
  onOpenChange,
}: {
  customerKey: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [data, setData] = useState<Customer360 | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !customerKey) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setData(null);

      const { data: payload, error: rpcError } = await supabase.rpc("get_customer_360", {
        p_customer_key: customerKey!,
      });

      if (cancelled) return;

      if (rpcError) {
        setError("Die Kundendaten konnten nicht geladen werden.");
        setLoading(false);
        return;
      }

      const parsed = parse(payload);
      if (!parsed.found) {
        setError("Dieser Kunde wurde nicht gefunden.");
        setLoading(false);
        return;
      }

      setData(parsed);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, customerKey]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{customerName(data?.customer.display_name)}</SheetTitle>
          <SheetDescription>
            Kundenübersicht mit Anfragen, Terminen, Geschäftsdaten und Aktivität.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-8">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Kundendaten werden geladen …
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-destructive">{error}</p>
          ) : data ? (
            <Tabs defaultValue="uebersicht">
              <TabsList className="w-full">
                <TabsTrigger value="uebersicht">Übersicht</TabsTrigger>
                <TabsTrigger value="leads">Leads &amp; Termine</TabsTrigger>
                <TabsTrigger value="geschaeft">Geschäft</TabsTrigger>
                <TabsTrigger value="aktivitaet">Aktivität</TabsTrigger>
              </TabsList>

              <TabsContent value="uebersicht" className="space-y-5 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Kundennummer">{data.customer.customer_number ?? "—"}</Field>
                  <Field label="Kundentyp">{data.customer.customer_type ?? "—"}</Field>
                  <Field label="Telefon">{data.customer.phone ?? "—"}</Field>
                  <Field label="E-Mail">{data.customer.email ?? "—"}</Field>
                  <Field label="PLZ / Ort">
                    {[data.customer.postal_code, data.customer.city].filter(Boolean).join(" ") ||
                      "—"}
                  </Field>
                  <Field label="Adresse">{data.customer.address ?? "—"}</Field>
                  <Field label="Sprache">{data.customer.preferred_language ?? "—"}</Field>
                  <Field label="Letzte Aktivität">
                    {formatDateTime(data.customer.last_activity_at)}
                  </Field>
                </div>

                {data.customer.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.customer.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                {data.customer.notes ? (
                  <Field label="Notizen">
                    <span className="whitespace-pre-wrap">{data.customer.notes}</span>
                  </Field>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric
                    label="Leads"
                    value={String(data.summary.lead_count)}
                    hint={`${data.summary.open_lead_count} offen`}
                  />
                  <Metric
                    label="Termine"
                    value={String(data.summary.appointment_count)}
                    hint={`${data.summary.upcoming_appointment_count} anstehend`}
                  />
                  <Metric
                    label="Aufträge"
                    value={String(data.summary.job_count)}
                    hint={`${data.summary.open_job_count} offen`}
                  />
                  <Metric
                    label="Angebote"
                    value={String(data.summary.quote_count)}
                    hint={`angenommen ${formatCents(data.summary.accepted_quote_value_cents)}`}
                  />
                  <Metric
                    label="Rechnungen"
                    value={String(data.summary.invoice_count)}
                    hint={`offen ${formatCents(
                      data.summary.open_invoice_value_cents,
                    )} · bezahlt ${formatCents(data.summary.paid_invoice_value_cents)}`}
                  />
                  <Metric
                    label="Verträge & Anlagen"
                    value={`${data.summary.active_contract_count} / ${data.summary.asset_count}`}
                    hint={`${data.summary.open_task_count} offene Aufgaben · Bewertung ${
                      data.summary.average_rating || "—"
                    }`}
                  />
                </div>
              </TabsContent>

              <TabsContent value="leads" className="space-y-5 pt-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Leads</h3>
                  <ItemList items={data.leads} empty="Keine Leads vorhanden." />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Termine</h3>
                  <ItemList items={data.appointments} empty="Keine Termine vorhanden." />
                </div>
              </TabsContent>

              <TabsContent value="geschaeft" className="space-y-5 pt-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Angebote</h3>
                  <ItemList items={data.quotes} empty="Keine Angebote vorhanden." />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Aufträge</h3>
                  <ItemList items={data.jobs} empty="Keine Aufträge vorhanden." />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Rechnungen</h3>
                  <ItemList items={data.invoices} empty="Keine Rechnungen vorhanden." />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Wartungsverträge</h3>
                  <ItemList items={data.contracts} empty="Keine Verträge vorhanden." />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Anlagen</h3>
                  <ItemList items={data.assets} empty="Keine Anlagen erfasst." />
                </div>
              </TabsContent>

              <TabsContent value="aktivitaet" className="space-y-5 pt-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Offene Aufgaben</h3>
                  <ItemList items={data.tasks} empty="Keine Aufgaben vorhanden." />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Verlauf</h3>
                  <ItemList items={data.activity} empty="Keine Aktivität vorhanden." />
                </div>
              </TabsContent>
            </Tabs>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
