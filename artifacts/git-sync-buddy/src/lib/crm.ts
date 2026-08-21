// Shared CRM helpers: safe JSON access, German labels and formatting.

export type JsonRecord = Record<string, unknown>;

export function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function num(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function optionalNum(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function str(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text || text.toUpperCase() === "EMPTY") return null;
  return text;
}

export function bool(value: unknown): boolean {
  return value === true;
}

export function stringArray(value: unknown): string[] {
  return asArray(value)
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry) => entry.length > 0);
}

export function customerName(name: string | null | undefined) {
  return str(name) ?? "Unbekannter Kunde";
}

export const leadStatusOptions = [
  "new",
  "qualified",
  "contacted",
  "quote_sent",
  "won",
  "lost",
  "archived",
] as const;

export const leadPriorityOptions = ["low", "normal", "high", "urgent"] as const;

export function leadStatusLabel(status: string | null | undefined) {
  switch ((status ?? "").toLowerCase()) {
    case "new":
      return "Neu";
    case "qualified":
      return "Qualifiziert";
    case "contacted":
      return "Kontaktiert";
    case "quote_sent":
      return "Angebot gesendet";
    case "won":
      return "Gewonnen";
    case "lost":
      return "Verloren";
    case "archived":
      return "Archiviert";
    default:
      return str(status) ?? "—";
  }
}

export function priorityLabel(priority: string | null | undefined) {
  switch ((priority ?? "").toLowerCase()) {
    case "low":
      return "Niedrig";
    case "normal":
      return "Normal";
    case "high":
      return "Hoch";
    case "urgent":
      return "Dringend";
    default:
      return str(priority) ?? "—";
  }
}

export function temperatureLabel(temperature: string | null | undefined) {
  switch ((temperature ?? "").toLowerCase()) {
    case "hot":
      return "Heiß";
    case "warm":
      return "Warm";
    case "cold":
      return "Kalt";
    default:
      return str(temperature) ?? "—";
  }
}

export function urgencyLabel(urgency: string | null | undefined) {
  switch ((urgency ?? "").toLowerCase()) {
    case "emergency":
      return "Notfall";
    case "urgent":
    case "high":
      return "Dringend";
    case "low":
      return "Niedrig";
    case "normal":
      return "Normal";
    default:
      return str(urgency) ?? "Normal";
  }
}

const euroFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export function formatCents(cents: number | null | undefined) {
  if (cents === null || cents === undefined || !Number.isFinite(cents)) return "—";
  return euroFormatter.format(cents / 100);
}

export function centsToEuroInput(cents: number | null | undefined) {
  if (cents === null || cents === undefined || !Number.isFinite(cents)) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

/** Parses a German or plain EUR input into integer cents. */
export function euroInputToCents(input: string): { cents: number | null } | { error: string } {
  const raw = input.trim();
  if (!raw) return { cents: null };
  const normalized = raw.replace(/\./g, "").replace(",", ".").replace(/[€\s]/g, "");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return { error: "Bitte einen gültigen Betrag in Euro eingeben." };
  }
  if (parsed < 0) {
    return { error: "Der geschätzte Wert darf nicht negativ sein." };
  }
  return { cents: Math.round(parsed * 100) };
}

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${dateTimeFormatter.format(date)} Uhr`;
}

/** ISO timestamp -> value for <input type="datetime-local">. */
export function toDateTimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function fromDateTimeLocal(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function parseTags(input: string): string[] {
  const seen = new Set<string>();
  for (const part of input.split(",")) {
    const tag = part.trim();
    if (tag) seen.add(tag);
  }
  return [...seen];
}

/** Routes that already exist in the app. Everything else must stay non-clickable. */
export const existingRoutes = [
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

export type ExistingRoute = (typeof existingRoutes)[number];

export function resolveExistingRoute(route: string | null | undefined): ExistingRoute | null {
  if (!route) return null;
  const base = ("/" + route.replace(/^\//, "").split(/[/?#]/)[0]) as ExistingRoute;
  return existingRoutes.includes(base) ? base : null;
}
