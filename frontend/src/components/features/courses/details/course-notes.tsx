"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { notesKeys } from "@/lib/query-keys";
import {
  useCourseNotes,
  useDeleteNote,
  useUpdateNote,
} from "@/features/notes/hooks";
import { NOTES_TEXT } from "@/features/notes/labels";
import {
  courseNotesToMarkdown,
  downloadMarkdown,
  toFilenameStem,
} from "@/features/notes/export";
import { stripHtml } from "@/features/notes/utils";
import type { Note } from "@/features/notes/types";
import { NoteItem } from "@/components/features/notes/note-item";

interface LessonGroup {
  id: string;
  title: string;
  order: number;
  sectionOrder: number;
  notes: Note[];
}

function groupByLesson(notes: Note[]): LessonGroup[] {
  const groups = new Map<string, LessonGroup>();
  for (const note of notes) {
    let group = groups.get(note.lessonId);
    if (!group) {
      group = {
        id: note.lessonId,
        title: note.lesson?.title ?? "Dars",
        order: note.lesson?.order ?? 0,
        sectionOrder: note.lesson?.section.order ?? 0,
        notes: [],
      };
      groups.set(note.lessonId, group);
    }
    group.notes.push(note);
  }
  return Array.from(groups.values()).sort(
    (a, b) => a.sectionOrder - b.sectionOrder || a.order - b.order,
  );
}

export function CourseNotes({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const router = useRouter();
  const listKey = React.useMemo(() => notesKeys.course(courseId), [courseId]);
  const notesQuery = useCourseNotes(courseId);
  const updateNote = useUpdateNote(listKey);
  const deleteNote = useDeleteNote(listKey);

  const [search, setSearch] = React.useState("");

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

  const notes = React.useMemo(() => notesQuery.data ?? [], [notesQuery.data]);
  const groups = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? notes.filter((n) => stripHtml(n.content).toLowerCase().includes(q))
      : notes;
    return groupByLesson(list);
  }, [notes, search]);

  const handleExport = () => {
    const all = groupByLesson(notes).map((g) => ({
      lessonTitle: g.title,
      notes: g.notes,
    }));
    downloadMarkdown(
      `${toFilenameStem(courseTitle)}-eslatmalar.md`,
      courseNotesToMarkdown(courseTitle, all),
    );
  };

  return (
    <div className="flex flex-col gap-sp-5">
      <div className="flex flex-wrap items-center gap-sp-2">
        <div className="relative min-w-[200px] flex-1">
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

      {notesQuery.isLoading ? (
        <div className="grid place-items-center py-sp-6">
          <Loader2 className="h-6 w-6 animate-spin text-fg-3" />
        </div>
      ) : notesQuery.isError ? (
        <EmptyState>{NOTES_TEXT.loadError}</EmptyState>
      ) : groups.length === 0 ? (
        <EmptyState>
          {search.trim() ? NOTES_TEXT.emptySearch : NOTES_TEXT.emptyCourse}
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-sp-5">
          {groups.map((group) => (
            <section key={group.id} className="flex flex-col gap-sp-3">
              <h3 className="text-t-14 font-bold text-ilm-ink">
                {group.title}
              </h3>
              <div className="flex flex-col gap-sp-3">
                {group.notes.map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    onTimestampClick={() => router.push(`/lesson/${note.lessonId}`)}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-ilm-2xl border border-dashed border-ilm-border bg-ilm-bg p-sp-5 text-center text-t-13 text-fg-2">
      {children}
    </p>
  );
}
