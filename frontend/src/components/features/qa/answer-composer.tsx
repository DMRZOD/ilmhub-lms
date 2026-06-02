"use client";

import * as React from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  onSubmit: (body: string) => void;
  submitting?: boolean;
  placeholder?: string;
}

export function AnswerComposer({ onSubmit, submitting, placeholder }: Props) {
  const [body, setBody] = React.useState("");
  const canSend = body.trim().length > 0 && !submitting;

  const submit = () => {
    if (!canSend) return;
    onSubmit(body.trim());
    setBody("");
  };

  return (
    <div className="flex flex-col gap-sp-2 rounded-ilm-2xl border border-ilm-border bg-ilm-bg p-sp-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder ?? "Javobingizni yozing… (Markdown qo'llab-quvvatlanadi)"}
        rows={3}
        className="w-full resize-y rounded-ilm-xl border border-ilm-border bg-ilm-paper px-sp-3 py-sp-2 text-t-14 text-fg-1 outline-none focus:border-ilm-ink"
      />
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          type="button"
          iconLeft={Send}
          disabled={!canSend}
          onClick={submit}
        >
          Javob berish
        </Button>
      </div>
    </div>
  );
}
