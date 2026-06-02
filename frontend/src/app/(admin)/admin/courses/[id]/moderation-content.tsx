"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowLeft,
  Check,
  FileText,
  PlayCircle,
  Code2,
  HelpCircle,
  X,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ErrorCard,
  PageLoader,
} from "@/components/instructor-shell/page-states";
import {
  formatDurationLabel,
  formatPriceUsd,
  formatShortDate,
  initialsOf,
} from "@/lib/format";
import {
  useAddCourseNote,
  useAdminCourse,
  useModerateCourse,
} from "@/features/admin/hooks";
import type { AdminAuditEntry } from "@/features/admin/schemas";
import {
  ADMIN_COURSES_TEXT as T,
  AUDIT_ACTION_LABELS,
  COURSE_STATUS_LABELS,
} from "@/features/admin/labels";
import { statusTone } from "../courses-content";

const LESSON_TYPE = {
  VIDEO: { label: "Video", icon: PlayCircle },
  ARTICLE: { label: "Maqola", icon: FileText },
  QUIZ: { label: "Test", icon: HelpCircle },
  CODING: { label: "Kod", icon: Code2 },
} as const;

function noteText(entry: AdminAuditEntry): string | null {
  const meta = entry.metadata as { note?: unknown; reason?: unknown } | null;
  if (!meta) return null;
  if (typeof meta.note === "string") return meta.note;
  if (typeof meta.reason === "string") return meta.reason;
  return null;
}

export function CourseModerationContent({ id }: { id: string }) {
  const { data, isLoading, isError } = useAdminCourse(id);
  const moderate = useModerateCourse();
  const addNote = useAddCourseNote();
  const [note, setNote] = useState("");

  if (isLoading) return <PageLoader />;
  if (isError || !data) return <ErrorCard />;

  const busy = moderate.isPending;

  function handleApprove() {
    if (!window.confirm(T.detail.confirmApprove)) return;
    moderate.mutate({ id, action: "approve" });
  }

  function handleArchive() {
    if (!window.confirm(T.detail.confirmArchive)) return;
    moderate.mutate({ id, action: "archive" });
  }

  function handleReject() {
    const reason = window.prompt(T.detail.rejectPrompt);
    if (reason === null) return;
    if (reason.trim().length < 5) {
      window.alert(T.detail.rejectPrompt);
      return;
    }
    moderate.mutate({ id, action: "reject", reason: reason.trim() });
  }

  function handleAddNote() {
    const text = note.trim();
    if (text.length === 0) return;
    addNote.mutate({ id, note: text }, { onSuccess: () => setNote("") });
  }

  return (
    <div className="flex flex-col gap-sp-6">
      <Link
        href="/admin/courses"
        className="inline-flex w-fit items-center gap-sp-2 text-t-14 font-semibold text-fg-2 hover:text-ilm-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        {T.back}
      </Link>

      <div className="grid gap-sp-6 lg:grid-cols-[1fr_320px]">
        {/* ---------- Course preview ---------- */}
        <div className="flex flex-col gap-sp-5">
          <Card padding="none" className="overflow-hidden">
            <div className="aspect-[16/7] w-full bg-ilm-surface">
              {data.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.thumbnailUrl}
                  alt={data.title}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex flex-col gap-sp-3 p-sp-5">
              <div className="flex items-center gap-sp-2">
                <Badge tone={statusTone(data.status)}>
                  {COURSE_STATUS_LABELS[data.status]}
                </Badge>
                <Badge tone="neutral">{data.category.name}</Badge>
                <span className="text-t-14 font-semibold text-ilm-ink">
                  {formatPriceUsd(data.priceUsdCents)}
                </span>
              </div>
              <h1 className="text-t-24 font-extrabold tracking-ilm-tight text-ilm-ink">
                {data.title || "—"}
              </h1>
              {data.subtitle && (
                <p className="text-t-16 text-fg-2">{data.subtitle}</p>
              )}
              <div className="flex flex-wrap items-center gap-sp-4 text-t-12 text-fg-3">
                <span>{data.studentsCount} talaba</span>
                <span>{T.detail.lessons(data.lessonsCount)}</span>
                <span>{formatDurationLabel(data.durationMinutes)}</span>
                <span>★ {data.ratingAvg.toFixed(1)} ({data.ratingCount})</span>
              </div>
              <div className="mt-sp-1 flex items-center gap-sp-3 border-t border-ilm-border pt-sp-3">
                <Avatar
                  size="sm"
                  ink
                  src={data.instructor.avatarUrl ?? undefined}
                  alt={data.instructor.name}
                  initials={initialsOf(data.instructor.name)}
                />
                <div className="min-w-0">
                  <p className="truncate text-t-14 font-semibold text-ilm-ink">
                    {data.instructor.name}
                  </p>
                  <p className="truncate text-t-12 text-fg-3">
                    {data.instructor.email}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {data.status === "REJECTED" && data.rejectionReason && (
            <div className="rounded-ilm-md bg-ilm-error-bg px-sp-4 py-sp-3">
              <p className="text-t-12 font-semibold text-ilm-error">
                {T.detail.rejectionReason}
              </p>
              <p className="text-t-14 text-ilm-ink">{data.rejectionReason}</p>
            </div>
          )}

          {data.description && (
            <Section title={T.detail.description}>
              <p className="whitespace-pre-line text-t-14 text-fg-2">
                {data.description}
              </p>
            </Section>
          )}

          {data.learningOutcomes.length > 0 && (
            <Section title={T.detail.outcomes}>
              <ul className="flex flex-col gap-sp-1">
                {data.learningOutcomes.map((o, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-sp-2 text-t-14 text-fg-2"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-ilm-success" />
                    {o}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {data.requirements.length > 0 && (
            <Section title={T.detail.requirements}>
              <ul className="list-inside list-disc text-t-14 text-fg-2">
                {data.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </Section>
          )}

          <Section title={T.detail.curriculum}>
            <div className="flex flex-col gap-sp-3">
              {data.sections.map((s) => (
                <div
                  key={s.id}
                  className="overflow-hidden rounded-ilm-md border border-ilm-border"
                >
                  <div className="flex items-center justify-between gap-sp-2 bg-ilm-surface px-sp-3 py-sp-2">
                    <span className="text-t-14 font-semibold text-ilm-ink">
                      {s.title}
                    </span>
                    <span className="text-t-12 text-fg-3">
                      {T.detail.lessons(s.lessons.length)}
                    </span>
                  </div>
                  <ul className="divide-y divide-ilm-border">
                    {s.lessons.map((l) => {
                      const meta = LESSON_TYPE[l.type];
                      const LessonIcon = meta.icon;
                      return (
                        <li
                          key={l.id}
                          className="flex items-center gap-sp-2 px-sp-3 py-sp-2 text-t-14 text-fg-2"
                        >
                          <LessonIcon className="h-4 w-4 shrink-0 text-ilm-muted" />
                          <span className="truncate">{l.title}</span>
                          <span className="ml-auto shrink-0 text-t-12 text-fg-3">
                            {meta.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ---------- Action panel ---------- */}
        <div className="self-start lg:sticky lg:top-sp-6">
          <Card padding="lg" className="flex flex-col gap-sp-4">
            <h3 className="text-t-16 font-bold text-ilm-ink">
              {T.detail.panelTitle}
            </h3>

            <div className="flex flex-col gap-sp-2">
              <Button
                iconLeft={Check}
                disabled={busy || data.status === "PUBLISHED"}
                onClick={handleApprove}
              >
                {T.detail.approve}
              </Button>
              <Button
                variant="secondary"
                iconLeft={X}
                disabled={busy || data.status !== "PENDING_REVIEW"}
                onClick={handleReject}
              >
                {T.detail.reject}
              </Button>
              <Button
                variant="secondary"
                iconLeft={Archive}
                disabled={busy || data.status === "ARCHIVED"}
                onClick={handleArchive}
              >
                {T.detail.archive}
              </Button>
            </div>

            <div className="flex flex-col gap-sp-2 border-t border-ilm-border pt-sp-4">
              <h4 className="text-t-14 font-bold text-ilm-ink">
                {T.detail.notes}
              </h4>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder={T.detail.notesPlaceholder}
                className="w-full rounded-ilm-md bg-ilm-surface px-4 py-3 text-t-14 font-medium text-ilm-ink ring-1 ring-inset ring-transparent transition-[box-shadow,background-color] duration-base ease-ilm-out placeholder:text-ilm-muted focus-visible:bg-ilm-paper focus-visible:outline-none focus-visible:ring-ilm-ink"
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={addNote.isPending || note.trim().length === 0}
                onClick={handleAddNote}
              >
                {T.detail.addNote}
              </Button>

              <div className="mt-sp-2 flex flex-col gap-sp-2">
                {data.moderationLog.length === 0 ? (
                  <p className="text-t-12 text-fg-3">{T.detail.noNotes}</p>
                ) : (
                  data.moderationLog.map((entry) => {
                    const text = noteText(entry);
                    return (
                      <div
                        key={entry.id}
                        className="rounded-ilm-md bg-ilm-surface px-sp-3 py-sp-2"
                      >
                        <div className="flex items-center justify-between gap-sp-2">
                          <span className="text-t-12 font-semibold text-ilm-ink">
                            {AUDIT_ACTION_LABELS[entry.action] ?? entry.action}
                          </span>
                          <span className="shrink-0 text-t-12 text-fg-3">
                            {formatShortDate(entry.createdAt)}
                          </span>
                        </div>
                        {text && (
                          <p className="mt-sp-1 text-t-14 text-fg-2">{text}</p>
                        )}
                        {entry.actor && (
                          <p className="mt-sp-1 text-t-12 text-fg-3">
                            {entry.actor.name}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-sp-2">
      <h3 className="text-t-16 font-bold text-ilm-ink">{title}</h3>
      {children}
    </div>
  );
}
