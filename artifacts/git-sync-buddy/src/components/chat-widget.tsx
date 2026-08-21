import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SUPABASE_FUNCTIONS_URL } from "@/lib/supabase-urls";
import { sendChatMessage } from "@/lib/chat.functions";

export type ChatMetadata = {
  client_id?: string;
  origin?: string;
  page_url?: string;
  page_title?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  assistant_message_id?: string | null;
  language?: string | null;
  rating?: 1 | -1 | null;
};

const storageKey = (widgetKey: string) => `handwerkai_chat_${widgetKey}`;

export function ChatWidget({
  widgetKey,
  welcomeMessage,
  metadata,
}: {
  widgetKey: string;
  welcomeMessage?: string | null;
  metadata?: ChatMetadata;
}) {
  const send = useServerFn(sendChatMessage);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationId = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    conversationId.current = sessionStorage.getItem(storageKey(widgetKey));
  }, [widgetKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, pending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || pending) return;

    setError(null);
    setPending(true);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);

    try {
      const result = await send({
        data: {
          widget_key: widgetKey,
          message: text,
          ...(conversationId.current ? { conversation_id: conversationId.current } : {}),
          ...(metadata ?? {}),
        },
      });

      if (result.conversation_id) {
        conversationId.current = result.conversation_id;
        sessionStorage.setItem(storageKey(widgetKey), result.conversation_id);
      }

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: result.message || "…",
          assistant_message_id: result.assistant_message_id,
          language: result.language,
          rating: null,
        },
      ]);
    } catch {
      setError("Die Nachricht konnte nicht gesendet werden. Bitte erneut versuchen.");
    } finally {
      setPending(false);
    }
  };

  const rate = async (index: number, rating: 1 | -1) => {
    const message = messages[index];
    if (!message?.assistant_message_id || !conversationId.current) return;

    const previous = message.rating ?? null;
    setMessages((m) => m.map((item, i) => (i === index ? { ...item, rating } : item)));

    try {
      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/chat-feedback`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          widget_key: widgetKey,
          conversation_id: conversationId.current,
          message_id: message.assistant_message_id,
          rating,
        }),
      });
      if (!res.ok) throw new Error("feedback failed");
    } catch {
      setMessages((m) => m.map((item, i) => (i === index ? { ...item, rating: previous } : item)));
    }
  };

  return (
    <div className="flex h-80 flex-col rounded-md border">
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-3">
        {welcomeMessage ? (
          <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-xs">{welcomeMessage}</div>
        ) : null}
        {messages.map((message, index) => (
          <div key={index} className="space-y-1">
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {message.content}
            </div>
            {message.role === "assistant" && message.assistant_message_id ? (
              <div className="flex items-center gap-2 pl-1">
                {message.rating ? (
                  <span className="text-[10px] text-muted-foreground">
                    Danke für Ihre Rückmeldung.
                  </span>
                ) : null}
                <button
                  type="button"
                  aria-label="Hilfreich"
                  onClick={() => void rate(index, 1)}
                  className={`rounded p-1 transition-colors hover:bg-muted ${
                    message.rating === 1 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <ThumbsUp className="size-3" />
                </button>
                <button
                  type="button"
                  aria-label="Nicht hilfreich"
                  onClick={() => void rate(index, -1)}
                  className={`rounded p-1 transition-colors hover:bg-muted ${
                    message.rating === -1 ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  <ThumbsDown className="size-3" />
                </button>
              </div>
            ) : null}
          </div>
        ))}
        {pending ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Antwort wird geladen …
          </div>
        ) : null}
      </div>

      {error ? <p className="border-t px-3 py-2 text-xs text-destructive">{error}</p> : null}

      <div className="flex gap-2 border-t p-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Nachricht schreiben"
          disabled={pending}
        />
        <Button onClick={() => void handleSend()} disabled={pending || !input.trim()}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
