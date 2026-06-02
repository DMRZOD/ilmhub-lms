"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { NOTES_TEXT } from "@/features/notes/labels";
import { formatTimestamp, isEmptyHtml } from "@/features/notes/utils";

import { RichTextEditor } from "./rich-text-editor";

interface NoteComposerProps {
  hasVideo: boolean;
  getCurrentTime?: () => number | null;
  onSubmit: (input: { content: string; timestampSeconds: number | null }) => void;
  onCancel: () => void;
  submitting?: boolean;
}

export function NoteComposer({
  hasVideo,
  getCurrentTime,
  onSubmit,
  onCancel,
  submitting,
}: NoteComposerProps) {
  // Capture the playback position once, at the moment the composer opens.
  const [capturedTime] = React.useState<number | null>(() => {
    if (!hasVideo || !getCurrentTime) return null;
    const t = getCurrentTime();
    return t == null ? null : Math.floor(t);
  });
  const [linkTime, setLinkTime] = React.useState<boolean>(capturedTime != null);
  const [content, setContent] = React.useState("");

  const canSave = !isEmptyHtml(content) && !submitting;

  const submit = () => {
    if (!canSave) return;
    onSubmit({
      content,
      timestampSeconds:
        linkTime && capturedTime != null ? capturedTime : null,
    });
  };

  return (
    <div className="flex flex-col gap-sp-3 rounded-ilm-2xl border border-ilm-border bg-ilm-bg p-sp-4">
      <RichTextEditor
        initialContent=""
        onChange={setContent}
        autoFocus
        placeholder={NOTES_TEXT.placeholder}
      />

      {capturedTime != null && (
        <label className="flex cursor-pointer items-center gap-sp-2 text-t-13 text-fg-2">
          <Checkbox
            checked={linkTime}
            onCheckedChange={(value) => setLinkTime(value === true)}
          />
          {NOTES_TEXT.linkTimestamp(formatTimestamp(capturedTime))}
        </label>
      )}

      <div className="flex items-center justify-end gap-sp-2">
        <Button variant="ghost" size="sm" type="button" onClick={onCancel}>
          {NOTES_TEXT.cancel}
        </Button>
        <Button
          variant="primary"
          size="sm"
          type="button"
          iconLeft={Plus}
          disabled={!canSave}
          onClick={submit}
        >
          {NOTES_TEXT.save}
        </Button>
      </div>
    </div>
  );
}
