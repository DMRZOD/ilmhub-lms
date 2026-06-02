"use client";

import * as React from "react";
import { Clock, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { NOTES_TEXT } from "@/features/notes/labels";
import type { Note } from "@/features/notes/types";
import { formatTimestamp, isEmptyHtml } from "@/features/notes/utils";
import { useDebouncedCallback } from "@/features/notes/use-debounced-callback";

import { NoteContent, RichTextEditor } from "./rich-text-editor";

interface NoteItemProps {
  note: Note;
  /** Lesson player: seek the video to the note's timestamp. */
  onSeek?: (seconds: number) => void;
  /** Course overview: navigate to the lesson (no player available). */
  onTimestampClick?: () => void;
  /** Debounced auto-save of edited content. */
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export function NoteItem({
  note,
  onSeek,
  onTimestampClick,
  onUpdate,
  onDelete,
}: NoteItemProps) {
  const [editing, setEditing] = React.useState(false);

  const debouncedSave = useDebouncedCallback((html: string) => {
    if (!isEmptyHtml(html)) onUpdate(note.id, html);
  }, 1000);

  const pill =
    note.timestampSeconds != null
      ? formatTimestamp(note.timestampSeconds)
      : null;
  const isTemp = note.id.startsWith("temp-");

  const handlePill = () => {
    if (onSeek && note.timestampSeconds != null) {
      onSeek(note.timestampSeconds);
    } else {
      onTimestampClick?.();
    }
  };

  const handleDelete = () => {
    if (window.confirm(NOTES_TEXT.deleteConfirm)) onDelete(note.id);
  };

  return (
    <div className="flex flex-col gap-sp-2 rounded-ilm-2xl border border-ilm-border bg-ilm-bg p-sp-4">
      <div className="flex items-start justify-between gap-sp-3">
        {pill ? (
          <button
            type="button"
            onClick={handlePill}
            className="inline-flex items-center gap-sp-1 rounded-ilm-full bg-ilm-surface px-sp-2 py-1 text-t-12 font-semibold text-ilm-ink transition-colors hover:bg-ilm-ink hover:text-white"
          >
            <Icon icon={Clock} size={12} />
            {pill}
          </button>
        ) : (
          <span aria-hidden />
        )}

        {!isTemp && (
          <div className="flex items-center gap-sp-1">
            {editing ? (
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setEditing(false)}
              >
                {NOTES_TEXT.done}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                iconOnly
                iconLeft={Pencil}
                aria-label={NOTES_TEXT.edit}
                title={NOTES_TEXT.edit}
                onClick={() => setEditing(true)}
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              type="button"
              iconOnly
              iconLeft={Trash2}
              aria-label={NOTES_TEXT.delete}
              title={NOTES_TEXT.delete}
              onClick={handleDelete}
            />
          </div>
        )}
      </div>

      <div className={cn(isTemp && "opacity-60")}>
        {editing ? (
          <RichTextEditor
            initialContent={note.content}
            onChange={debouncedSave}
            autoFocus
            placeholder={NOTES_TEXT.placeholder}
          />
        ) : (
          <NoteContent html={note.content} />
        )}
      </div>
    </div>
  );
}
