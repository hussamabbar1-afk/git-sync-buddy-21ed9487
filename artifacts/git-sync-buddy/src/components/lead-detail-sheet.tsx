import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  centsToEuroInput,
  customerName,
  euroInputToCents,
  formatCents,
  formatDateTime,
  fromDateTimeLocal,
  leadPriorityOptions,
  leadStatusLabel,
  leadStatusOptions,
  parseTags,
  priorityLabel,
  temperatureLabel,
  toDateTimeLocal,
  urgencyLabel,
} from "@/lib/crm";

const LEAD_DETAIL_COLUMNS =
  "id, name, phone, email, postal_code, address, issue_type, issue_description, urgency, preferred_contact_method, preferred_appointment, status, priority, lead_score, temperature, estimated_value_cents, follow_up_at, last_activity_at, contacted_at, lost_reason, tags, source, customer_id, created_at, updated_at, conversation_id";

type LeadDetail = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  postal_code: string | null;
  address: string | null;
  issue_type: string | null;
  issue_description: string | null;
  urgency: string | null;
  preferred_contact_method: string | null;
  preferred_appointment: string | null;
  status: string;
  priority: string | null;
  lead_score: number | null;
  temperature: string | null;
  estimated_value_cents: number | null;
  follow_up_at: string | null;
  last_activity_at: string | null;
  contacted_at: string | null;
  lost_reason: string | null;
  tags: string[] | null;
  source: string | null;
  customer_id: string | null;
  created_at: string;
  updated_at: string;
  conversation_id: string | null;
};

type MessageRow = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  postal_code: string;
  issue_type: string;
  issue_description: string;
  urgency: string;
  preferred_contact_method: string;
  status: string;
  priority: string;
  follow_up_at: string;
  estimated_value: string;
  lost_reason: string;
  tags: string;
};

const urgencyOptions = ["low", "normal", "high", "emergency"] as const;
const contactMethodOptions = ["phone", "email", "whatsapp", "sms"] as const;

function contactMethodLabel(method: string) {
  switch (method) {
    case "phone":
      return "Telefon";
    case "email":
      return "E-Mail";
    case "whatsapp":
      return "WhatsApp";
    case "sms":
      return "SMS";
    default:
      return method;
  }
}

function value(input: string | null | undefined) {
  const text = (input ?? "").trim();
  if (!text || text.toUpperCase() === "EMPTY") return "—";
  return text;
}

export function urgencyLabelDetail(urgency: string | null) {
  return urgencyLabel(urgency);
}

export function statusLabelDetail(status: string | null) {
  return leadStatusLabel(status);
}

function toForm(lead: LeadDetail): FormState {
  return {
    name: lead.name ?? "",
    phone: lead.phone ?? "",
    email: lead.email ?? "",
    address: lead.address ?? "",
    postal_code: lead.postal_code ?? "",
    issue_type: lead.issue_type ?? "",
    issue_description: lead.issue_description ?? "",
    urgency: (lead.urgency ?? "normal").toLowerCase(),
    preferred_contact_method: (lead.preferred_contact_method ?? "").toLowerCase(),
    status: (lead.status ?? "new").toLowerCase(),
    priority: (lead.priority ?? "normal").toLowerCase(),
    follow_up_at: toDateTimeLocal(lead.follow_up_at),
    estimated_value: centsToEuroInput(lead.estimated_value_cents),
    lost_reason: lead.lost_reason ?? "",
    tags: (lead.tags ?? []).join(", "),
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="text-sm">{children}</p>
    </div>
  );
}

export function LeadDetailSheet({
  leadId,
  companyId,
  open,
  onOpenChange,
  onSaved,
}: {
  leadId: string | null;
  companyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadLead = useCallback(async () => {
    if (!leadId || !companyId) return;

    const { data, error: leadError } = await supabase
      .from("leads")
      .select(LEAD_DETAIL_COLUMNS)
      .eq("id", leadId)
      .eq("company_id", companyId)
      .maybeSingle();

    if (leadError) {
      setError("Der Lead konnte nicht geladen werden.");
      return null;
    }
    if (!data) {
      setError("Dieser Lead wurde nicht gefunden.");
      return null;
    }

    const detail = data as LeadDetail;
    setLead(detail);
    setForm(toForm(detail));
    return detail;
  }, [leadId, companyId]);

  useEffect(() => {
    if (!open || !leadId || !companyId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setMessagesError(null);
      setSaveError(null);
      setSaveSuccess(false);
      setLead(null);
      setForm(null);
      setMessages([]);

      const detail = await loadLead();
      if (cancelled) return;
      setLoading(false);
      if (!detail) return;

      if (detail.conversation_id) {
        const { data: conversation, error: conversationError } = await supabase
          .from("conversations")
          .select("id")
          .eq("id", detail.conversation_id)
          .eq("company_id", companyId!)
          .maybeSingle();

        if (cancelled) return;

        if (conversationError || !conversation) {
          if (conversationError)
            setMessagesError("Der Gesprächsverlauf konnte nicht geladen werden.");
          return;
        }

        const { data: messageRows, error: messagesLoadError } = await supabase
          .from("messages")
          .select("id, role, content, created_at")
          .eq("conversation_id", conversation.id)
          .order("created_at", { ascending: true });

        if (cancelled) return;

        if (messagesLoadError) {
          setMessagesError("Der Gesprächsverlauf konnte nicht geladen werden.");
        } else {
          setMessages((messageRows ?? []) as MessageRow[]);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, leadId, companyId, loadLead]);

  function update<K extends keyof FormState>(key: K, next: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: next } : prev));
    setSaveSuccess(false);
  }

  async function handleSave() {
    if (!lead || !form || !companyId) return;

    setSaveError(null);
    setSaveSuccess(false);

    const parsedValue = euroInputToCents(form.estimated_value);
    if ("error" in parsedValue) {
      setSaveError(parsedValue.error);
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase
      .from("leads")
      .update({
        name: form.name.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        postal_code: form.postal_code.trim() || null,
        issue_type: form.issue_type.trim() || null,
        issue_description: form.issue_description.trim() || null,
        urgency: form.urgency || null,
        preferred_contact_method: form.preferred_contact_method || null,
        status: form.status,
        priority: form.priority,
        follow_up_at: fromDateTimeLocal(form.follow_up_at),
        estimated_value_cents: parsedValue.cents,
        lost_reason: form.status === "lost" ? form.lost_reason.trim() || null : null,
        tags: parseTags(form.tags),
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead.id)
      .eq("company_id", companyId);

    if (updateError) {
      setSaving(false);
      setSaveError("Die Änderungen konnten nicht gespeichert werden.");
      return;
    }

    await loadLead();
    setSaving(false);
    setSaveSuccess(true);
    onSaved?.();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{lead ? customerName(lead.name) : "Lead-Details"}</SheetTitle>
          <SheetDescription>
            Alle Angaben zu dieser Anfrage inklusive Gesprächsverlauf.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-8">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Lead wird geladen …
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-destructive">{error}</p>
          ) : lead && form ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Status">
                  <Badge variant={lead.status === "new" ? "default" : "outline"}>
                    {leadStatusLabel(lead.status)}
                  </Badge>
                </Field>
                <Field label="Priorität">
                  <Badge
                    variant={
                      (lead.priority ?? "").toLowerCase() === "urgent" ? "destructive" : "secondary"
                    }
                  >
                    {priorityLabel(lead.priority)}
                  </Badge>
                </Field>
                <Field label="Lead-Score">{lead.lead_score ?? "—"}</Field>
                <Field label="Temperatur">{temperatureLabel(lead.temperature)}</Field>
                <Field label="Geschätzter Wert">{formatCents(lead.estimated_value_cents)}</Field>
                <Field label="Quelle">{value(lead.source)}</Field>
                <Field label="Wunschtermin">{value(lead.preferred_appointment)}</Field>
                <Field label="Follow-up">{formatDateTime(lead.follow_up_at)}</Field>
                <Field label="Erstkontakt">{formatDateTime(lead.contacted_at)}</Field>
                <Field label="Letzte Aktivität">{formatDateTime(lead.last_activity_at)}</Field>
                <Field label="Eingang">{formatDateTime(lead.created_at)}</Field>
                <Field label="Zuletzt aktualisiert">{formatDateTime(lead.updated_at)}</Field>
                <Field label="Kundenakte">
                  {lead.customer_id ? "Mit Kundenstamm verknüpft" : "Noch nicht verknüpft"}
                </Field>
                <Field label="Dringlichkeit">
                  <Badge
                    variant={
                      ["Notfall", "Dringend"].includes(urgencyLabel(lead.urgency))
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {urgencyLabel(lead.urgency)}
                  </Badge>
                </Field>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Lead bearbeiten</h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="lead-name">Kunde</Label>
                    <Input
                      id="lead-name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lead-phone">Telefon</Label>
                    <Input
                      id="lead-phone"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lead-email">E-Mail</Label>
                    <Input
                      id="lead-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lead-postal">PLZ</Label>
                    <Input
                      id="lead-postal"
                      value={form.postal_code}
                      onChange={(e) => update("postal_code", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="lead-address">Adresse</Label>
                    <Input
                      id="lead-address"
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lead-issue">Anliegen</Label>
                    <Input
                      id="lead-issue"
                      value={form.issue_type}
                      onChange={(e) => update("issue_type", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lead-urgency">Dringlichkeit</Label>
                    <Select
                      value={form.urgency}
                      onValueChange={(next) => update("urgency", next)}
                    >
                      <SelectTrigger id="lead-urgency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {urgencyOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {urgencyLabel(option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="lead-description">Beschreibung</Label>
                    <Textarea
                      id="lead-description"
                      rows={4}
                      value={form.issue_description}
                      onChange={(e) => update("issue_description", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lead-status">Status</Label>
                    <Select value={form.status} onValueChange={(next) => update("status", next)}>
                      <SelectTrigger id="lead-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {leadStatusOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {leadStatusLabel(option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lead-priority">Priorität</Label>
                    <Select
                      value={form.priority}
                      onValueChange={(next) => update("priority", next)}
                    >
                      <SelectTrigger id="lead-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {leadPriorityOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {priorityLabel(option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lead-contact-method">Bevorzugter Kontaktweg</Label>
                    <Select
                      value={form.preferred_contact_method}
                      onValueChange={(next) => update("preferred_contact_method", next)}
                    >
                      <SelectTrigger id="lead-contact-method">
                        <SelectValue placeholder="Nicht angegeben" />
                      </SelectTrigger>
                      <SelectContent>
                        {contactMethodOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {contactMethodLabel(option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lead-followup">Follow-up</Label>
                    <Input
                      id="lead-followup"
                      type="datetime-local"
                      value={form.follow_up_at}
                      onChange={(e) => update("follow_up_at", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lead-value">Geschätzter Wert (EUR)</Label>
                    <Input
                      id="lead-value"
                      inputMode="decimal"
                      placeholder="z. B. 1250,00"
                      value={form.estimated_value}
                      onChange={(e) => update("estimated_value", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lead-tags">Tags (kommagetrennt)</Label>
                    <Input
                      id="lead-tags"
                      value={form.tags}
                      onChange={(e) => update("tags", e.target.value)}
                    />
                  </div>
                  {form.status === "lost" ? (
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="lead-lost-reason">Verlustgrund</Label>
                      <Textarea
                        id="lead-lost-reason"
                        rows={2}
                        placeholder="Warum wurde der Lead verloren?"
                        value={form.lost_reason}
                        onChange={(e) => update("lost_reason", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Empfohlen, damit Auswertungen später aussagekräftig bleiben.
                      </p>
                    </div>
                  ) : null}
                </div>

                {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}
                {saveSuccess ? (
                  <p className="text-sm text-emerald-600">Änderungen gespeichert.</p>
                ) : null}

                <div className="flex gap-2">
                  <Button onClick={() => void handleSave()} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" /> Speichern …
                      </>
                    ) : (
                      "Änderungen speichern"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={saving}
                    onClick={() => {
                      setForm(toForm(lead));
                      setSaveError(null);
                      setSaveSuccess(false);
                    }}
                  >
                    Zurücksetzen
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Gesprächsverlauf</h3>
                {messagesError ? (
                  <p className="text-sm text-destructive">{messagesError}</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Für diesen Lead liegt kein Gesprächsverlauf vor.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div key={message.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium">
                            {message.role === "user" ? "Kunde" : "KI-Mitarbeiter"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(message.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
