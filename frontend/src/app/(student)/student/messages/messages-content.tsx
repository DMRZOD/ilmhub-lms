"use client";

import { useSearchParams } from "next/navigation";

import { Inbox } from "@/components/messages/inbox";

export function StudentMessagesContent() {
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get("c") ?? undefined;

  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-col gap-sp-1">
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Xabarlar
        </h1>
        <p className="text-t-14 text-fg-2">
          Ustozlaringiz bilan yozishmalar
        </p>
      </div>
      <Inbox initialConversationId={initialConversationId} />
    </div>
  );
}
