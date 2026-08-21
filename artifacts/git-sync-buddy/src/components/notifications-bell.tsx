import { useNavigate } from "@tanstack/react-router";
import { Bell, Check, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
};

// Only entity types with a route that exists today are clickable.
const entityRoutes: Record<string, "/leads" | "/konversationen" | "/termine"> = {
  lead: "/leads",
  conversation: "/konversationen",
  appointment: "/termine",
};

function formatWhen(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "gerade eben";
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

export function NotificationsBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unread, setUnread] = useState(0);
  const [busy, setBusy] = useState(false);

  // Exact unread total across all notifications visible through RLS,
  // not just the latest 20 rows shown in the list.
  const refreshUnreadCount = useCallback(async () => {
    const { count, error: countError } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .is("read_at", null);
    if (!countError) setUnread(count ?? 0);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: loadError } = await supabase
      .from("notifications")
      .select("id, type, title, body, entity_type, entity_id, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (loadError) {
      setError("Benachrichtigungen konnten nicht geladen werden.");
      setItems([]);
    } else {
      setItems((data ?? []) as NotificationRow[]);
    }
    await refreshUnreadCount();
    setLoading(false);
  }, [refreshUnreadCount]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let active = true;

    const subscribe = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId || !active) return;

      const channel = supabase
        .channel("notifications-header")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const row = payload.new as NotificationRow | undefined;
            if (payload.eventType === "INSERT" && row) {
              setItems((prev) => [row, ...prev.filter((n) => n.id !== row.id)].slice(0, 20));
            } else if (payload.eventType === "UPDATE" && row) {
              setItems((prev) => prev.map((n) => (n.id === row.id ? { ...n, ...row } : n)));
            } else if (payload.eventType === "DELETE") {
              const old = payload.old as { id?: string };
              setItems((prev) => prev.filter((n) => n.id !== old.id));
            }
            void refreshUnreadCount();
          },
        )
        .subscribe();

      cleanup = () => {
        void supabase.removeChannel(channel);
      };
    };

    let cleanup: (() => void) | undefined;
    void subscribe();

    return () => {
      active = false;
      cleanup?.();
    };
  }, [refreshUnreadCount]);

  const markRead = async (id: string) => {
    const target = items.find((n) => n.id === id);
    if (target?.read_at) return;
    const readAt = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: n.read_at ?? readAt } : n)));
    setUnread((c) => Math.max(0, c - 1));
    // Only read_at is ever written.
    const { error: updateError } = await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("id", id)
      .is("read_at", null);
    if (updateError) {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: null } : n)));
      void refreshUnreadCount();
    }
  };

  const markAllRead = async () => {
    if (busy || unread === 0) return;
    setBusy(true);
    const readAt = new Date().toISOString();
    // Scoped by read_at IS NULL so ALL unread rows visible through RLS are updated,
    // not only the ids from the latest 20.
    const { error: updateError } = await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .is("read_at", null);
    if (updateError) {
      setError("Als gelesen markieren fehlgeschlagen.");
      void load();
    } else {
      setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: readAt })));
      setUnread(0);
    }
    setBusy(false);
  };

  const handleClick = (item: NotificationRow) => {
    void markRead(item.id);
    const target = item.entity_type ? entityRoutes[item.entity_type] : undefined;
    if (target) {
      setOpen(false);
      void navigate({ to: target });
    }
  };


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Benachrichtigungen" className="relative">
          <Bell className="size-4" />
          {unread > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 font-semibold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-medium">Benachrichtigungen</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            disabled={unread === 0 || busy}
            onClick={() => void markAllRead()}
          >
            <Check className="size-3" /> Alle gelesen
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 px-3 py-6 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Wird geladen …
          </div>
        ) : error ? (
          <div className="px-3 py-6 text-xs text-destructive">
            {error}{" "}
            <button className="underline" onClick={() => void load()}>
              Erneut versuchen
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="px-3 py-6 text-xs text-muted-foreground">
            Keine Benachrichtigungen vorhanden.
          </p>
        ) : (
          <ScrollArea className="max-h-80">
            <ul className="divide-y">
              {items.map((item) => {
                const clickable = item.entity_type
                  ? Boolean(entityRoutes[item.entity_type])
                  : false;
                return (
                  <li key={item.id}>
                    <div
                      role={clickable ? "button" : undefined}
                      tabIndex={clickable ? 0 : undefined}
                      onClick={clickable ? () => handleClick(item) : undefined}
                      onKeyDown={
                        clickable
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleClick(item);
                              }
                            }
                          : undefined
                      }
                      className={`flex gap-2 px-3 py-2.5 text-left ${
                        clickable ? "cursor-pointer hover:bg-muted/60" : ""
                      }`}
                    >
                      <span
                        className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                          item.read_at ? "bg-transparent" : "bg-primary"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{item.title}</p>
                        {item.body ? (
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {item.body}
                          </p>
                        ) : null}
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {formatWhen(item.created_at)}
                        </p>
                      </div>
                      {!item.read_at ? (
                        <button
                          className="self-start text-[10px] text-muted-foreground underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            void markRead(item.id);
                          }}
                        >
                          Gelesen
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
