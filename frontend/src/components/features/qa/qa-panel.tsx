"use client";

import * as React from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks";
import { useCreateQuestion, useQuestions } from "@/features/qa/hooks";
import type { QaFilter, QaSort } from "@/features/qa/types";

import { QuestionDetail } from "./question-detail";
import { QuestionForm } from "./question-form";
import { QuestionListItem } from "./question-list-item";

interface Props {
  courseId: string;
  lessonId?: string;
  enrolled: boolean;
  courseInstructorId?: string;
}

const FILTERS: { value: QaFilter; label: string }[] = [
  { value: "all", label: "Barchasi" },
  { value: "unresolved", label: "Hal qilinmagan" },
  { value: "mine", label: "Mening savollarim" },
  { value: "instructor-answered", label: "Ustoz javob bergan" },
];

const PAGE_SIZE = 20;

export function QaPanel({
  courseId,
  lessonId,
  enrolled,
  courseInstructorId,
}: Props) {
  const { data: user } = useAuth();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [composing, setComposing] = React.useState(false);
  const [filter, setFilter] = React.useState<QaFilter>("all");
  const [sort, setSort] = React.useState<QaSort>("newest");
  const [page, setPage] = React.useState(1);

  const params = React.useMemo(
    () => ({
      courseId,
      lessonId,
      sort: filter === "unresolved" ? ("unresolved" as QaSort) : sort,
      mine: filter === "mine" || undefined,
      instructorAnswered: filter === "instructor-answered" || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [courseId, lessonId, filter, sort, page],
  );

  const questionsQuery = useQuestions(params, enrolled && !selectedId);
  const createQuestion = useCreateQuestion();

  const canModerate = Boolean(
    user &&
      (user.role === "ADMIN" ||
        (courseInstructorId
          ? user.id === courseInstructorId
          : user.role === "INSTRUCTOR")),
  );

  const changeFilter = (next: QaFilter) => {
    setFilter(next);
    setPage(1);
  };

  const handleCreate = (input: { title: string; body: string }) => {
    createQuestion.mutate(
      { courseId, lessonId, title: input.title, body: input.body },
      {
        onSuccess: (created) => {
          toast.success("Savolingiz joylandi.");
          setComposing(false);
          setSelectedId(created.id);
        },
        onError: () => toast.error("Savolni joylab bo'lmadi."),
      },
    );
  };

  if (!enrolled) {
    return (
      <EmptyState>
        Savol-javob bo&apos;limidan foydalanish uchun kursga yozilishingiz
        kerak.
      </EmptyState>
    );
  }

  if (selectedId) {
    return (
      <QuestionDetail
        questionId={selectedId}
        currentUserId={user?.id}
        canModerate={canModerate}
        onBack={() => setSelectedId(null)}
        onDeleted={() => setSelectedId(null)}
      />
    );
  }

  const data = questionsQuery.data;
  const items = data?.items ?? [];
  const totalPages = data?.meta.totalPages ?? 0;

  return (
    <div className="flex flex-col gap-sp-4">
      <div className="flex flex-wrap items-center justify-between gap-sp-2">
        <Button
          variant="primary"
          size="sm"
          type="button"
          iconLeft={Plus}
          disabled={composing}
          onClick={() => setComposing(true)}
        >
          Yangi savol berish
        </Button>

        <div className="inline-flex overflow-hidden rounded-ilm-md border border-ilm-border">
          <Segment active={sort === "newest"} onClick={() => setSort("newest")}>
            Yangi
          </Segment>
          <Segment
            active={sort === "popular"}
            onClick={() => setSort("popular")}
          >
            Mashhur
          </Segment>
        </div>
      </div>

      <div className="flex flex-wrap gap-sp-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => changeFilter(f.value)}
            className={cn(
              "rounded-ilm-full px-sp-3 py-1.5 text-t-12 font-semibold transition-colors",
              filter === f.value
                ? "bg-ilm-ink text-white"
                : "bg-ilm-surface text-fg-2 hover:bg-ilm-border",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {composing && (
        <QuestionForm
          onSubmit={handleCreate}
          onCancel={() => setComposing(false)}
          submitting={createQuestion.isPending}
        />
      )}

      {questionsQuery.isLoading ? (
        <div className="grid place-items-center py-sp-6">
          <Loader2 className="h-6 w-6 animate-spin text-fg-3" />
        </div>
      ) : questionsQuery.isError ? (
        <EmptyState>Savollarni yuklab bo&apos;lmadi.</EmptyState>
      ) : items.length === 0 ? (
        <EmptyState>
          {filter === "all"
            ? "Hali savollar yo'q. Birinchi bo'lib savol bering!"
            : "Bu filtr bo'yicha savollar topilmadi."}
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-sp-3">
          {items.map((question) => (
            <QuestionListItem
              key={question.id}
              question={question}
              onOpen={() => setSelectedId(question.id)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-sp-3">
          <Button
            variant="secondary"
            size="sm"
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Oldingi
          </Button>
          <span className="text-t-13 text-fg-2">
            {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Keyingi
          </Button>
        </div>
      )}
    </div>
  );
}

function Segment({
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
