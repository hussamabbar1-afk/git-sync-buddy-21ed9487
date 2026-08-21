import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const FALLBACK_CHAT_ENDPOINT = "https://mohamad-alabar.app.n8n.cloud/webhook/chat";

const optionalText = z.string().min(1).max(2000).optional();

const schema = z.object({
  widget_key: z.string().min(1),
  message: z.string().min(1),
  conversation_id: z.string().min(1).optional(),
  // Optional host-page metadata captured by widget-loader v2.
  client_id: optionalText,
  origin: optionalText,
  page_url: optionalText,
  page_title: optionalText,
  referrer: optionalText,
  utm_source: optionalText,
  utm_medium: optionalText,
  utm_campaign: optionalText,
  utm_content: optionalText,
  utm_term: optionalText,
});

const metadataKeys = [
  "client_id",
  "origin",
  "page_url",
  "page_title",
  "referrer",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const endpoint = process.env["N8N_CHAT_ENDPOINT"] || FALLBACK_CHAT_ENDPOINT;

    // Live v3 required payload stays exactly as before; optional fields are additive.
    const body: Record<string, string> = {
      widget_key: data.widget_key,
      message: data.message,
    };
    if (data.conversation_id) body["conversation_id"] = data.conversation_id;
    for (const key of metadataKeys) {
      const value = data[key];
      if (value) body[key] = value;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Chat-Backend antwortete mit Status ${res.status}`);
    }

    const raw = (await res.json().catch(() => null)) as unknown;
    const payload = Array.isArray(raw) ? raw[0] : raw;

    if (!payload || typeof payload !== "object") {
      throw new Error("Ungültige Antwort vom Chat-Backend");
    }

    const responseBody = payload as {
      message?: unknown;
      conversation_id?: unknown;
      assistant_message_id?: unknown;
      language?: unknown;
    };

    return {
      message: typeof responseBody.message === "string" ? responseBody.message : "",
      conversation_id:
        typeof responseBody.conversation_id === "string" ? responseBody.conversation_id : null,
      // Present from prepared v11 onwards; live v3 omits these.
      assistant_message_id:
        typeof responseBody.assistant_message_id === "string"
          ? responseBody.assistant_message_id
          : null,
      language: typeof responseBody.language === "string" ? responseBody.language : null,
    };
  });
