import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { CustomerDetailSheet } from "@/components/customer-detail-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { asRecord, customerName, formatCents, formatDateTime, num } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/kunden")({
  head: () => ({
    meta: [
      { title: "Kunden – HandwerkAI" },
      {
        name: "description",
        content:
          "Kundenstamm mit Kontaktdaten, offenen Leads, Terminen, Aufträgen und offenen Rechnungen.",
      },
      { property: "og:title", content: "Kunden – HandwerkAI" },
      {
        property: "og:description",
        content: "Zentrales Kundenverzeichnis Ihres SHK-Betriebs mit Kundenhistorie.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KundenPage,
});

type DirectoryRow = {
  customer_key: string;
  display_name: string | null;
  phone: string | null;
  email: string | null;
  postal_code: string | null;
  address: string | null;
  last_activity_at: string | null;
  open_lead_count: number;
  lead_count: number;
  appointment_count: number;
  confirmed_appointment_count: number;
  open_job_count: number;
  job_count: number;
  invoice_count: number;
  open_invoice_value_cents: number;
};

type Metrics = {
  total_customers: number;
  active_30d: number;
  with_email: number;
  with_phone: number;
};

function KundenPage() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<DirectoryRow[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMetrics() {
      const { data, error: rpcError } = await supabase.rpc("get_customer_master_metrics");
      if (cancelled || rpcError) return;
      const record = asRecord(data);
      setMetrics({
        total_customers: num(record["total_customers"]),
        active_30d: num(record["active_30d"]),
        with_email: num(record["with_email"]),
        with_phone: num(record["with_phone"]),
      });
    }

    void loadMetrics();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const term = search.trim();
    setLoading(true);

    const timer = setTimeout(async () => {
      const { data, error: rpcError } = await supabase.rpc(
        "get_customer_directory",
        term.length > 0 ? { p_query: term, p_limit: 100 } : { p_limit: 100 },
      );


      if (cancelled) return;

      if (rpcError) {
        setError("Der Kundenstamm konnte nicht geladen werden.");
        setRows([]);
      } else {
        setError(null);
        setRows((data ?? []) as DirectoryRow[]);
      }
      setLoading(false);
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  const cards = [
    { label: "Kunden gesamt", value: metrics?.total_customers },
    { label: "Aktiv (30 Tage)", value: metrics?.active_30d },
    { label: "Mit E-Mail", value: metrics?.with_email },
    { label: "Mit Telefon", value: metrics?.with_phone },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Kunden"
        description="Zentrales Kundenverzeichnis mit Historie aus Leads, Terminen und Aufträgen."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {card.value === undefined ? "—" : card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Kundenstamm</CardTitle>
          <Input
            placeholder="Name, Telefon, E-Mail oder Ort suchen"
            className="sm:w-72"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Kunden durchsuchen"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Kunden werden geladen …
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-destructive">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Kontakt</TableHead>
                    <TableHead>Ort</TableHead>
                    <TableHead className="text-right">Offene Leads</TableHead>
                    <TableHead className="text-right">Termine</TableHead>
                    <TableHead className="text-right">Offene Aufträge</TableHead>
                    <TableHead className="text-right">Offene Rechnungen</TableHead>
                    <TableHead>Letzter Kontakt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                        Keine Kunden gefunden.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow
                        key={row.customer_key}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedKey(row.customer_key);
                          setDetailOpen(true);
                        }}
                      >
                        <TableCell className="font-medium">
                          {customerName(row.display_name)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <span className="block text-xs">{row.phone ?? "—"}</span>
                          <span className="block text-xs">{row.email ?? "—"}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {[row.postal_code, row.address].filter(Boolean).join(" · ") || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.open_lead_count} / {row.lead_count}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.confirmed_appointment_count} / {row.appointment_count}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.open_job_count} / {row.job_count}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCents(row.open_invoice_value_cents)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(row.last_activity_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CustomerDetailSheet
        customerKey={selectedKey}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </AppShell>
  );
}
