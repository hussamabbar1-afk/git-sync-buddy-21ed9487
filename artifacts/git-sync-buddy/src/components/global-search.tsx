import { useNavigate } from "@tanstack/react-router";
import { Loader2, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

type SearchRow = {
  entity_type: string;
  entity_id: string;
  title: string | null;
  subtitle: string | null;
  route: string | null;
  created_at: string | null;
};

// Routes that exist in the app today. Results pointing anywhere else stay visible
// but non-clickable so we never render dead links.
const supportedRoutes = [
  "/dashboard",
  "/unternehmen",
  "/ki-mitarbeiter",
  "/konversationen",
  "/leads",
  "/kunden",
  "/termine",
  "/einstellungen",
  "/einrichtung",
] as const;

type SupportedRoute = (typeof supportedRoutes)[number];

function resolveRoute(route: string | null): SupportedRoute | null {
  if (!route) return null;
  const base = ("/" + route.replace(/^\//, "").split(/[/?#]/)[0]) as SupportedRoute;
  return supportedRoutes.includes(base) ? base : null;
}

const entityLabels: Record<string, string> = {
  lead: "Lead",
  conversation: "Konversation",
  appointment: "Termin",
  customer: "Kunde",
  quote: "Angebot",
  job: "Auftrag",
  task: "Aufgabe",
  invoice: "Rechnung",
  contract: "Wartungsvertrag",
  asset: "Anlage",
};

export function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = query.trim();
    setActiveIndex(-1);
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const { data, error: rpcError } = await supabase.rpc("search_workspace", {
        p_query: term,
        p_limit: 12,
      });
      if (rpcError) {
        setError("Suche derzeit nicht verfügbar.");
        setResults([]);
      } else {
        setError(null);
        setResults((data ?? []) as SearchRow[]);
      }
      setActiveIndex(-1);
      setLoading(false);
      setOpen(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const select = (row: SearchRow) => {
    const target = resolveRoute(row.route);
    if (!target) return;
    setOpen(false);
    setActiveIndex(-1);
    setQuery("");
    void navigate({ to: target });
  };

  // Keyboard selection skips results whose route does not exist yet.
  const moveSelection = (direction: 1 | -1) => {
    const selectable = results
      .map((row, index) => ({ index, ok: Boolean(resolveRoute(row.route)) }))
      .filter((entry) => entry.ok)
      .map((entry) => entry.index);
    if (selectable.length === 0) return;
    const current = selectable.indexOf(activeIndex);
    const next =
      current === -1
        ? direction === 1
          ? selectable[0]!
          : selectable[selectable.length - 1]!
        : selectable[(current + direction + selectable.length) % selectable.length]!;
    setActiveIndex(next);
    setOpen(true);
  };

  return (
    <div ref={containerRef} className="relative hidden max-w-sm flex-1 md:block">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim().length >= 2 && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            moveSelection(1);
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            moveSelection(-1);
          }
          if (e.key === "Enter") {
            e.preventDefault();
            const active = activeIndex >= 0 ? results[activeIndex] : undefined;
            const chosen = active ?? results.find((r) => resolveRoute(r.route));
            if (chosen) select(chosen);
          }
        }}
        placeholder="Kunden, Leads oder Gespräche suchen …"
        className="pl-9"
        aria-label="Arbeitsbereich durchsuchen"
      />

      {open && query.trim().length >= 2 ? (
        <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-4 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" /> Suche läuft …
            </div>
          ) : error ? (
            <p className="px-3 py-4 text-xs text-destructive">{error}</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted-foreground">Keine Treffer gefunden.</p>
          ) : (
            <ul className="max-h-80 divide-y overflow-y-auto">
              {results.map((row, index) => {
                const target = resolveRoute(row.route);
                const active = index === activeIndex;
                return (
                  <li key={`${row.entity_type}-${row.entity_id}`}>
                    <button
                      type="button"
                      disabled={!target}
                      aria-selected={active}
                      onMouseEnter={() => target && setActiveIndex(index)}
                      onClick={() => select(row)}
                      className={`flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left ${
                        target ? "hover:bg-muted/60" : "cursor-default opacity-60"
                      } ${active ? "bg-accent text-accent-foreground" : ""}`}
                    >
                      <span className="flex w-full items-center gap-2">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {entityLabels[row.entity_type] ?? row.entity_type}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-xs font-medium">
                          {row.title ?? "Ohne Titel"}
                        </span>
                      </span>
                      {row.subtitle ? (
                        <span className="truncate text-[11px] text-muted-foreground">
                          {row.subtitle}
                        </span>
                      ) : null}
                      {!target ? (
                        <span className="text-[10px] text-muted-foreground">
                          Ansicht noch nicht verfügbar
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
