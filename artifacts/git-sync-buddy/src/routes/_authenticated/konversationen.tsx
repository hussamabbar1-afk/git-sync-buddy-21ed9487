import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/konversationen")({
  head: () => ({
    meta: [
      { title: "Konversationen – HandwerkAI" },
      {
        name: "description",
        content: "Alle Kundengespräche Ihres KI-Mitarbeiters nachlesen und nachverfolgen.",
      },
      { property: "og:title", content: "Konversationen – HandwerkAI" },
      {
        property: "og:description",
        content: "Gesprächsverläufe aus Website-Chat und Anfragen im Überblick.",
      },
    ],
  }),
  component: ConversationsPage,
});

type ConversationRow = {
  id: string;
  company_id: string;
  widget_key: string;
  status: string;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_phone: string | null;
  created_at: string;
  updated_at: string;
  handoff_requested_at: string | null;
  handoff_reason: string | null;
};

type LeadRow = {
  id: string;
  conversation_id: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  postal_code: string | null;
  address: string | null;
  issue_type: string | null;
  issue_description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${dateTimeFormatter.format(date)} Uhr`;
}

function clean(value: string | null | undefined) {
  const text = (value ?? "").trim();
  if (!text || text.toUpperCase() === "EMPTY") return "";
  return text;
}

function customerName(conversation: ConversationRow, lead?: LeadRow) {
  return (
    clean(lead?.name) ||
    clean(conversation.visitor_name) ||
    clean(lead?.phone) ||
    clean(conversation.visitor_phone) ||
    clean(lead?.email) ||
    clean(conversation.visitor_email) ||
    "Unbekannter Kunde"
  );
}

function preview(lead?: LeadRow) {
  return clean(lead?.issue_description) || clean(lead?.issue_type) || "Keine Vorschau verfügbar";
}

function statusLabel(status: string) {
  const value = (status ?? "").toLowerCase();
  if (value === "open") return "Offen";
  if (value === "needs_human") return "Mitarbeiter benötigt";
  if (value === "closed" || value === "resolved") return "Abgeschlossen";
  if (!value) return "Unbekannt";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function roleLabel(role: string) {
  switch ((role ?? "").toLowerCase()) {
    case "user":
      return "Kunde";
    case "assistant":
      return "KI";
    case "system":
      return "System";
    default:
      return role;
  }
}

function initials(label: string) {
  const parts = label.split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "?";
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function needsHuman(conversation: ConversationRow) {
  return (conversation.status ?? "").toLowerCase() === "needs_human";
}

function sortConversations(rows: ConversationRow[]) {
  return [...rows].sort((a, b) => {
    const priority = Number(needsHuman(b)) - Number(needsHuman(a));
    if (priority !== 0) return priority;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [resolveSuccess, setResolveSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        if (!cancelled) {
          setError("Sie sind nicht angemeldet.");
          setLoading(false);
        }
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        setError("Die Konversationen konnten nicht geladen werden.");
        setLoading(false);
        return;
      }

      if (!profile?.company_id) {
        setError("Bitte schließen Sie zuerst die Einrichtung Ihres Unternehmens ab.");
        setLoading(false);
        return;
      }

      const companyId = profile.company_id;

      const [conversationsResult, leadsResult] = await Promise.all([
        supabase
          .from("conversations")
          .select(
            "id, company_id, widget_key, status, visitor_name, visitor_email, visitor_phone, created_at, updated_at, handoff_requested_at, handoff_reason",
          )
          .eq("company_id", companyId)
          .order("updated_at", { ascending: false }),
        supabase
          .from("leads")
          .select(
            "id, conversation_id, name, phone, email, postal_code, address, issue_type, issue_description, status, created_at, updated_at",
          )
          .eq("company_id", companyId),
      ]);

      if (cancelled) return;

      if (conversationsResult.error || leadsResult.error) {
        setError("Die Konversationen konnten nicht geladen werden.");
        setLoading(false);
        return;
      }

      setConversations(sortConversations((conversationsResult.data ?? []) as ConversationRow[]));
      setLeads(leadsResult.data ?? []);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const leadByConversation = useMemo(() => {
    const map = new Map<string, LeadRow>();
    for (const lead of leads) {
      if (lead.conversation_id) map.set(lead.conversation_id, lead);
    }
    return map;
  }, [leads]);

  const visibleConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((conversation) => {
      const lead = leadByConversation.get(conversation.id);
      return [
        customerName(conversation, lead),
        conversation.visitor_phone ?? "",
        conversation.visitor_email ?? "",
        lead?.phone ?? "",
        lead?.email ?? "",
        lead?.postal_code ?? "",
        lead?.address ?? "",
        lead?.issue_type ?? "",
        lead?.issue_description ?? "",
        conversation.status ?? "",
        statusLabel(conversation.status),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [conversations, leadByConversation, search]);

  useEffect(() => {
    if (!visibleConversations.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !visibleConversations.some((item) => item.id === selectedId)) {
      setSelectedId(visibleConversations[0]!.id);
    }
  }, [visibleConversations, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      setMessagesError(null);
      setMessagesLoading(false);
      return;
    }

    let cancelled = false;
    setMessagesLoading(true);
    setMessagesError(null);

    async function loadMessages(conversationId: string) {
      const { data, error: messagesLoadError } = await supabase
        .from("messages")
        .select("id, conversation_id, role, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (messagesLoadError) {
        setMessagesError("Der Gesprächsverlauf konnte nicht geladen werden.");
        setMessages([]);
      } else {
        setMessages(data ?? []);
      }
      setMessagesLoading(false);
    }

    void loadMessages(selectedId);
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const recentCount = useMemo(() => {
    const threshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return conversations.filter((item) => new Date(item.created_at).getTime() >= threshold).length;
  }, [conversations]);

  const selectedConversation = conversations.find((item) => item.id === selectedId) ?? null;

  const handleResolve = async () => {
    if (!selectedConversation || resolving) return;
    setResolving(true);
    setResolveError(null);
    setResolveSuccess(null);

    const { error: updateError } = await supabase
      .from("conversations")
      .update({ status: "resolved", updated_at: new Date().toISOString() })
      .eq("id", selectedConversation.id);

    setResolving(false);

    if (updateError) {
      setResolveError(`Die Übergabe konnte nicht abgeschlossen werden: ${updateError.message}`);
      return;
    }

    setConversations((prev) =>
      sortConversations(
        prev.map((item) =>
          item.id === selectedConversation.id ? { ...item, status: "resolved" } : item,
        ),
      ),
    );
    setResolveSuccess("Übergabe als erledigt markiert.");
  };

  const selectedLead = selectedConversation
    ? leadByConversation.get(selectedConversation.id)
    : undefined;

  return (
    <AppShell>
      <PageHeader
        title="Konversationen"
        description={`${recentCount} Gespräche in den letzten 7 Tagen.`}
      />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="text-base">Posteingang</CardTitle>
            <Input
              placeholder="Gespräche durchsuchen"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </CardHeader>
          <CardContent className="divide-y p-0">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-6 py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Konversationen werden geladen …
              </div>
            ) : error ? (
              <p className="px-6 py-10 text-center text-sm text-destructive">{error}</p>
            ) : visibleConversations.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                Keine Konversationen gefunden.
              </p>
            ) : (
              visibleConversations.map((conversation) => {
                const lead = leadByConversation.get(conversation.id);
                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedId(conversation.id)}
                    className={`w-full px-6 py-4 text-left transition-colors hover:bg-muted ${
                      conversation.id === selectedId ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {customerName(conversation, lead)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(conversation.updated_at)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{preview(lead)}</p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        Website-Chat
                      </Badge>
                      <Badge
                        variant={
                          needsHuman(conversation)
                            ? "destructive"
                            : statusLabel(conversation.status) === "Offen"
                              ? "default"
                              : "outline"
                        }
                        className="text-[10px]"
                      >
                        {statusLabel(conversation.status)}
                      </Badge>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">
              {selectedConversation
                ? `${customerName(selectedConversation, selectedLead)}${
                    clean(selectedLead?.issue_type) ? ` · ${clean(selectedLead?.issue_type)}` : ""
                  }`
                : "Kein Gespräch ausgewählt"}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {selectedConversation
                ? [
                    "Website-Chat",
                    clean(selectedLead?.postal_code) || clean(selectedLead?.address),
                    formatDateTime(selectedConversation.created_at),
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : "Wählen Sie links ein Gespräch aus."}
            </p>

            {selectedConversation && needsHuman(selectedConversation) ? (
              <div className="mt-3 space-y-2 rounded-md border border-destructive/40 bg-destructive/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="destructive">Mitarbeiter benötigt</Badge>
                  <Button size="sm" onClick={handleResolve} disabled={resolving}>
                    {resolving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Als erledigt markieren
                  </Button>
                </div>
                <p className="text-xs text-destructive">
                  Übergabe angefordert am {formatDateTime(selectedConversation.handoff_requested_at)}
                </p>
                <p className="text-xs text-destructive">
                  Grund: {clean(selectedConversation.handoff_reason) || "Kein Grund hinterlegt"}
                </p>
              </div>
            ) : null}

            {resolveError ? (
              <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
                {resolveError}
              </p>
            ) : null}
            {resolveSuccess ? (
              <p className="mt-3 rounded-md border border-primary/40 bg-primary/10 p-2 text-xs text-primary">
                {resolveSuccess}
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {messagesLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Gesprächsverlauf wird geladen …
              </div>
            ) : messagesError ? (
              <p className="py-10 text-center text-sm text-destructive">{messagesError}</p>
            ) : !selectedConversation ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Kein Gespräch ausgewählt.
              </p>
            ) : messages.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Noch keine Nachrichten in diesem Gespräch.
              </p>
            ) : (
              messages.map((message) => {
                const label = roleLabel(message.role);
                const isAssistant = label === "KI";
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isAssistant ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="size-8">
                      <AvatarFallback>{initials(label)}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-md rounded-lg px-4 py-2 text-sm ${
                        isAssistant
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`mt-1 text-[10px] ${
                          isAssistant ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {label} · {formatDateTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            <p className="border-t pt-4 text-xs text-muted-foreground">
              Direkte Antworten aus dem Dashboard sind noch nicht aktiviert.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
