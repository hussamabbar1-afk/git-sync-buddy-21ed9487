import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

import type { Tables } from "@/integrations/supabase/types";

type Company = Tables<"companies">;

type ServiceRow = {
  id: string | null;
  name: string;
  is_active: boolean;
};

type AreaRow = {
  id: string | null;
  name: string;
  postal_codes: string;
  is_active: boolean;
};

type HourRow = {
  id: string | null;
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
};

const dayLabels = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];

// day_of_week: 1 = Montag ... 7 = Sonntag
const dayOrder = [1, 2, 3, 4, 5, 6, 7];

function toTimeValue(value: string | null) {
  if (!value) return "";
  return value.slice(0, 5);
}

export const Route = createFileRoute("/_authenticated/unternehmen")({
  head: () => ({
    meta: [
      { title: "Unternehmensprofil – HandwerkAI" },
      {
        name: "description",
        content:
          "Stammdaten, Leistungen, Servicegebiete und Öffnungszeiten Ihres SHK-Betriebs verwalten.",
      },
      { property: "og:title", content: "Unternehmensprofil – HandwerkAI" },
      {
        property: "og:description",
        content: "Alle Betriebsdaten an einem Ort: Leistungen, Gebiete und Erreichbarkeit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CompanyPage,
});

function CompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    industry: "",
    phone: "",
    email: "",
    address: "",
    about: "",
  });

  const [services, setServices] = useState<ServiceRow[]>([]);
  const [areas, setAreas] = useState<AreaRow[]>([]);
  const [hours, setHours] = useState<HourRow[]>([]);
  const [deletedServices, setDeletedServices] = useState<string[]>([]);
  const [deletedAreas, setDeletedAreas] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadCompany() {
      setLoading(true);
      setError(null);

      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          if (!cancelled) {
            setError("Benutzer ist nicht angemeldet.");
            setLoading(false);
          }
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", userData.user.id)
          .maybeSingle();

        if (!profile?.company_id) {
          if (!cancelled) {
            setCompany(null);
            setLoading(false);
          }
          return;
        }

        const companyId = profile.company_id;

        const [companyRes, servicesRes, areasRes, hoursRes] = await Promise.all([
          supabase.from("companies").select("*").eq("id", companyId).single(),
          supabase
            .from("services")
            .select("*")
            .eq("company_id", companyId)
            .order("created_at", { ascending: true }),
          supabase
            .from("service_areas")
            .select("*")
            .eq("company_id", companyId)
            .order("created_at", { ascending: true }),
          supabase.from("opening_hours").select("*").eq("company_id", companyId),
        ]);

        if (companyRes.error || !companyRes.data) {
          if (!cancelled) {
            setError("Das Unternehmen konnte nicht geladen werden.");
            setLoading(false);
          }
          return;
        }

        if (cancelled) return;

        const companyData = companyRes.data;
        setCompany(companyData);
        setForm({
          name: companyData.name ?? "",
          industry: companyData.industry ?? "",
          phone: companyData.phone ?? "",
          email: companyData.email ?? "",
          address: companyData.address ?? "",
          about: companyData.description ?? "",
        });

        setServices(
          (servicesRes.data ?? []).map((s) => ({
            id: s.id,
            name: s.name ?? "",
            is_active: s.is_active ?? true,
          })),
        );

        setAreas(
          (areasRes.data ?? []).map((a) => ({
            id: a.id,
            name: a.name ?? "",
            postal_codes: a.postal_codes ?? "",
            is_active: a.is_active ?? true,
          })),
        );

        const existingHours = hoursRes.data ?? [];
        setHours(
          dayOrder.map((day) => {
            const row = existingHours.find((h) => h.day_of_week === day);
            return {
              id: row?.id ?? null,
              day_of_week: day,
              is_open: row?.is_open ?? day <= 5,
              open_time: toTimeValue(row?.open_time ?? null) || "07:00",
              close_time: toTimeValue(row?.close_time ?? null) || "17:00",
            };
          }),
        );
      } catch {
        if (!cancelled) setError("Ein unerwarteter Fehler ist aufgetreten.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCompany();

    return () => {
      cancelled = true;
    };
  }, []);

  function validateHours(rows: HourRow[]): string | null {
    for (const h of rows) {
      if (!h.is_open) continue;
      const label = dayLabels[h.day_of_week - 1] ?? `Tag ${h.day_of_week}`;
      if (!h.open_time || !h.close_time) {
        return `${label}: Bitte Öffnungs- und Schließzeit angeben oder den Tag als geschlossen markieren.`;
      }
      if (h.close_time <= h.open_time) {
        return `${label}: Bitte gültige Öffnungszeiten eingeben. Die Schließzeit muss nach der Öffnungszeit liegen.`;
      }
    }
    return null;
  }

  async function handleSave(event?: React.FormEvent) {
    event?.preventDefault();
    if (!company) return;

    const hoursError = validateHours(hours);
    if (hoursError) {
      setSaveSuccess(false);
      setError(hoursError);
      return;
    }

    setSaving(true);
    setSaveSuccess(false);
    setError(null);


    const companyId = company.id;

    try {
      const { error: companyError } = await supabase
        .from("companies")
        .update({
          name: form.name,
          industry: form.industry || null,
          phone: form.phone || null,
          email: form.email || null,
          address: form.address || null,
          description: form.about || null,
        })
        .eq("id", companyId);
      if (companyError) throw companyError;

      if (deletedServices.length > 0) {
        const { error: e } = await supabase.from("services").delete().in("id", deletedServices);
        if (e) throw e;
      }
      if (deletedAreas.length > 0) {
        const { error: e } = await supabase.from("service_areas").delete().in("id", deletedAreas);
        if (e) throw e;
      }

      const newServices = services.filter((s) => !s.id && s.name.trim());
      if (newServices.length > 0) {
        const { error: e } = await supabase
          .from("services")
          .insert(
            newServices.map((s) => ({
              company_id: companyId,
              name: s.name.trim(),
              is_active: s.is_active,
            })),
          );
        if (e) throw e;
      }

      for (const s of services.filter((s) => s.id)) {
        const { error: e } = await supabase
          .from("services")
          .update({ name: s.name.trim(), is_active: s.is_active })
          .eq("id", s.id!);
        if (e) throw e;
      }

      const newAreas = areas.filter((a) => !a.id && a.name.trim());
      if (newAreas.length > 0) {
        const { error: e } = await supabase.from("service_areas").insert(
          newAreas.map((a) => ({
            company_id: companyId,
            name: a.name.trim(),
            postal_codes: a.postal_codes || null,
            is_active: a.is_active,
          })),
        );
        if (e) throw e;
      }

      for (const a of areas.filter((a) => a.id)) {
        const { error: e } = await supabase
          .from("service_areas")
          .update({
            name: a.name.trim(),
            postal_codes: a.postal_codes || null,
            is_active: a.is_active,
          })
          .eq("id", a.id!);
        if (e) throw e;
      }

      for (const h of hours) {
        const payload = {
          is_open: h.is_open,
          open_time: h.is_open && h.open_time ? h.open_time : null,
          close_time: h.is_open && h.close_time ? h.close_time : null,
        };
        if (h.id) {
          const { error: e } = await supabase
            .from("opening_hours")
            .update(payload)
            .eq("id", h.id);
          if (e) throw e;
        } else {
          const { error: e } = await supabase
            .from("opening_hours")
            .insert({ company_id: companyId, day_of_week: h.day_of_week, ...payload });
          if (e) throw e;
        }
      }

      // Nach dem Speichern neu laden, damit alle IDs aktuell sind.
      const [servicesRes, areasRes, hoursRes] = await Promise.all([
        supabase
          .from("services")
          .select("*")
          .eq("company_id", companyId)
          .order("created_at", { ascending: true }),
        supabase
          .from("service_areas")
          .select("*")
          .eq("company_id", companyId)
          .order("created_at", { ascending: true }),
        supabase.from("opening_hours").select("*").eq("company_id", companyId),
      ]);

      setServices(
        (servicesRes.data ?? []).map((s) => ({
          id: s.id,
          name: s.name ?? "",
          is_active: s.is_active ?? true,
        })),
      );
      setAreas(
        (areasRes.data ?? []).map((a) => ({
          id: a.id,
          name: a.name ?? "",
          postal_codes: a.postal_codes ?? "",
          is_active: a.is_active ?? true,
        })),
      );
      const existingHours = hoursRes.data ?? [];
      setHours(
        dayOrder.map((day) => {
          const row = existingHours.find((h) => h.day_of_week === day);
          return {
            id: row?.id ?? null,
            day_of_week: day,
            is_open: row?.is_open ?? false,
            open_time: toTimeValue(row?.open_time ?? null) || "07:00",
            close_time: toTimeValue(row?.close_time ?? null) || "17:00",
          };
        }),
      );

      setDeletedServices([]);
      setDeletedAreas([]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      setError(
        message
          ? `Die Änderungen konnten nicht gespeichert werden: ${message}`
          : "Die Änderungen konnten nicht gespeichert werden.",
      );
    } finally {
      setSaving(false);
    }
  }

  function removeService(index: number) {
    const row = services[index];
    if (row?.id) setDeletedServices((prev) => [...prev, row.id!]);
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  function removeArea(index: number) {
    const row = areas[index];
    if (row?.id) setDeletedAreas((prev) => [...prev, row.id!]);
    setAreas((prev) => prev.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <AppShell>
        <PageHeader
          title="Unternehmensprofil"
          description="Diese Angaben nutzt Ihr KI-Mitarbeiter für die Beantwortung von Kundenanfragen."
        />
        <Card>
          <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (!company) {
    return (
      <AppShell>
        <PageHeader
          title="Unternehmensprofil"
          description="Diese Angaben nutzt Ihr KI-Mitarbeiter für die Beantwortung von Kundenanfragen."
        />
        <Card>
          <CardHeader>
            <CardTitle>Noch kein Unternehmen hinterlegt</CardTitle>
            <CardDescription>
              Legen Sie Ihr Unternehmensprofil an, bevor Ihr KI-Mitarbeiter einsatzbereit ist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/einrichtung">Einrichtung starten</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Unternehmensprofil"
        description="Diese Angaben nutzt Ihr KI-Mitarbeiter für die Beantwortung von Kundenanfragen."
        action={
          <Button type="button" onClick={() => handleSave()} disabled={saving}>
            {saving ? "Wird gespeichert …" : "Änderungen speichern"}
          </Button>
        }
      />

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {saveSuccess ? (
        <Alert className="mb-6 border-green-600/20 bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-100">
          <AlertTitle>Gespeichert</AlertTitle>
          <AlertDescription>Alle Änderungen wurden erfolgreich gespeichert.</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="stammdaten">
        <TabsList>
          <TabsTrigger value="stammdaten">Stammdaten</TabsTrigger>
          <TabsTrigger value="leistungen">Leistungen</TabsTrigger>
          <TabsTrigger value="gebiete">Servicegebiete</TabsTrigger>
          <TabsTrigger value="zeiten">Öffnungszeiten</TabsTrigger>
        </TabsList>

        <TabsContent value="stammdaten" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Stammdaten</CardTitle>
              <CardDescription>Firmierung und Kontaktdaten des Betriebs.</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="company-form" onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Firmenname</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Branche</Label>
                  <Input
                    id="industry"
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    placeholder="z. B. Sanitär, Heizung, Klima"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Straße, Hausnummer, PLZ, Ort"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="about">Kurzbeschreibung</Label>
                  <Textarea
                    id="about"
                    rows={4}
                    value={form.about}
                    onChange={(e) => setForm({ ...form, about: e.target.value })}
                    placeholder="Kurze Beschreibung des Betriebs."
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leistungen" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Leistungen</CardTitle>
              <CardDescription>Welche Aufträge nimmt Ihr Betrieb an?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {services.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Noch keine Leistungen hinterlegt.
                </p>
              ) : null}
              {services.map((service, index) => (
                <div
                  key={service.id ?? `s-${index}`}
                  className="flex items-center gap-3 rounded-md border p-3"
                >
                  <Input
                    value={service.name}
                    placeholder="Name der Leistung"
                    onChange={(e) =>
                      setServices((prev) =>
                        prev.map((s, i) => (i === index ? { ...s, name: e.target.value } : s)),
                      )
                    }
                  />
                  <Switch
                    checked={service.is_active}
                    onCheckedChange={(checked) =>
                      setServices((prev) =>
                        prev.map((s, i) => (i === index ? { ...s, is_active: checked } : s)),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Leistung entfernen"
                    onClick={() => removeService(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setServices((prev) => [
                    ...prev,
                    { id: null, name: "", is_active: true },
                  ])
                }
              >
                Leistung hinzufügen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gebiete" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Servicegebiete</CardTitle>
              <CardDescription>Regionen und Postleitzahlen, in denen Sie arbeiten.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {areas.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Noch keine Servicegebiete hinterlegt.
                </p>
              ) : null}
              {areas.map((area, index) => (
                <div
                  key={area.id ?? `a-${index}`}
                  className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center"
                >
                  <Input
                    value={area.name}
                    placeholder="Name, z. B. Berlin-Mitte"
                    onChange={(e) =>
                      setAreas((prev) =>
                        prev.map((a, i) => (i === index ? { ...a, name: e.target.value } : a)),
                      )
                    }
                  />
                  <Input
                    value={area.postal_codes}
                    placeholder="PLZ, z. B. 10115, 10117"
                    onChange={(e) =>
                      setAreas((prev) =>
                        prev.map((a, i) =>
                          i === index ? { ...a, postal_codes: e.target.value } : a,
                        ),
                      )
                    }
                  />
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={area.is_active}
                      onCheckedChange={(checked) =>
                        setAreas((prev) =>
                          prev.map((a, i) => (i === index ? { ...a, is_active: checked } : a)),
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Servicegebiet entfernen"
                      onClick={() => removeArea(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setAreas((prev) => [
                    ...prev,
                    { id: null, name: "", postal_codes: "", is_active: true },
                  ])
                }
              >
                Servicegebiet hinzufügen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zeiten" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Öffnungszeiten</CardTitle>
              <CardDescription>Grundlage für Terminvorschläge des KI-Mitarbeiters.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {hours.map((entry, index) => (
                <div
                  key={entry.day_of_week}
                  className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="w-40 text-sm font-medium">
                    {dayLabels[entry.day_of_week - 1]}
                  </span>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={entry.is_open}
                      onCheckedChange={(checked) =>
                        setHours((prev) =>
                          prev.map((h, i) => (i === index ? { ...h, is_open: checked } : h)),
                        )
                      }
                    />
                    <Input
                      type="time"
                      className="w-32"
                      value={entry.open_time}
                      disabled={!entry.is_open}
                      onChange={(e) =>
                        setHours((prev) =>
                          prev.map((h, i) => (i === index ? { ...h, open_time: e.target.value } : h)),
                        )
                      }
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="time"
                      className="w-32"
                      value={entry.close_time}
                      disabled={!entry.is_open}
                      onChange={(e) =>
                        setHours((prev) =>
                          prev.map((h, i) =>
                            i === index ? { ...h, close_time: e.target.value } : h,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
