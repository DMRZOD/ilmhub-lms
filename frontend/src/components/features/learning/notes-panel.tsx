"use client";

import * as React from "react";
import { Download, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { notesKeys } from "@/lib/query-keys";
import {
  useCreateNote,
  useDeleteNote,
  useLessonNotes,
  useUpdateNote,
} from "@/features/notes/hooks";
import { NOTES_TEXT } from "@/features/notes/labels";
import {
  downloadMarkdown,
  notesToMarkdown,
  toFilenameStem,
} from "@/features/notes/export";
import { stripHtml } from "@/features/notes/utils";
import type { NoteSort } from "@/features/notes/types";
import { NoteComposer } from "@/components/features/notes/note-composer";
import { NoteItem } from "@/components/features/notes/note-item";

interface NotesPanelProps {
  lessonId: string;
  lessonTitle?: string;
  hasVideo: boolean;
  getCurrentTime?: () => number | null;
  seekTo?: (seconds: number) => void;
}

export function NotesPanel({
  lessonId,
  lessonTitle,
  hasVideo,
  getCurrentTime,
  seekTo,
}: NotesPanelProps) {
  const listKey = React.useMemo(() => notesKeys.lesson(lessonId), [lessonId]);
  const notesQuery = useLessonNotes(lessonId);
  const createNote = useCreateNote(listKey);
  const updateNote = useUpdateNote(listKey);
  const deleteNote = useDeleteNote(listKey);

  const [composing, setComposing] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<NoteSort>("timestamp");

  const handleUpdate = React.useCallback(
    (id: string, content: string) => {
      updateNote.mutate(
        { id, input: { content } },
        { onError: () => toast.error(NOTES_TEXT.saveError) },
      );
    },
    [updateNote],
  );

  const handleDelete = React.useCallback(
    (id: string) => {
      deleteNote.mutate(id, {
        onSuccess: () => toast.success(NOTES_TEXT.deleted),
        onError: () => toast.error(NOTES_TEXT.saveError),
      });
    },
    [deleteNote],
  );

  const handleCreate = (input: {
    content: string;
    timestampSeconds: number | null;
  }) => {
    createNote.mutate(
      { lessonId, content: input.content, timestampSeconds: input.timestampSeconds },
      {
        onSuccess: () => {
          toast.success(NOTES_TEXT.saved);
          setComposing(false);
        },
        onError: () => toast.error(NOTES_TEXT.saveError),
      },
    );
  };

  const notes = React.useMemo(() => notesQuery.data ?? [], [notesQuery.data]);
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? notes.filter((n) => stripHtml(n.content).toLowerCase().includes(q))
      : notes.slice();
    list.sort((a, b) => {
      if (sort === "timestamp") {
        const at = a.timestampSeconds ?? Number.POSITIVE_INFINITY;
        const bt = b.timestampSeconds ?? Number.POSITIVE_INFINITY;
        if (at !== bt) return at - bt;
        return a.createdAt.localeCompare(b.createdAt);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
    return list;
  }, [notes, search, sort]);

  const handleExport = () => {
    const title = lessonTitle ?? NOTES_TEXT.tabTitle;
    downloadMarkdown(
      `${toFilenameStem(title)}-eslatmalar.md`,
      notesToMarkdown(title, filtered),
    );
  };

  return (
    <div className="flex flex-col gap-sp-4">
      <div className="flex flex-wrap items-center gap-sp-2">
        <Button
          variant="primary"
          size="sm"
          type="button"
          iconLeft={Plus}
          disabled={composing}
          onClick={() => setComposing(true)}
        >
          {NOTES_TEXT.add}
        </Button>

        <div className="relative min-w-[180px] flex-1">
          <span className="pointer-events-none absolute left-sp-3 top-1/2 -translate-y-1/2 text-fg-3">
            <Icon icon={Search} size={16} />
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={NOTES_TEXT.searchPlaceholder}
            className="h-10 pl-9"
          />
        </div>

        <div className="inline-flex overflow-hidden rounded-ilm-md border border-ilm-border">
          <SortButton active={sort === "timestamp"} onClick={() => setSort("timestamp")}>
            {NOTES_TEXT.sortTimestamp}
          </SortButton>
          <SortButton active={sort === "recent"} onClick={() => setSort("recent")}>
            {NOTES_TEXT.sortRecent}
          </SortButton>
        </div>

        <Button
          variant="secondary"
          size="sm"
          type="button"
          iconLeft={Download}
          disabled={notes.length === 0}
          onClick={handleExport}
        >
          {NOTES_TEXT.export}
        </Button>
      </div>

      {composing && (
        <NoteComposer
          hasVideo={hasVideo}
          getCurrentTime={getCurrentTime}
          onSubmit={handleCreate}
          onCancel={() => setComposing(false)}
          submitting={createNote.isPending}
        />
      )}

      {notesQuery.isLoading ? (
        <div className="grid place-items-center py-sp-6">
          <Loader2 className="h-6 w-6 animate-spin text-fg-3" />
        </div>
      ) : notesQuery.isError ? (
        <EmptyState>{NOTES_TEXT.loadError}</EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState>
          {search.trim() ? NOTES_TEXT.emptySearch : NOTES_TEXT.empty}
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-sp-3">
          {filtered.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onSeek={seekTo}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-sp-3 py-2 text-t-12 font-semibold transition-colors",
        active
          ? "bg-ilm-ink text-white"
          : "bg-ilm-paper text-fg-2 hover:bg-ilm-surface",
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-ilm-2xl border border-dashed border-ilm-border bg-ilm-bg p-sp-5 text-center text-t-13 text-fg-2">
      {children}
    </p>
  );
}
