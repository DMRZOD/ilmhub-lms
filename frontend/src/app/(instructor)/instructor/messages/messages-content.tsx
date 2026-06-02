"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Megaphone, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatShortDate, initialsOf } from "@/lib/format";
import { Inbox } from "@/components/messages/inbox";
import {
  EmptyState,
  Pager,
  PageLoader,
} from "@/components/instructor-shell/page-states";
import { useMyCourses } from "@/features/course-wizard/hooks";
import {
  useCreateAnnouncement,
  useInstructorAnnouncements,
  useInstructorStudents,
} from "@/features/instructor/hooks";

export function MessagesContent() {
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get("c") ?? undefined;

  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-col gap-sp-1">
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Aloqalar
        </h1>
        <p className="text-t-14 text-fg-2">
          Talabalar bilan yozishmalar va e&apos;lonlar
        </p>
      </div>

      <Tabs defaultValue="messages">
        <TabsList>
          <TabsTrigger value="messages">Suhbatlar</TabsTrigger>
          <TabsTrigger value="announce">E&apos;lon yuborish</TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <Inbox initialConversationId={initialConversationId} />
        </TabsContent>

        <TabsContent value="announce">
          <div className="flex flex-col gap-sp-6">
            <AnnouncementComposer />
            <AnnouncementHistory />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnnouncementComposer() {
  const { data: courses } = useMyCourses();
  const create = useCreateAnnouncement();

  const [courseId, setCourseId] = useState("");
  const [audience, setAudience] = useState<"ALL" | "SELECTED">("ALL");
  const [selected, setSelected] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const { data: students } = useInstructorStudents(
    { courseId, limit: 100 },
    Boolean(courseId) && audience === "SELECTED",
  );

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function submit() {
    if (!courseId) {
      toast.error("Kursni tanlang");
      return;
    }
    if (audience === "SELECTED" && selected.length === 0) {
      toast.error("Talabalarni tanlang");
      return;
    }
    try {
      await create.mutateAsync({
        courseId,
        audience:
          audience === "ALL"
            ? "ALL"
            : selected.length === 1
              ? "ONE"
              : "SELECTED",
        userIds: audience === "SELECTED" ? selected : undefined,
        subject: subject.trim(),
        body: body.trim(),
      });
      toast.success("E'lon yuborildi");
      setSubject("");
      setBody("");
      setSelected([]);
    } catch {
      toast.error("E'lonni yuborib bo'lmadi");
    }
  }

  const canSubmit =
    courseId && subject.trim() && body.trim() && !create.isPending;

  return (
    <Card padding="lg" className="flex flex-col gap-sp-4">
      <div className="flex items-center gap-sp-2">
        <Megaphone className="h-5 w-5 text-ilm-ink" />
        <h3 className="text-t-18 font-bold text-ilm-ink">Yangi e&apos;lon</h3>
      </div>

      <div className="flex flex-col gap-sp-3 sm:flex-row">
        <Select
          value={courseId}
          onValueChange={(v) => {
            setCourseId(v);
            setSelected([]);
          }}
        >
          <SelectTrigger className="h-12 rounded-ilm-md bg-ilm-surface px-4 text-t-14 font-medium sm:w-72">
            <SelectValue placeholder="Kursni tanlang" />
          </SelectTrigger>
          <SelectContent>
            {courses?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-sp-2">
          {(["ALL", "SELECTED"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAudience(a)}
              className={cn(
                "rounded-ilm-full px-sp-4 py-sp-2 text-t-12 font-semibold transition",
                audience === a
                  ? "bg-ilm-ink text-white"
                  : "bg-ilm-surface text-fg-2 hover:text-ilm-ink",
              )}
            >
              {a === "ALL" ? "Barchaga" : "Tanlanganlarga"}
            </button>
          ))}
        </div>
      </div>

      {audience === "SELECTED" && courseId && (
        <div className="max-h-48 overflow-y-auto rounded-ilm-md bg-ilm-surface p-sp-2">
          {students && students.items.length > 0 ? (
            students.items.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-sp-2 rounded-ilm-md px-sp-2 py-sp-2 hover:bg-ilm-paper"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(s.id)}
                  onChange={() => toggle(s.id)}
                  className="h-4 w-4 accent-ilm-ink"
                />
                <Avatar
                  size="sm"
                  ink
                  src={s.avatarUrl ?? undefined}
                  alt={s.name}
                  initials={initialsOf(s.name)}
                />
                <span className="truncate text-t-14 text-ilm-ink">{s.name}</span>
              </label>
            ))
          ) : (
            <p className="px-sp-2 py-sp-3 text-t-12 text-fg-3">
              Bu kursda talabalar yo&apos;q
            </p>
          )}
        </div>
      )}

      <Input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Mavzu"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="E'lon matni..."
        className="w-full resize-none rounded-ilm-md bg-ilm-surface p-sp-3 text-t-14 text-ilm-ink ring-1 ring-inset ring-transparent focus-visible:bg-ilm-paper focus-visible:outline-none focus-visible:ring-ilm-ink"
      />
      <div>
        <Button iconLeft={Send} onClick={submit} disabled={!canSubmit}>
          Yuborish
        </Button>
      </div>
    </Card>
  );
}

function AnnouncementHistory() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useInstructorAnnouncements(page);

  const audienceLabel = useMemo(
    () => ({ ALL: "Barchaga", SELECTED: "Tanlangan", ONE: "Bitta" }),
    [],
  );

  if (isLoading) return <PageLoader />;
  if (!data) return null;

  return (
    <Card padding="lg" className="flex flex-col gap-sp-4">
      <h3 className="text-t-18 font-bold text-ilm-ink">Yuborilgan e&apos;lonlar</h3>
      {data.items.length === 0 ? (
        <EmptyState icon={Megaphone} text="Hozircha e'lonlar yo'q" />
      ) : (
        <ul className="flex flex-col gap-sp-3">
          {data.items.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-1 rounded-ilm-md bg-ilm-surface p-sp-3"
            >
              <div className="flex items-center justify-between gap-sp-2">
                <p className="truncate text-t-14 font-semibold text-ilm-ink">
                  {a.subject}
                </p>
                <span className="shrink-0 text-t-12 text-fg-3">
                  {formatShortDate(a.createdAt)}
                </span>
              </div>
              <p className="line-clamp-2 text-t-14 text-fg-2">{a.body}</p>
              <p className="text-t-12 text-fg-3">
                {a.course?.title ?? "—"} · {audienceLabel[a.audience]} ·{" "}
                {a.recipientCount} ta qabul qiluvchi
              </p>
            </li>
          ))}
        </ul>
      )}
      <Pager page={data.meta.page} totalPages={data.meta.totalPages} onPage={setPage} />
    </Card>
  );
}
