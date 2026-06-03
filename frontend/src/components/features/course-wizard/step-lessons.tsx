"use client";

import { useRef, useState } from "react";
import * as UpChunk from "@mux/upchunk";
import {
  FileVideo,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LessonVideoPlayer } from "@/components/features/learning/lesson-video-player";
import { RichTextEditor } from "@/components/features/notes/rich-text-editor";
import { createVideoUpload } from "@/features/course-wizard/api";
import { useLessonAuthoring } from "@/features/course-wizard/hooks";
import {
  LESSON_TYPE_LABELS,
  type Resource,
  type WizardCourse,
  type WizardLesson,
} from "@/features/course-wizard/schemas";
import { cn } from "@/lib/utils";
import { INPUT_CLASS, LABEL_CLASS } from "./field-styles";
import { useDebouncedCallback } from "./step-helpers";

type Auth = ReturnType<typeof useLessonAuthoring>;

export function StepLessons({ course }: { course: WizardCourse }) {
  const auth = useLessonAuthoring(course.id);

  if (course.sections.length === 0) {
    return (
      <p className="rounded-ilm-xl border border-dashed border-ilm-border bg-ilm-surface px-sp-4 py-sp-6 text-center text-t-14 text-fg-3">
        Avval «Dastur» bosqichida bo&apos;lim va darslar qo&apos;shing.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-sp-6">
      <p className="text-t-14 text-fg-2">
        Har bir dars uchun video yuklang yoki maqola matnini yozing. Test va kod
        darslari mos bosqichlarda sozlanadi.
      </p>

      {course.sections.map((section) => (
        <div key={section.id} className="flex flex-col gap-sp-3">
          <h3 className="text-t-14 font-bold text-ilm-ink">{section.title}</h3>
          {section.lessons.length === 0 ? (
            <p className="text-t-12 text-fg-3">Bu bo&apos;limda darslar yo&apos;q.</p>
          ) : (
            section.lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} auth={auth} />
            ))
          )}
        </div>
      ))}
    </div>
  );
}

function LessonCard({ lesson, auth }: { lesson: WizardLesson; auth: Auth }) {
  const editable = lesson.type === "VIDEO" || lesson.type === "ARTICLE";

  return (
    <div className="flex flex-col gap-sp-3 rounded-ilm-2xl border border-ilm-border bg-ilm-paper p-sp-4">
      <div className="flex flex-wrap items-center justify-between gap-sp-2">
        <div className="flex items-center gap-sp-2">
          <Badge tone="neutral">{LESSON_TYPE_LABELS[lesson.type]}</Badge>
          <span className="text-t-14 font-semibold text-ilm-ink">
            {lesson.title}
          </span>
        </div>
        {editable && <PreviewToggle lesson={lesson} auth={auth} />}
      </div>

      {lesson.type === "VIDEO" && <VideoEditor lesson={lesson} auth={auth} />}
      {lesson.type === "ARTICLE" && (
        <ArticleEditor lesson={lesson} auth={auth} />
      )}
      {lesson.type === "QUIZ" && (
        <TypeHint label="Test savollari «Testlar» bosqichida sozlanadi." />
      )}
      {lesson.type === "CODING" && (
        <TypeHint label="Kod mashqi «Kod» bosqichida sozlanadi." />
      )}

      {editable && <ResourcesEditor lesson={lesson} auth={auth} />}
    </div>
  );
}

function TypeHint({ label }: { label: string }) {
  return (
    <p className="rounded-ilm-xl border border-dashed border-ilm-border bg-ilm-surface px-sp-3 py-sp-2 text-t-12 text-fg-3">
      {label}
    </p>
  );
}

function PreviewToggle({ lesson, auth }: { lesson: WizardLesson; auth: Auth }) {
  return (
    <label className="flex cursor-pointer items-center gap-1 text-t-12 text-fg-2">
      <input
        type="checkbox"
        checked={lesson.isPreview}
        onChange={(e) =>
          auth.updateContent.mutate({
            lessonId: lesson.id,
            payload: { isPreview: e.target.checked },
          })
        }
      />
      Bepul ko&apos;rish
    </label>
  );
}

function VideoEditor({ lesson, auth }: { lesson: WizardLesson; auth: Auth }) {
  const [progress, setProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const start = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Faqat video fayllar qabul qilinadi");
      return;
    }
    try {
      setUploading(true);
      setProgress(0);
      const { url } = await createVideoUpload(lesson.id);
      const upload = UpChunk.createUpload({
        endpoint: url,
        file,
        // Small starting chunk + dynamic sizing makes uploads far more resilient
        // on slow / unstable connections: a dropped chunk only costs ~5 MB to
        // retry (not 30 MB), progress updates smoothly, and UpChunk grows the
        // chunk size automatically when the connection turns out to be fast.
        chunkSize: 5120, // 5 MB start (must be a multiple of 256)
        dynamicChunkSize: true,
      });
      upload.on("progress", (e: CustomEvent) =>
        setProgress(Math.round((e.detail as number) ?? 0)),
      );
      upload.on("error", () => {
        toast.error("Videoni yuklab bo'lmadi");
        setUploading(false);
        setProgress(null);
      });
      upload.on("success", () => {
        toast.success("Video yuklandi — qayta ishlanmoqda");
        setUploading(false);
        setProgress(null);
        auth.invalidate();
      });
    } catch {
      toast.error("Yuklashni boshlab bo'lmadi");
      setUploading(false);
      setProgress(null);
    }
  };

  const status = lesson.muxAssetStatus;
  const ready = status === "READY" && lesson.muxPlaybackId;
  const processing =
    !uploading && (status === "UPLOADING" || status === "PROCESSING");

  return (
    <div className="flex flex-col gap-sp-2">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => start(e.target.files?.[0])}
      />

      {uploading ? (
        <div className="flex flex-col gap-sp-2 rounded-ilm-xl border border-ilm-border bg-ilm-surface p-sp-4">
          <div className="flex items-center justify-between text-t-12 text-fg-2">
            <span className="inline-flex items-center gap-1">
              <Upload className="h-3.5 w-3.5" /> Yuklanmoqda…
            </span>
            <span>{progress ?? 0}%</span>
          </div>
          <Progress value={progress ?? 0} />
        </div>
      ) : ready ? (
        <div className="flex flex-col gap-sp-2">
          <LessonVideoPlayer
            playbackId={lesson.muxPlaybackId as string}
            tokenJwt={null}
            startTimeSeconds={0}
            title={lesson.title}
            onPositionChange={() => {}}
            onEnded={() => {}}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            iconLeft={RefreshCw}
            onClick={() => inputRef.current?.click()}
            className="self-start"
          >
            Videoni almashtirish
          </Button>
        </div>
      ) : processing ? (
        <div className="flex items-center gap-sp-2 rounded-ilm-xl border border-ilm-border bg-ilm-surface p-sp-4 text-t-14 text-fg-2">
          <Loader2 className="h-4 w-4 animate-spin text-ilm-ink" />
          Qayta ishlanyapti… (bir necha daqiqa olishi mumkin)
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center gap-sp-2 rounded-ilm-xl border-2 border-dashed bg-ilm-surface px-sp-4 py-sp-6 text-fg-3 transition hover:border-ilm-ink",
            status === "ERRORED" ? "border-red-300" : "border-ilm-border",
          )}
        >
          <FileVideo className="h-7 w-7" />
          <span className="text-t-14">
            {status === "ERRORED"
              ? "Xatolik yuz berdi — qayta urinib ko'ring"
              : "Video faylni tanlang yoki shu yerga tashlang"}
          </span>
        </button>
      )}
    </div>
  );
}

function ArticleEditor({ lesson, auth }: { lesson: WizardLesson; auth: Auth }) {
  const save = useDebouncedCallback(
    (html: string) =>
      auth.updateContent.mutate({
        lessonId: lesson.id,
        payload: { articleContent: html },
      }),
    800,
  );

  return (
    <div className="flex flex-col gap-sp-2">
      <label className={LABEL_CLASS}>Maqola matni</label>
      <RichTextEditor
        initialContent={lesson.articleContent ?? ""}
        placeholder="Dars matnini yozing…"
        onChange={save}
      />
    </div>
  );
}

function ResourcesEditor({
  lesson,
  auth,
}: {
  lesson: WizardLesson;
  auth: Auth;
}) {
  const [items, setItems] = useState<Resource[]>(lesson.resources);
  const save = useDebouncedCallback(
    (next: Resource[]) =>
      auth.updateContent.mutate({
        lessonId: lesson.id,
        payload: {
          resources: next.filter(
            (r) => r.name.trim() && /^https?:\/\//i.test(r.url.trim()),
          ),
        },
      }),
    700,
  );

  const commit = (next: Resource[]) => {
    setItems(next);
    save(next);
  };
  const update = (i: number, patch: Partial<Resource>) =>
    commit(items.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  return (
    <div className="flex flex-col gap-sp-2 border-t border-ilm-border pt-sp-3">
      <span className={cn(LABEL_CLASS, "text-t-12")}>
        Qo&apos;shimcha materiallar (havolalar)
      </span>
      {items.map((r, i) => (
        <div key={i} className="flex items-center gap-sp-2">
          <input
            value={r.name}
            placeholder="Nomi"
            maxLength={160}
            onChange={(e) => update(i, { name: e.target.value })}
            className={cn(INPUT_CLASS, "py-1.5 text-t-14")}
          />
          <div className="relative flex-[2]">
            <Link2 className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-3" />
            <input
              value={r.url}
              placeholder="https://…"
              maxLength={2048}
              onChange={(e) => update(i, { url: e.target.value })}
              className={cn(INPUT_CLASS, "py-1.5 pl-7 text-t-14")}
            />
          </div>
          <button
            type="button"
            aria-label="O'chirish"
            onClick={() => commit(items.filter((_, idx) => idx !== i))}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-ilm-md text-fg-3 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      {items.length < 20 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          iconLeft={Plus}
          onClick={() => commit([...items, { name: "", url: "" }])}
          className="self-start"
        >
          Material qo&apos;shish
        </Button>
      )}
    </div>
  );
}
