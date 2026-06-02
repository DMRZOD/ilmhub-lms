"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MessagesSquare, Send } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { initialsOf } from "@/lib/format";
import {
  EmptyState,
  ErrorCard,
  PageLoader,
} from "@/components/instructor-shell/page-states";
import { useAuth } from "@/features/auth/hooks";
import {
  useConversation,
  useConversations,
  useSendMessage,
} from "@/features/messages/hooks";

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Inbox({
  initialConversationId,
}: {
  initialConversationId?: string;
}) {
  const { data: me } = useAuth();
  const { data: conversations, isLoading, isError } = useConversations();
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialConversationId,
  );

  // Default to the first conversation on desktop once loaded.
  useEffect(() => {
    if (!selectedId && initialConversationId) setSelectedId(initialConversationId);
  }, [initialConversationId, selectedId]);

  if (isLoading) return <PageLoader />;
  if (isError || !conversations) return <ErrorCard />;

  if (conversations.length === 0) {
    return (
      <Card padding="lg">
        <EmptyState icon={MessagesSquare} text="Hozircha suhbatlar yo'q" />
      </Card>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="grid h-[70vh] grid-cols-1 md:grid-cols-[320px_1fr]">
        <aside
          className={cn(
            "flex flex-col overflow-y-auto border-ilm-border md:border-r",
            selectedId ? "hidden md:flex" : "flex",
          )}
        >
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              className={cn(
                "flex items-center gap-sp-3 border-b border-ilm-border px-sp-4 py-sp-3 text-left transition-colors hover:bg-ilm-surface",
                selectedId === c.id && "bg-ilm-surface",
              )}
            >
              <Avatar
                size="sm"
                ink
                src={c.otherUser.avatarUrl ?? undefined}
                alt={c.otherUser.name}
                initials={initialsOf(c.otherUser.name)}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-t-14 font-semibold text-ilm-ink">
                  {c.otherUser.name}
                </p>
                <p className="truncate text-t-12 text-fg-3">
                  {c.lastMessage?.body ?? "Suhbatni boshlang"}
                </p>
              </div>
              {c.unreadCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-ilm-full bg-ilm-ink px-1.5 text-t-12 font-bold text-white">
                  {c.unreadCount}
                </span>
              )}
            </button>
          ))}
        </aside>

        <section
          className={cn(
            "flex flex-col",
            selectedId ? "flex" : "hidden md:flex",
          )}
        >
          {selectedId ? (
            <Thread
              conversationId={selectedId}
              meId={me?.id}
              onBack={() => setSelectedId(undefined)}
            />
          ) : (
            <div className="grid flex-1 place-items-center">
              <EmptyState
                icon={MessagesSquare}
                text="Suhbatni tanlang"
              />
            </div>
          )}
        </section>
      </div>
    </Card>
  );
}

function Thread({
  conversationId,
  meId,
  onBack,
}: {
  conversationId: string;
  meId?: string;
  onBack: () => void;
}) {
  const { data, isLoading, isError } = useConversation(conversationId);
  const send = useSendMessage(conversationId);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = data?.messages.items ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function submit() {
    const body = text.trim();
    if (!body) return;
    setText("");
    try {
      await send.mutateAsync(body);
    } catch {
      setText(body);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-sp-3 border-b border-ilm-border px-sp-4 py-sp-3">
        <button
          type="button"
          onClick={onBack}
          className="grid h-8 w-8 place-items-center rounded-ilm-md text-fg-2 hover:bg-ilm-surface md:hidden"
          aria-label="Orqaga"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        {data && (
          <>
            <Avatar
              size="sm"
              ink
              src={data.conversation.otherUser.avatarUrl ?? undefined}
              alt={data.conversation.otherUser.name}
              initials={initialsOf(data.conversation.otherUser.name)}
            />
            <p className="truncate text-t-14 font-semibold text-ilm-ink">
              {data.conversation.otherUser.name}
            </p>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-sp-4 py-sp-4">
        {isLoading ? (
          <PageLoader />
        ) : isError ? (
          <ErrorCard />
        ) : (
          <div className="flex flex-col gap-sp-2">
            {messages.map((m) => {
              const mine = m.senderId === meId;
              return (
                <div
                  key={m.id}
                  className={cn("flex", mine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-ilm-md px-sp-3 py-sp-2 text-t-14",
                      mine
                        ? "bg-ilm-ink text-white"
                        : "bg-ilm-surface text-ilm-ink",
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <span
                      className={cn(
                        "mt-1 block text-t-12",
                        mine ? "text-white/60" : "text-fg-3",
                      )}
                    >
                      {timeLabel(m.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-sp-2 border-t border-ilm-border px-sp-3 py-sp-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          placeholder="Xabar yozing..."
          className="h-11 flex-1 rounded-ilm-md bg-ilm-surface px-4 text-t-14 text-ilm-ink ring-1 ring-inset ring-transparent focus-visible:bg-ilm-paper focus-visible:outline-none focus-visible:ring-ilm-ink"
        />
        <Button
          size="md"
          iconOnly
          iconLeft={Send}
          aria-label="Yuborish"
          onClick={() => void submit()}
          disabled={send.isPending || !text.trim()}
        />
      </div>
    </div>
  );
}
