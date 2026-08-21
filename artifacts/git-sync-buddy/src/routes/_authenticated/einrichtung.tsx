import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/einrichtung")({
  head: () => ({
    meta: [
      { title: "Einrichtung – HandwerkAI" },
      {
        name: "description",
        content:
          "Schritt-für-Schritt-Einrichtung: Unternehmensprofil, Leistungen, Servicegebiete, Öffnungszeiten und KI-Mitarbeiter.",
      },
      { property: "og:title", content: "Einrichtung – HandwerkAI" },
      {
        property: "og:description",
        content: "In fünf Schritten zum einsatzbereiten KI-Mitarbeiter für Ihren SHK-Betrieb.",
      },
    ],
  }),
  component: OnboardingPage,
});

const steps = [
  { title: "Unternehmensprofil", description: "Basisdaten Ihres Betriebs." },
  { title: "Leistungen", description: "Was Ihr Betrieb anbietet." },
  { title: "Servicegebiete", description: "Wo Sie tätig sind." },
  { title: "Öffnungszeiten", description: "Erreichbarkeit pro Wochentag." },
  { title: "KI-Mitarbeiter", description: "Auftreten und Verhalten." },
] as const;

const weekdays = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
] as const;

type Hours = { open: boolean; from: string; to: string };

function trimTime(value: string | null) {
  if (!value) return "";
  return value.slice(0, 5);
}

function OnboardingPage() {
  const [step, setStep] = useState(0);

  const [company, setCompany] = useState({
    name: "",
    branche: "",
    phone: "",
    email: "",
    address: "",
    description: "",
  });

  const [services, setServices] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState("");

  const [areas, setAreas] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState("");

  const [hours, setHours] = useState<Record<string, Hours>>(() =>
    Object.fromEntries(weekdays.map((day) => [day, { open: false, from: "", to: "" }])),
  );

  const [ai, setAi] = useState({
    name: "",
    description: "",
    welcome_message: "",
    fallback_message: "",
    human_handoff_enabled: true,
    is_active: true,
  });

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const progress = Math.round(((step + 1) / steps.length) * 100);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setInitialLoading(true);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (cancelled) return;

      if (userError || !userData.user) {
        setError("Sie sind nicht angemeldet. Bitte melden Sie sich an.");
        setInitialLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        setError("Die vorhandenen Daten konnten nicht geladen werden.");
        setInitialLoading(false);
        return;
      }

      if (!profile?.company_id) {
        setInitialLoading(false);
        return;
      }

      const existingCompanyId = profile.company_id;
      setCompanyId(existingCompanyId);

      const [companyRes, servicesRes, areasRes, hoursRes, agentRes] = await Promise.all([
        supabase
          .from("companies")
          .select("name, industry, phone, email, address, description")
          .eq("id", existingCompanyId)
          .maybeSingle(),
        supabase
          .from("services")
          .select("name")
          .eq("company_id", existingCompanyId)
          .order("created_at", { ascending: true }),
        supabase
          .from("service_areas")
          .select("name")
          .eq("company_id", existingCompanyId)
          .order("created_at", { ascending: true }),
        supabase
          .from("opening_hours")
          .select("day_of_week, is_open, open_time, close_time")
          .eq("company_id", existingCompanyId),
        supabase
          .from("ai_agents")
          .select("*")
          .eq("company_id", existingCompanyId)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      if (
        companyRes.error ||
        servicesRes.error ||
        areasRes.error ||
        hoursRes.error ||
        agentRes.error
      ) {
        setError("Die vorhandenen Daten konnten nicht geladen werden.");
        setInitialLoading(false);
        return;
      }

      if (companyRes.data) {
        setCompany({
          name: companyRes.data.name ?? "",
          branche: companyRes.data.industry ?? "",
          phone: companyRes.data.phone ?? "",
          email: companyRes.data.email ?? "",
          address: companyRes.data.address ?? "",
          description: companyRes.data.description ?? "",
        });
      }

      setServices(
        (servicesRes.data ?? []).map((row) => (row.name ?? "").trim()).filter(Boolean),
      );
      setAreas((areasRes.data ?? []).map((row) => (row.name ?? "").trim()).filter(Boolean));

      if ((hoursRes.data ?? []).length) {
        const next = Object.fromEntries(
          weekdays.map((day) => [day, { open: false, from: "", to: "" } as Hours]),
        ) as Record<string, Hours>;
        for (const row of hoursRes.data ?? []) {
          const day = weekdays[(row.day_of_week ?? 1) - 1];
          if (!day) continue;
          next[day] = {
            open: Boolean(row.is_open),
            from: trimTime(row.open_time),
            to: trimTime(row.close_time),
          };
        }
        setHours(next);
      }

      if (agentRes.data) {
        setAgentId(agentRes.data.id);
        setAi({
          name: agentRes.data.name ?? "",
          description: agentRes.data.description ?? "",
          welcome_message: agentRes.data.welcome_message ?? "",
          fallback_message: agentRes.data.fallback_message ?? "",
          human_handoff_enabled: agentRes.data.human_handoff_enabled ?? true,
          is_active: agentRes.data.is_active ?? true,
        });
      }

      setInitialLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const validateHours = (): string | null => {
    for (const day of weekdays) {
      const dayHours = hours[day];
      if (!dayHours?.open) continue;
      if (!dayHours.from || !dayHours.to) {
        return `${day}: Bitte Öffnungs- und Schließzeit angeben oder den Tag als geschlossen markieren.`;
      }
      if (dayHours.to <= dayHours.from) {
        return `${day}: Bitte gültige Öffnungszeiten eingeben. Die Schließzeit muss nach der Öffnungszeit liegen.`;
      }
    }
    return null;
  };

  // Called only after validateHours() passed, so open days always carry valid times
  // and an open day is never silently converted to closed.
  const openingHoursPayload = () =>
    weekdays.map((day, index) => {
      const dayHours = hours[day] ?? { open: false, from: "", to: "" };
      return {
        day_of_week: index + 1,
        is_open: dayHours.open,
        open_time: dayHours.open ? dayHours.from : null,
        close_time: dayHours.open ? dayHours.to : null,
      };
    });


  const saveAgent = async (targetCompanyId: string) => {
    const name = ai.name.trim();
    if (!name) return null;

    if (agentId) {
      const { error: updateError } = await supabase
        .from("ai_agents")
        .update({
          name,
          description: ai.description.trim() || null,
          welcome_message: ai.welcome_message.trim() || null,
          fallback_message: ai.fallback_message.trim() || null,
          human_handoff_enabled: ai.human_handoff_enabled,
          is_active: ai.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", agentId)
        .eq("company_id", targetCompanyId);
      return updateError?.message ?? null;
    }

    const { data, error: rpcError } = await supabase.rpc(
      "create_ai_agent_for_current_company",
      {
        agent_name: name,
        agent_description: ai.description.trim(),
        agent_language: "de",
        agent_response_style: "professionell",
        agent_welcome_message: ai.welcome_message.trim(),
        agent_fallback_message: ai.fallback_message.trim(),
        agent_human_handoff_enabled: ai.human_handoff_enabled,
      },
    );

    if (rpcError) return rpcError.message;
    if (typeof data === "string") setAgentId(data);
    return null;
  };

  const saveExistingCompany = async (targetCompanyId: string) => {
    const { error: companyError } = await supabase
      .from("companies")
      .update({
        name: company.name.trim(),
        industry: company.branche.trim() || null,
        phone: company.phone.trim() || null,
        email: company.email.trim() || null,
        address: company.address.trim() || null,
        description: company.description.trim() || null,
      })
      .eq("id", targetCompanyId);
    if (companyError) return companyError.message;

    // Reconcile services
    const { data: existingServices, error: servicesError } = await supabase
      .from("services")
      .select("id, name")
      .eq("company_id", targetCompanyId);
    if (servicesError) return servicesError.message;

    const desiredServices = services.map((s) => s.trim()).filter(Boolean);
    const removedServices = (existingServices ?? []).filter(
      (row) => !desiredServices.includes((row.name ?? "").trim()),
    );
    const existingServiceNames = (existingServices ?? []).map((row) => (row.name ?? "").trim());
    const newServices = desiredServices.filter((name) => !existingServiceNames.includes(name));

    if (removedServices.length) {
      const { error: delError } = await supabase
        .from("services")
        .delete()
        .in(
          "id",
          removedServices.map((row) => row.id),
        );
      if (delError) return delError.message;
    }
    if (newServices.length) {
      const { error: insError } = await supabase.from("services").insert(
        newServices.map((name) => ({ company_id: targetCompanyId, name, is_active: true })),
      );
      if (insError) return insError.message;
    }

    // Reconcile service areas
    const { data: existingAreas, error: areasError } = await supabase
      .from("service_areas")
      .select("id, name")
      .eq("company_id", targetCompanyId);
    if (areasError) return areasError.message;

    const desiredAreas = areas.map((a) => a.trim()).filter(Boolean);
    const removedAreas = (existingAreas ?? []).filter(
      (row) => !desiredAreas.includes((row.name ?? "").trim()),
    );
    const existingAreaNames = (existingAreas ?? []).map((row) => (row.name ?? "").trim());
    const newAreas = desiredAreas.filter((name) => !existingAreaNames.includes(name));

    if (removedAreas.length) {
      const { error: delError } = await supabase
        .from("service_areas")
        .delete()
        .in(
          "id",
          removedAreas.map((row) => row.id),
        );
      if (delError) return delError.message;
    }
    if (newAreas.length) {
      const { error: insError } = await supabase.from("service_areas").insert(
        newAreas.map((name) => ({ company_id: targetCompanyId, name, is_active: true })),
      );
      if (insError) return insError.message;
    }

    // Opening hours: update existing rows, insert missing days
    const { data: existingHours, error: hoursError } = await supabase
      .from("opening_hours")
      .select("id, day_of_week")
      .eq("company_id", targetCompanyId);
    if (hoursError) return hoursError.message;

    const byDay = new Map<number, string>();
    for (const row of existingHours ?? []) byDay.set(row.day_of_week, row.id);

    for (const entry of openingHoursPayload()) {
      const existingId = byDay.get(entry.day_of_week);
      if (existingId) {
        const { error: updError } = await supabase
          .from("opening_hours")
          .update({
            is_open: entry.is_open,
            open_time: entry.open_time,
            close_time: entry.close_time,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingId);
        if (updError) return updError.message;
      } else {
        const { error: insError } = await supabase.from("opening_hours").insert({
          company_id: targetCompanyId,
          day_of_week: entry.day_of_week,
          is_open: entry.is_open,
          open_time: entry.open_time,
          close_time: entry.close_time,
        });
        if (insError) return insError.message;
      }
    }

    return null;
  };

  const handleFinish = async () => {
    if (loading) return;

    if (!company.name.trim()) {
      setError("Bitte geben Sie einen Firmennamen ein.");
      return;
    }

    const hoursError = validateHours();
    if (hoursError) {
      setSuccess(null);
      setError(hoursError);
      setStep(3);
      return;
    }


    setError(null);
    setSuccess(null);
    setLoading(true);

    if (companyId) {
      const companyErrorMessage = await saveExistingCompany(companyId);
      if (companyErrorMessage) {
        setLoading(false);
        setError(`Fehler beim Speichern: ${companyErrorMessage}`);
        return;
      }

      const agentErrorMessage = await saveAgent(companyId);
      setLoading(false);

      if (agentErrorMessage) {
        setError(`Fehler beim Speichern des KI-Mitarbeiters: ${agentErrorMessage}`);
        return;
      }

      setSuccess("Änderungen erfolgreich gespeichert.");
      return;
    }

    const { data, error: rpcError } = await (supabase.rpc as any)(
      "complete_company_onboarding",
      {
        company_name: company.name.trim(),
        company_industry: company.branche.trim(),
        company_phone: company.phone.trim(),
        company_email: company.email.trim(),
        company_address: company.address.trim(),
        company_description: company.description.trim(),
        services_data: services,
        service_areas_data: areas,
        opening_hours_data: openingHoursPayload(),
      },
    );

    if (rpcError) {
      setLoading(false);
      const message = rpcError.message ?? "";
      setError(
        message.includes("Authentication required")
          ? "Sie sind nicht angemeldet. Bitte melden Sie sich an."
          : `Fehler beim Speichern: ${message}`,
      );
      return;
    }

    if (!data || typeof data !== "string") {
      setLoading(false);
      setError("Das Unternehmen konnte nicht erstellt werden. Bitte versuchen Sie es erneut.");
      return;
    }

    setCompanyId(data);
    const agentErrorMessage = await saveAgent(data);
    setLoading(false);

    if (agentErrorMessage) {
      setError(`Unternehmen gespeichert, aber KI-Mitarbeiter fehlgeschlagen: ${agentErrorMessage}`);
      return;
    }

    setSuccess("Einrichtung erfolgreich gespeichert. Sie werden weitergeleitet …");
    navigate({ to: "/unternehmen" });
  };

  const goToStep = (index: number) => {
    if (step === 3 && index !== 3) {
      const hoursError = validateHours();
      if (hoursError) {
        setError(hoursError);
        return;
      }
    }
    setError(null);
    setStep(index);
  };

  const handleNext = () => {
    if (step === 0 && !company.name.trim()) {
      setError("Bitte geben Sie einen Firmennamen ein.");
      return;
    }
    goToStep(Math.min(steps.length - 1, step + 1));
  };


  const addTo = (
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    reset: (v: string) => void,
  ) => {
    const clean = value.trim();
    if (!clean || list.includes(clean)) return;
    setList([...list, clean]);
    reset("");
  };

  if (initialLoading) {
    return (
      <AppShell>
        <PageHeader title="Einrichtung" description="Ihre Daten werden geladen." />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Daten werden geladen …
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Einrichtung"
        description={
          companyId
            ? "Bearbeiten Sie Ihre bestehende Einrichtung."
            : "In fünf Schritten ist Ihr KI-Mitarbeiter startklar."
        }
        action={
          <Button variant="outline" asChild>
            <Link to="/dashboard">Zurück zum Dashboard</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Fortschritt</CardTitle>
            <CardDescription>
              Schritt {step + 1} von {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} />
            <ol className="space-y-1">
              {steps.map((item, index) => (
                <li key={item.title}>
                  <button
                    type="button"
                    onClick={() => goToStep(index)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors ${
                      index === step
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/60"
                    }`}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                        index < step ? "border-primary bg-primary text-primary-foreground" : ""
                      }`}
                    >
                      {index < step ? <Check className="size-3" /> : index + 1}
                    </span>
                    {item.title}
                  </button>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{steps[step]!.title}</CardTitle>
            <CardDescription>{steps[step]!.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ob-name">Firmenname</Label>
                  <Input
                    id="ob-name"
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-branche">Branche</Label>
                  <Input
                    id="ob-branche"
                    value={company.branche}
                    onChange={(e) => setCompany({ ...company, branche: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-phone">Telefonnummer</Label>
                  <Input
                    id="ob-phone"
                    value={company.phone}
                    onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-mail">E-Mail</Label>
                  <Input
                    id="ob-mail"
                    value={company.email}
                    onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ob-address">Adresse</Label>
                  <Input
                    id="ob-address"
                    value={company.address}
                    onChange={(e) => setCompany({ ...company, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ob-desc">Beschreibung</Label>
                  <Textarea
                    id="ob-desc"
                    rows={3}
                    value={company.description}
                    onChange={(e) => setCompany({ ...company, description: e.target.value })}
                  />
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={serviceInput}
                    placeholder="Leistung hinzufügen, z. B. Wärmepumpen-Installation"
                    onChange={(e) => setServiceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTo(serviceInput, services, setServices, setServiceInput);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addTo(serviceInput, services, setServices, setServiceInput)}
                  >
                    <Plus className="size-4" />
                    Hinzufügen
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <Badge key={service} variant="secondary" className="gap-1">
                      {service}
                      <button
                        type="button"
                        aria-label={`${service} entfernen`}
                        onClick={() => setServices(services.filter((s) => s !== service))}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={areaInput}
                    placeholder="Stadt oder Gebiet hinzufügen"
                    onChange={(e) => setAreaInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTo(areaInput, areas, setAreas, setAreaInput);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addTo(areaInput, areas, setAreas, setAreaInput)}
                  >
                    <Plus className="size-4" />
                    Hinzufügen
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {areas.map((area) => (
                    <Badge key={area} variant="secondary" className="gap-1">
                      {area}
                      <button
                        type="button"
                        aria-label={`${area} entfernen`}
                        onClick={() => setAreas(areas.filter((a) => a !== area))}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="divide-y">
                {weekdays.map((day) => {
                  const dayHours = hours[day] ?? { open: false, from: "08:00", to: "17:00" };
                  return (
                    <div key={day} className="flex flex-wrap items-center gap-3 py-3">
                      <span className="w-28 text-sm font-medium">{day}</span>
                      <Switch
                        checked={dayHours.open}
                        onCheckedChange={(checked) =>
                          setHours({ ...hours, [day]: { ...dayHours, open: checked } })
                        }
                        aria-label={`${day} geöffnet`}
                      />
                      {dayHours.open ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            className="w-32"
                            value={dayHours.from}
                            onChange={(e) =>
                              setHours({ ...hours, [day]: { ...dayHours, from: e.target.value } })
                            }
                          />
                          <span className="text-muted-foreground">–</span>
                          <Input
                            type="time"
                            className="w-32"
                            value={dayHours.to}
                            onChange={(e) =>
                              setHours({ ...hours, [day]: { ...dayHours, to: e.target.value } })
                            }
                          />
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Geschlossen</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ob-ai-name">Name des KI-Mitarbeiters</Label>
                  <Input
                    id="ob-ai-name"
                    value={ai.name}
                    onChange={(e) => setAi({ ...ai, name: e.target.value })}
                    placeholder="z. B. Lena"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-ai-desc">Kurzbeschreibung</Label>
                  <Textarea
                    id="ob-ai-desc"
                    rows={3}
                    value={ai.description}
                    onChange={(e) => setAi({ ...ai, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-ai-welcome">Begrüßungsnachricht</Label>
                  <Textarea
                    id="ob-ai-welcome"
                    rows={2}
                    value={ai.welcome_message}
                    onChange={(e) => setAi({ ...ai, welcome_message: e.target.value })}
                    placeholder="Guten Tag, wie kann ich Ihnen helfen?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-ai-fallback">Fallback-Nachricht</Label>
                  <Textarea
                    id="ob-ai-fallback"
                    rows={2}
                    value={ai.fallback_message}
                    onChange={(e) => setAi({ ...ai, fallback_message: e.target.value })}
                    placeholder="Das kann ich leider nicht beantworten – ein Mitarbeiter meldet sich."
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">Übergabe an Mitarbeiter</p>
                    <p className="text-xs text-muted-foreground">
                      Gespräche bei Bedarf an einen echten Mitarbeiter weiterleiten.
                    </p>
                  </div>
                  <Switch
                    checked={ai.human_handoff_enabled}
                    onCheckedChange={(checked) =>
                      setAi({ ...ai, human_handoff_enabled: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">KI-Mitarbeiter aktiv</p>
                    <p className="text-xs text-muted-foreground">
                      Nur aktive KI-Mitarbeiter beantworten Anfragen.
                    </p>
                  </div>
                  <Switch
                    checked={ai.is_active}
                    onCheckedChange={(checked) => setAi({ ...ai, is_active: checked })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Ohne Namen wird kein KI-Mitarbeiter angelegt. Weitere Einstellungen finden Sie
                  später unter „KI-Mitarbeiter“.
                </p>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-md border border-primary bg-primary/10 p-3 text-sm text-primary">
                {success}
              </div>
            ) : null}

            <div className="flex items-center justify-between border-t pt-4">
              <Button
                variant="outline"
                disabled={step === 0 || loading}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                <ChevronLeft className="size-4" />
                Zurück
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={handleNext} disabled={loading}>
                  Weiter
                  <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button onClick={handleFinish} disabled={loading || !company.name.trim()}>
                  {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  {loading
                    ? "Wird gespeichert..."
                    : companyId
                      ? "Änderungen speichern"
                      : "Einrichtung abschließen"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
