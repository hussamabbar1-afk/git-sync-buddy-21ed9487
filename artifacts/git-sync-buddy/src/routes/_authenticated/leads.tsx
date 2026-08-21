import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { LeadDetailSheet } from "@/components/lead-detail-sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import {
  customerName,
  formatCents,
  formatDate,
  formatDateTime,
  leadPriorityOptions,
  leadStatusLabel,
  leadStatusOptions,
  priorityLabel,
  temperatureLabel,
} from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "Leads – HandwerkAI" },
      {
        name: "description",
        content: "Qualifizierte Kundenanfragen mit Anliegen, Dringlichkeit und Status verwalten.",
      },
      { property: "og:title", content: "Leads – HandwerkAI" },
      {
        property: "og:description",
        content: "Alle Anfragen Ihres KI-Mitarbeiters als strukturierte Leads.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LeadsPage,
});

const LEAD_LIST_COLUMNS =
  "id, name, phone, email, issue_type, issue_description, postal_code, address, urgency, status, priority, lead_score, temperature, estimated_value_cents, follow_up_at, last_activity_at, contacted_at, source, tags, customer_id, created_at";

type LeadRow = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  issue_type: string | null;
  issue_description: string | null;
  postal_code: string | null;
  address: string | null;
  urgency: string | null;
  status: string;
  priority: string | null;
  lead_score: number | null;
  temperature: string | null;
  estimated_value_cents: number | null;
  follow_up_at: string | null;
  last_activity_at: string | null;
  contacted_at: string | null;
  source: string | null;
  tags: string[] | null;
  customer_id: string | null;
  created_at: string;
};

function place(lead: LeadRow) {
  const parts = [lead.postal_code?.trim(), lead.address?.trim()].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("alle");
  const [priorityFilter, setPriorityFilter] = useState("alle");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setError("Sie sind nicht angemeldet.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileError) {
      setError("Die Leads konnten nicht geladen werden.");
      setLoading(false);
      return;
    }

    if (!profile?.company_id) {
      setError("Bitte schließen Sie zuerst die Einrichtung Ihres Unternehmens ab.");
      setLoading(false);
      return;
    }

    setCompanyId(profile.company_id);

    const { data, error: leadsError } = await supabase
      .from("leads")
      .select(LEAD_LIST_COLUMNS)
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: false });

    if (leadsError) {
      setError("Die Leads konnten nicht geladen werden.");
    } else {
      setLeads((data ?? []) as LeadRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const recentCount = useMemo(() => {
    const threshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return leads.filter((lead) => new Date(lead.created_at).getTime() >= threshold).length;
  }, [leads]);

  const visibleLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (statusFilter !== "alle" && (lead.status ?? "").toLowerCase() !== statusFilter) {
        return false;
      }
      if (priorityFilter !== "alle" && (lead.priority ?? "").toLowerCase() !== priorityFilter) {
        return false;
      }
      if (!term) return true;
      return [
        customerName(lead.name),
        lead.phone ?? "",
        lead.email ?? "",
        lead.issue_type ?? "",
        lead.issue_description ?? "",
        lead.postal_code ?? "",
        lead.address ?? "",
        lead.source ?? "",
        (lead.tags ?? []).join(" "),
        leadStatusLabel(lead.status),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [leads, search, statusFilter, priorityFilter]);

  return (
    <AppShell>
      <PageHeader
        title="Leads"
        description={`${recentCount} neue Anfragen in den letzten 7 Tagen.`}
      />

      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-base">Alle Leads</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Kunde, Anliegen, Tag oder Quelle"
              className="sm:w-64"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Leads durchsuchen"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44" aria-label="Statusfilter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Status</SelectItem>
                {leadStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {leadStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40" aria-label="Prioritätsfilter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Prioritäten</SelectItem>
                {leadPriorityOptions.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priorityLabel(priority)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Leads werden geladen …
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-destructive">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Anliegen</TableHead>
                    <TableHead>Ort</TableHead>
                    <TableHead>Priorität</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Wert</TableHead>
                    <TableHead>Follow-up</TableHead>
                    <TableHead>Eingang</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                        Keine Leads gefunden.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleLeads.map((lead) => (
                      <TableRow
                        key={lead.id}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedLeadId(lead.id);
                          setDetailOpen(true);
                        }}
                      >
                        <TableCell className="font-medium">
                          {customerName(lead.name)}
                          <span className="block text-xs text-muted-foreground">
                            {lead.source ? `Quelle: ${lead.source}` : "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span>{lead.issue_type?.trim() || "—"}</span>
                          {lead.issue_description?.trim() ? (
                            <span className="block max-w-xs truncate text-xs text-muted-foreground">
                              {lead.issue_description}
                            </span>
                          ) : null}
                          {lead.tags && lead.tags.length > 0 ? (
                            <span className="block max-w-xs truncate text-[11px] text-muted-foreground">
                              {lead.tags.join(", ")}
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{place(lead)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              (lead.priority ?? "").toLowerCase() === "urgent"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {priorityLabel(lead.priority)}
                          </Badge>
                          {lead.temperature ? (
                            <span className="block text-[11px] text-muted-foreground">
                              {temperatureLabel(lead.temperature)}
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-right">{lead.lead_score ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          {lead.estimated_value_cents === null
                            ? "—"
                            : formatCents(lead.estimated_value_cents)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {lead.follow_up_at ? formatDateTime(lead.follow_up_at) : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(lead.created_at)}
                          <span className="block text-[11px]">
                            {lead.last_activity_at
                              ? `Aktivität: ${formatDate(lead.last_activity_at)}`
                              : ""}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={lead.status === "new" ? "default" : "outline"}>
                            {leadStatusLabel(lead.status)}
                          </Badge>
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

      <LeadDetailSheet
        leadId={selectedLeadId}
        companyId={companyId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSaved={() => void load()}
      />
    </AppShell>
  );
}
