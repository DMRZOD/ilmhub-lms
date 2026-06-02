"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Archive, BookOpen, Check, Search } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmptyState,
  ErrorCard,
  Pager,
  PageLoader,
} from "@/components/instructor-shell/page-states";
import { formatPriceUsd, formatShortDate, initialsOf } from "@/lib/format";
import { adminCoursesKeys } from "@/lib/query-keys";
import { useAdminCourses } from "@/features/admin/hooks";
import { approveCourse, archiveCourse } from "@/features/admin/api";
import type {
  AdminCourseListItem,
  CourseStatus,
} from "@/features/admin/schemas";
import {
  ADMIN_COURSES_TEXT as T,
  COURSE_STATUS_LABELS,
} from "@/features/admin/labels";

type Tab = "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED" | "ALL";

const TABS: Tab[] = ["PENDING_REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED", "ALL"];

export function statusTone(status: CourseStatus): BadgeProps["tone"] {
  switch (status) {
    case "PUBLISHED":
      return "success";
    case "PENDING_REVIEW":
      return "warning";
    case "REJECTED":
      return "error";
    default:
      return "neutral";
  }
}

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function CoursesContent() {
  const router = useRouter();
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>("PENDING_REVIEW");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPending, setBulkPending] = useState(false);

  const q = useDebounced(search);
  const params = useMemo(
    () => ({ page, status: tab, q: q || undefined }),
    [page, tab, q],
  );

  const { data, isLoading, isError } = useAdminCourses(params);

  useEffect(() => {
    setPage(1);
  }, [tab, q]);

  useEffect(() => {
    setSelected(new Set());
  }, [tab, q, page]);

  const items = data?.items ?? [];
  const allSelected =
    items.length > 0 && items.every((c) => selected.has(c.id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(items.map((c) => c.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkRun(action: "approve" | "archive") {
    const ids = [...selected];
    if (ids.length === 0) return;
    setBulkPending(true);
    const fn = action === "approve" ? approveCourse : archiveCourse;
    const results = await Promise.allSettled(ids.map((id) => fn(id)));
    const ok = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - ok;
    await qc.invalidateQueries({ queryKey: adminCoursesKeys.lists() });
    setBulkPending(false);
    setSelected(new Set());
    if (failed === 0) toast.success(`${ok} ta kurs yangilandi`);
    else toast.warning(`${ok} ta yangilandi, ${failed} ta o'tkazib yuborildi`);
  }

  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-col gap-sp-1">
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          {T.title}
        </h1>
        <p className="text-t-14 text-fg-2">{T.subtitle}</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          {TABS.map((value) => (
            <TabsTrigger key={value} value={value}>
              {T.tabs[value]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ilm-muted" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={T.searchPlaceholder}
          className="pl-10"
        />
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-sp-3 rounded-ilm-md bg-ilm-surface px-sp-4 py-sp-3">
          <span className="text-t-14 font-semibold text-ilm-ink">
            {T.bulk.selected(selected.size)}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-sp-2">
            <Button
              variant="secondary"
              size="sm"
              iconLeft={Check}
              disabled={bulkPending}
              onClick={() => bulkRun("approve")}
            >
              {T.bulk.approve}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={Archive}
              disabled={bulkPending}
              onClick={() => bulkRun("archive")}
            >
              {T.bulk.archive}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={bulkPending}
              onClick={() => setSelected(new Set())}
            >
              {T.bulk.clear}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <PageLoader />
      ) : isError || !data ? (
        <ErrorCard />
      ) : items.length === 0 ? (
        <Card padding="lg">
          <EmptyState icon={BookOpen} text={T.empty} />
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ilm-border text-t-12 uppercase tracking-ilm-wide text-fg-3">
                  <th className="w-10 px-sp-4 py-sp-3">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      aria-label="select-all"
                    />
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.course}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.instructor}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.price}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.students}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.status}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.updated}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((c: AdminCourseListItem) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer border-b border-ilm-border last:border-0 hover:bg-ilm-surface/60"
                    onClick={() => router.push(`/admin/courses/${c.id}`)}
                  >
                    <td
                      className="px-sp-4 py-sp-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selected.has(c.id)}
                        onCheckedChange={() => toggleOne(c.id)}
                        aria-label={`select-${c.id}`}
                      />
                    </td>
                    <td className="px-sp-4 py-sp-3">
                      <div className="flex items-center gap-sp-3">
                        <div className="h-10 w-16 shrink-0 overflow-hidden rounded-ilm-sm bg-ilm-surface">
                          {c.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.thumbnailUrl}
                              alt={c.title}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <span className="line-clamp-2 max-w-[280px] text-t-14 font-semibold text-ilm-ink">
                          {c.title || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-sp-4 py-sp-3">
                      <div className="flex items-center gap-sp-2">
                        <Avatar
                          size="sm"
                          ink
                          src={c.instructor.avatarUrl ?? undefined}
                          alt={c.instructor.name}
                          initials={initialsOf(c.instructor.name)}
                        />
                        <span className="truncate text-t-14 text-fg-2">
                          {c.instructor.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                      {formatPriceUsd(c.priceUsdCents)}
                    </td>
                    <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                      {c.studentsCount}
                    </td>
                    <td className="px-sp-4 py-sp-3">
                      <Badge tone={statusTone(c.status)}>
                        {COURSE_STATUS_LABELS[c.status]}
                      </Badge>
                    </td>
                    <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                      {formatShortDate(c.updatedAt)}
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
    </div>
  );
}
