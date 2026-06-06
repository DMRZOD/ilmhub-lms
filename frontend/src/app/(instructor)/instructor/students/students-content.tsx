"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye,
  MessageSquarePlus,
  Search,
  Users,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import {
  EmptyState,
  ErrorCard,
  Pager,
  PageLoader,
} from "@/components/instructor-shell/page-states";
import { formatShortDate, formatUsd, initialsOf } from "@/lib/format";
import { useMyCourses } from "@/features/course-wizard/hooks";
import {
  useInstructorStudentDetail,
  useInstructorStudents,
} from "@/features/instructor/hooks";
import { useStartConversation } from "@/features/messages/hooks";

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function StudentsContent() {
  const router = useRouter();
  const [courseId, setCourseId] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openStudentId, setOpenStudentId] = useState<string | null>(null);

  const q = useDebounced(search);
  const { data: courses } = useMyCourses();
  const startConversation = useStartConversation();

  const params = useMemo(
    () => ({
      page,
      courseId: courseId === "ALL" ? undefined : courseId,
      q: q || undefined,
    }),
    [page, courseId, q],
  );

  const { data, isLoading, isError } = useInstructorStudents(params);

  // Reset to first page whenever the filters change.
  useEffect(() => {
    setPage(1);
  }, [courseId, q]);

  async function handleMessage(studentId: string) {
    try {
      const conv = await startConversation.mutateAsync({ studentId });
      router.push(`/instructor/messages?c=${conv.id}`);
    } catch {
      toast.error("Suhbatni boshlab bo'lmadi");
    }
  }

  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-col gap-sp-1">
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Talabalar
        </h1>
        <p className="text-t-14 text-fg-2">
          Kurslaringizga yozilgan talabalar ro&apos;yxati
        </p>
      </div>

      <div className="flex flex-col gap-sp-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ilm-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism yoki email bo'yicha qidirish"
            className="pl-10"
          />
        </div>
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger className="h-12 w-full rounded-ilm-md bg-ilm-surface px-4 text-t-14 font-medium sm:w-64">
            <SelectValue placeholder="Barcha kurslar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barcha kurslar</SelectItem>
            {courses?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError || !data ? (
        <ErrorCard />
      ) : data.items.length === 0 ? (
        <Card padding="lg">
          <EmptyState icon={Users} text="Hozircha talabalar yo'q" />
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ilm-border text-t-12 uppercase tracking-ilm-wide text-fg-3">
                  <th className="px-sp-4 py-sp-3 font-semibold">Talaba</th>
                  <th className="px-sp-4 py-sp-3 font-semibold">Kurslar</th>
                  <th className="px-sp-4 py-sp-3 font-semibold">Sarflagan</th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    Oxirgi faollik
                  </th>
                  <th className="px-sp-4 py-sp-3 text-right font-semibold">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-ilm-border last:border-0 hover:bg-ilm-surface/60"
                  >
                    <td className="px-sp-4 py-sp-3">
                      <button
                        type="button"
                        onClick={() => setOpenStudentId(s.id)}
                        className="flex items-center gap-sp-3 text-left"
                      >
                        <Avatar
                          size="sm"
                          ink
                          src={s.avatarUrl ?? undefined}
                          alt={s.name}
                          initials={initialsOf(s.name)}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-t-14 font-semibold text-ilm-ink">
                            {s.name}
                          </p>
                          <p className="truncate text-t-12 text-fg-3">
                            {s.email}
                          </p>
                        </div>
                      </button>
                    </td>
                    <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                      {s.coursesCount}
                    </td>
                    <td className="px-sp-4 py-sp-3 text-t-14 font-semibold text-ilm-ink">
                      {formatUsd(s.totalSpentUsdCents)}
                    </td>
                    <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                      {s.lastActivityAt
                        ? formatShortDate(s.lastActivityAt)
                        : "—"}
                    </td>
                    <td className="px-sp-4 py-sp-3">
                      <div className="flex items-center justify-end gap-sp-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          iconLeft={MessageSquarePlus}
                          onClick={() => handleMessage(s.id)}
                          disabled={startConversation.isPending}
                        >
                          Xabar
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          iconLeft={Eye}
                          onClick={() => setOpenStudentId(s.id)}
                        >
                          Ko&apos;rish
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {data && (
        <Pager
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPage={setPage}
        />
      )}

      <StudentDetailSheet
        studentId={openStudentId}
        onClose={() => setOpenStudentId(null)}
        onMessage={handleMessage}
      />
    </div>
  );
}

function StudentDetailSheet({
  studentId,
  onClose,
  onMessage,
}: {
  studentId: string | null;
  onClose: () => void;
  onMessage: (id: string) => void;
}) {
  const { data, isLoading, isError } = useInstructorStudentDetail(
    studentId ?? undefined,
  );

  return (
    <Sheet open={Boolean(studentId)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-sp-3">
            {data && (
              <Avatar
                size="md"
                ink
                src={data.student.avatarUrl ?? undefined}
                alt={data.student.name}
                initials={initialsOf(data.student.name)}
              />
            )}
            <div className="min-w-0">
              <SheetTitle className="truncate text-left">
                {data ? data.student.name : "Talaba ma'lumotlari"}
              </SheetTitle>
              {data && (
                <SheetDescription className="truncate text-left">
                  {data.student.email}
                </SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        {isLoading ? (
          <PageLoader />
        ) : isError || !data ? (
          <ErrorCard />
        ) : (
          <div className="mt-sp-6 flex flex-col gap-sp-4">
              <Button
                iconLeft={MessageSquarePlus}
                onClick={() => studentId && onMessage(studentId)}
              >
                Xabar yuborish
              </Button>

              <div className="flex flex-col gap-sp-3">
                <h4 className="text-t-14 font-bold text-ilm-ink">
                  Kurslar ({data.courses.length})
                </h4>
                {data.courses.map((c) => (
                  <div
                    key={c.course.id}
                    className="flex flex-col gap-sp-2 rounded-ilm-md bg-ilm-surface p-sp-3"
                  >
                    <div className="flex items-start justify-between gap-sp-2">
                      <p className="text-t-14 font-semibold text-ilm-ink">
                        {c.course.title}
                      </p>
                      <span className="shrink-0 text-t-12 font-bold text-ilm-ink">
                        {c.progressPercent}%
                      </span>
                    </div>
                    <Progress value={c.progressPercent} />
                    <p className="text-t-12 text-fg-3">
                      Yozilgan: {formatShortDate(c.enrolledAt)}
                      {c.lastActivityAt
                        ? ` · Oxirgi faollik: ${formatShortDate(c.lastActivityAt)}`
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
