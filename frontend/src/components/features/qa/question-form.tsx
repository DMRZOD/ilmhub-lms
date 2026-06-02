"use client";

import * as React from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onSubmit: (input: { title: string; body: string }) => void;
  onCancel: () => void;
  submitting?: boolean;
}

export function QuestionForm({ onSubmit, onCancel, submitting }: Props) {
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");

  const canSave =
    title.trim().length >= 3 && body.trim().length >= 10 && !submitting;

  const submit = () => {
    if (!canSave) return;
    onSubmit({ title: title.trim(), body: body.trim() });
  };

  return (
    <div className="flex flex-col gap-sp-3 rounded-ilm-2xl border border-ilm-border bg-ilm-bg p-sp-4">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Savol sarlavhasi"
        maxLength={200}
        autoFocus
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Savolingizni batafsil yozing… (Markdown qo'llab-quvvatlanadi)"
        rows={5}
        maxLength={5000}
        className="w-full resize-y rounded-ilm-xl border border-ilm-border bg-ilm-paper px-sp-3 py-sp-2 text-t-14 text-fg-1 outline-none focus:border-ilm-ink"
      />
      <div className="flex items-center justify-end gap-sp-2">
        <Button variant="ghost" size="sm" type="button" onClick={onCancel}>
          Bekor qilish
        </Button>
        <Button
          variant="primary"
          size="sm"
          type="button"
          iconLeft={Send}
          disabled={!canSave}
          onClick={submit}
        >
          Savol berish
        </Button>
      </div>
    </div>
  );
}
