"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Code2,
  Loader2,
  Play,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  useCodingExercise,
  useMySubmissions,
  useSubmitCode,
} from "@/features/learning/coding-hooks";
import { fetchSolutionCode } from "@/features/learning/coding-api";
import type {
  CodingExerciseDetail,
  CodingTestStub,
  SubmissionHistoryItem,
  SubmitCodeResult,
  TestResult,
} from "@/features/learning/coding-types";
import type { LessonDetail } from "@/features/learning/types";
import { CODING_LANGUAGE_MONACO } from "@/features/course-wizard/schemas";
import { cn } from "@/lib/utils";
import { CodeEditor } from "@/components/features/course-wizard/code-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { WorkerCaseResult, WorkerInput, WorkerOutput } from "./code-worker";

// ---------------------------------------------------------------------------
// Content column (the learning header + sidebar come from LearningShell)
// ---------------------------------------------------------------------------

export function CodingLessonContent({
  lessonId,
  lesson,
}: {
  lessonId: string;
  lesson: LessonDetail;
}) {
  return (
    <>
      <div className="text-t-12 font-bold uppercase tracking-wider text-fg-3">
        {lesson.section.title}
      </div>
      {/* Remount per lesson so the editor + results never leak across exercises. */}
      <CodingView key={lessonId} lessonId={lessonId} lesson={lesson} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main coding area
// ---------------------------------------------------------------------------

function CodingView({
  lessonId,
  lesson,
}: {
  lessonId: string;
  lesson: LessonDetail;
}) {
  const router = useRouter();
  const exerciseQuery = useCodingExercise(lessonId);
  const exercise = exerciseQuery.data;

  const [code, setCode] = React.useState<string>("");
  const [runResults, setRunResults] = React.useState<WorkerCaseResult[] | null>(
    null,
  );
  const [submitResult, setSubmitResult] = React.useState<SubmitCodeResult | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [solutionViewed, setSolutionViewed] = React.useState(false);
  const [showSolutionConfirm, setShowSolutionConfirm] = React.useState(false);
  const [solutionLoading, setSolutionLoading] = React.useState(false);
  const [runLoading, setRunLoading] = React.useState(false);

  const submitMutation = useSubmitCode(exercise?.id ?? "", lessonId);

  // Seed the editor once with the student's last attempt (or the starter code).
  const initialized = React.useRef(false);
  React.useEffect(() => {
    if (exercise && !initialized.current) {
      initialized.current = true;
      setCode(exercise.lastSubmittedCode ?? exercise.starterCode);
    }
  }, [exercise]);

  const monacoLang =
    exercise?.language && exercise.language in CODING_LANGUAGE_MONACO
      ? CODING_LANGUAGE_MONACO[
          exercise.language as keyof typeof CODING_LANGUAGE_MONACO
        ]
      : "javascript";

  const handleReset = () => {
    if (!exercise) return;
    setCode(exercise.starterCode);
    setRunResults(null);
    setSubmitResult(null);
  };

  const handleShowSolution = async () => {
    if (!exercise) return;
    setSolutionLoading(true);
    try {
      const { solutionCode } = await fetchSolutionCode(exercise.id);
      setCode(solutionCode);
      setSolutionViewed(true);
      setShowSolutionConfirm(false);
      toast.info("Yechim ko'rsatildi.");
    } catch {
      toast.error("Yechimni yuklab bo'lmadi.");
    } finally {
      setSolutionLoading(false);
    }
  };

  const handleRun = () => {
    if (!exercise || !code.trim() || !exercise.entryFunction) return;
    setRunLoading(true);
    setSubmitResult(null);

    const cases = exercise.tests.map((t) => ({ index: t.index, args: t.args }));
    const finish = (results: WorkerCaseResult[]) => {
      setRunResults(results);
      setDrawerOpen(true);
      setRunLoading(false);
    };
    const errorAll = (message: string) =>
      finish(cases.map((c) => ({ index: c.index, output: "", error: message })));

    const worker = new Worker(new URL("./code-worker.ts", import.meta.url));
    const timer = setTimeout(() => {
      worker.terminate();
      errorAll("Timeout: 5 soniyada bajarilmadi.");
    }, 5000);

    worker.onmessage = (e: MessageEvent<WorkerOutput>) => {
      clearTimeout(timer);
      worker.terminate();
      finish(e.data.results);
    };

    worker.onerror = () => {
      clearTimeout(timer);
      worker.terminate();
      errorAll("Worker xatosi yuz berdi.");
    };

    const input: WorkerInput = {
      code,
      language: exercise.language,
      entryFunction: exercise.entryFunction,
      cases,
    };
    worker.postMessage(input);
  };

  const handleSubmit = () => {
    if (!exercise || !code.trim()) return;
    setRunResults(null);
    submitMutation.mutate(
      { code, solutionViewed },
      {
        onSuccess: (result) => {
          setSubmitResult(result);
          setDrawerOpen(true);
          if (result.passed) {
            toast.success("Barcha testlar o'tdi! Dars yakunlandi.");
          } else {
            toast.error(
              `${result.results.filter((r) => r.passed).length}/${result.results.length} test o'tdi.`,
            );
          }
        },
        onError: (err) => {
          if (isAxiosError(err)) {
            const code = err.response?.data?.message;
            if (code === "language_not_supported_yet") {
              toast.error("Bu til hozircha server tomonida qo'llab-quvvatlanmaydi.");
              return;
            }
          }
          toast.error("Yuborishda xatolik yuz berdi.");
        },
      },
    );
  };

  const goNext = () => {
    const nextId = lesson.navigation.nextLessonId;
    if (nextId) router.push(`/lesson/${nextId}`);
  };
  const goPrev = () => {
    const prevId = lesson.navigation.prevLessonId;
    if (prevId) router.push(`/lesson/${prevId}`);
  };

  if (exerciseQuery.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-ilm-ink" />
      </div>
    );
  }

  if (exerciseQuery.isError || !exercise) {
    return (
      <div className="rounded-ilm-xl border border-red-200 bg-red-50 p-sp-4 text-t-14 text-red-600">
        Kod mashqini yuklab bo&apos;lmadi.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sp-4">
      {/* Title + nav */}
      <div className="flex flex-wrap items-start justify-between gap-sp-3">
        <div className="flex items-center gap-sp-2">
          <Code2 className="h-5 w-5 text-ilm-ink" />
          <h1 className="text-t-24 font-extrabold tracking-ilm-tight text-ilm-ink">
            {lesson.title}
          </h1>
        </div>
        <div className="flex items-center gap-sp-2">
          <Button
            variant="secondary"
            size="md"
            iconLeft={ChevronLeft}
            disabled={!lesson.navigation.prevLessonId}
            onClick={goPrev}
          >
            Oldingi
          </Button>
          <Button
            variant="primary"
            size="md"
            iconRight={ChevronRight}
            disabled={!lesson.navigation.nextLessonId}
            onClick={goNext}
          >
            Keyingi dars
          </Button>
        </div>
      </div>

      {/* Solution confirmation banner */}
      {showSolutionConfirm && (
        <div className="flex items-start gap-sp-3 rounded-ilm-xl border border-amber-200 bg-amber-50 p-sp-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-t-14 font-semibold text-amber-900">
              Yechimni ko&apos;rish bahongizga ta&apos;sir qiladi
            </p>
            <p className="mt-0.5 text-t-13 text-amber-700">
              Yechimni ko&apos;rsangiz, ushbu urinish to&apos;liq ball olmaydi.
              Davom etasizmi?
            </p>
          </div>
          <div className="flex gap-sp-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSolutionConfirm(false)}
            >
              Bekor
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={solutionLoading}
              onClick={handleShowSolution}
            >
              {solutionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Ko'rish"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Split layout */}
      <div className="grid gap-sp-4 xl:grid-cols-[2fr_3fr]">
        {/* Left: description + test tabs */}
        <LeftPanel
          lesson={lesson}
          exercise={exercise}
          submitResult={submitResult}
        />

        {/* Right: editor + toolbar + drawer */}
        <div className="flex flex-col gap-sp-2">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-sp-2 rounded-ilm-xl border border-ilm-border bg-ilm-surface px-sp-3 py-sp-2">
            <div className="flex items-center gap-sp-2">
              <Button
                variant="ghost"
                size="sm"
                iconLeft={RefreshCw}
                onClick={handleReset}
              >
                Tiklash
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconLeft={Code2}
                onClick={() => setShowSolutionConfirm(true)}
                disabled={solutionViewed}
              >
                {solutionViewed ? "Yechim ko'rildi" : "Yechim"}
              </Button>
            </div>
            <div className="flex items-center gap-sp-2">
              <Button
                variant="secondary"
                size="sm"
                iconLeft={Play}
                onClick={handleRun}
                disabled={runLoading || !code.trim()}
              >
                {runLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Ishga tushirish"
                )}
              </Button>
              <Button
                variant="primary"
                size="sm"
                iconLeft={Send}
                onClick={handleSubmit}
                disabled={submitMutation.isPending || !code.trim()}
              >
                {submitMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Yuborish"
                )}
              </Button>
            </div>
          </div>

          {/* Monaco editor (CodeEditor already provides the border + rounding) */}
          <CodeEditor
            value={code}
            language={monacoLang}
            onChange={(v) => setCode(v ?? "")}
            height="clamp(320px, calc(100vh - 420px), 720px)"
          />

          {/* Output drawer */}
          <div
            className={cn(
              "overflow-hidden rounded-ilm-xl border border-ilm-border transition-all duration-300",
              drawerOpen ? "max-h-64" : "max-h-0 border-transparent",
            )}
          >
            <div className="flex items-center justify-between border-b border-ilm-border bg-ilm-surface px-sp-3 py-sp-2">
              <span className="text-t-12 font-semibold text-ilm-ink">
                {submitResult ? "Natijalar" : "Ishga tushirish natijasi"}
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-t-12 text-fg-3 hover:text-ilm-ink"
              >
                ✕
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto bg-ilm-ink p-sp-3 font-mono text-t-12 text-white">
              {submitResult ? (
                <SubmitOutput result={submitResult} />
              ) : runResults ? (
                <RunOutput results={runResults} tests={exercise.tests} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Left panel
// ---------------------------------------------------------------------------

function LeftPanel({
  lesson,
  exercise,
  submitResult,
}: {
  lesson: LessonDetail;
  exercise: CodingExerciseDetail;
  submitResult: SubmitCodeResult | null;
}) {
  const submissionsQuery = useMySubmissions(exercise.id);

  return (
    <div className="flex flex-col gap-sp-4">
      {/* Description */}
      {lesson.description && (
        <div className="rounded-ilm-xl border border-ilm-border bg-ilm-paper p-sp-4">
          <p className="text-t-14 leading-relaxed text-fg-1">{lesson.description}</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="tests">
        <TabsList className="w-full">
          <TabsTrigger value="tests" className="flex-1">
            Testlar ({exercise.tests.length})
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex-1">
            Urinishlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="mt-sp-3">
          <div className="flex flex-col gap-sp-2">
            {exercise.tests.length === 0 ? (
              <p className="text-t-13 text-fg-3">Test mavjud emas.</p>
            ) : (
              exercise.tests.map((t) => {
                const result = submitResult?.results.find(
                  (r) => r.index === t.index,
                );
                return (
                  <TestRow
                    key={t.index}
                    index={t.index}
                    description={t.description}
                    result={result ?? null}
                  />
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="mt-sp-3">
          <div className="flex flex-col gap-sp-2">
            {submissionsQuery.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-fg-3" />
            ) : submissionsQuery.data?.length === 0 ? (
              <p className="text-t-13 text-fg-3">
                Hali urinish yo&apos;q. Kodni yuboring!
              </p>
            ) : (
              (submissionsQuery.data ?? []).map((s) => (
                <SubmissionRow key={s.id} submission={s} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Test row
// ---------------------------------------------------------------------------

function TestRow({
  index,
  description,
  result,
}: {
  index: number;
  description: string | null;
  result: TestResult | null;
}) {
  const [expanded, setExpanded] = React.useState(false);

  const icon =
    result === null ? (
      <Circle className="h-4 w-4 shrink-0 text-fg-3" />
    ) : result.passed ? (
      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 shrink-0 text-red-500" />
    );

  return (
    <div
      className={cn(
        "rounded-ilm-lg border p-sp-3 transition-colors",
        result === null
          ? "border-ilm-border bg-ilm-surface"
          : result.passed
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50",
      )}
    >
      <button
        type="button"
        className="flex w-full items-start gap-sp-2 text-left"
        onClick={() => result && setExpanded(!expanded)}
      >
        {icon}
        <span className="flex-1 text-t-13 text-ilm-ink">
          {description ?? `Test ${index + 1}`}
        </span>
        {result && (
          <span className="text-t-11 text-fg-3">
            {expanded ? "▲" : "▼"}
          </span>
        )}
      </button>

      {expanded && result && (
        <div className="mt-sp-2 flex flex-col gap-sp-1 border-t border-ilm-border pt-sp-2 font-mono text-t-12">
          <div>
            <span className="text-fg-3">Natija: </span>
            <span
              className={result.passed ? "text-green-700" : "text-red-700"}
            >
              {result.output || "(bo'sh)"}
            </span>
          </div>
          {!result.passed && (
            <div>
              <span className="text-fg-3">Kutilgan: </span>
              <span className="text-green-700">{result.expected}</span>
            </div>
          )}
          {result.error && (
            <div className="text-red-600">Xato: {result.error}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Submission row
// ---------------------------------------------------------------------------

function SubmissionRow({ submission }: { submission: SubmissionHistoryItem }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-ilm-lg border px-sp-3 py-sp-2",
        submission.passed
          ? "border-green-200 bg-green-50"
          : "border-ilm-border bg-ilm-surface",
      )}
    >
      <div className="flex items-center gap-sp-2">
        {submission.passed ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-400" />
        )}
        <span className="text-t-13 font-medium text-ilm-ink">
          {submission.passed ? "O'tdi" : "Muvaffaqiyatsiz"}
        </span>
        {submission.solutionViewed && (
          <span className="rounded-full bg-amber-100 px-sp-2 py-0.5 text-t-11 text-amber-700">
            Yechim ko&apos;rilgan
          </span>
        )}
      </div>
      <div className="flex items-center gap-sp-1 text-t-12 text-fg-3">
        <Clock className="h-3 w-3" />
        {new Date(submission.createdAt).toLocaleDateString("uz-UZ", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Output panels
// ---------------------------------------------------------------------------

function RunOutput({
  results,
  tests,
}: {
  results: WorkerCaseResult[];
  tests: CodingTestStub[];
}) {
  if (results.length === 0) {
    return <span className="text-white/50">Test mavjud emas.</span>;
  }
  return (
    <div className="flex flex-col gap-2">
      {results.map((r) => {
        const args = tests.find((t) => t.index === r.index)?.args ?? "";
        return (
          <div key={r.index}>
            <div className="text-white/60">
              Kirish: <span className="text-white/90">{args}</span>
            </div>
            {r.error ? (
              <div className="text-red-400">[Xato] {r.error}</div>
            ) : (
              <div>
                <span className="text-white/60">Natija: </span>
                <span className="text-white/90">{r.output || "(bo'sh)"}</span>
              </div>
            )}
            {r.logs && (
              <pre className="mt-0.5 whitespace-pre-wrap text-white/50">
                {r.logs}
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SubmitOutput({ result }: { result: SubmitCodeResult }) {
  const passedCount = result.results.filter((r) => r.passed).length;
  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "font-semibold",
          result.passed ? "text-green-400" : "text-red-400",
        )}
      >
        {result.passed
          ? "✓ Barcha testlar o'tdi!"
          : `✗ ${passedCount}/${result.results.length} test o'tdi (${Math.round(result.weightedScore)}%)`}
      </div>
      {result.results.map((r) => (
        <div key={r.index} className="flex items-start gap-2">
          {r.passed ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          )}
          <div>
            <div className="text-white/80">
              {r.description ?? `Test ${r.index + 1}`}
            </div>
            {!r.passed && (
              <div className="mt-0.5 text-white/60">
                <span className="text-red-300">Natija: </span>
                {r.output || "(bo'sh)"}
                {r.error && (
                  <span className="ml-2 text-red-400">({r.error})</span>
                )}
                <br />
                <span className="text-green-300">Kutilgan: </span>
                {r.expected}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
