import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bot,
  Building2,
  Calendar,
  Contact,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { GlobalSearch } from "@/components/global-search";
import { NotificationsBell } from "@/components/notifications-bell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const navigation = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/unternehmen", label: "Unternehmensprofil", icon: Building2 },
  { to: "/ki-mitarbeiter", label: "KI-Mitarbeiter", icon: Bot },
  { to: "/konversationen", label: "Konversationen", icon: MessageSquare },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/kunden", label: "Kunden", icon: Contact },
  { to: "/termine", label: "Termine", icon: Calendar },
  { to: "/einstellungen", label: "Einstellungen", icon: Settings },
] as const;

const byPath = <T extends (typeof navigation)[number]["to"]>(path: T) =>
  navigation.find((item) => item.to === path)!;

const navigationSections = [
  { label: "Übersicht", items: [byPath("/dashboard")] },
  {
    label: "Kundenkontakt",
    items: [byPath("/konversationen"), byPath("/leads"), byPath("/kunden"), byPath("/termine")],
  },
  {
    label: "Konfiguration",
    items: [byPath("/unternehmen"), byPath("/ki-mitarbeiter"), byPath("/einstellungen")],
  },
] as const;

const mobileNavigation = [
  byPath("/dashboard"),
  byPath("/konversationen"),
  byPath("/leads"),
  byPath("/kunden"),
  byPath("/termine"),
] as const;



export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }


  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Bot className="size-4" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">HandwerkAI</span>
        </div>

        <nav className="flex-1 space-y-4 p-3">
          {navigationSections.map((section) => (
            <div key={section.label} className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
                {section.label}
              </p>
              {section.items.map((item) => {
                const active = pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur lg:px-8">
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-3">
            <NotificationsBell />

            <Badge variant="secondary" className="hidden sm:inline-flex">
              KI aktiv
            </Badge>
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarFallback>{(email ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left text-xs leading-tight sm:block">
                <p className="font-medium">{email ?? "Angemeldet"}</p>
                <p className="text-muted-foreground">HandwerkAI Konto</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" aria-label="Abmelden" onClick={handleSignOut}>
              <LogOut className="size-4" />
            </Button>

          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>

        <nav className="sticky bottom-0 flex border-t bg-card lg:hidden">
          {navigation.slice(0, 5).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] text-muted-foreground data-[status=active]:text-primary"
            >
              <item.icon className="size-4" />
              {item.label.split(" ")[0]}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
