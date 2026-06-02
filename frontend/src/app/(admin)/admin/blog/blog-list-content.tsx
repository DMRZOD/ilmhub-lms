"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmptyState,
  ErrorCard,
  Pager,
  PageLoader,
} from "@/components/instructor-shell/page-states";
import { formatShortDate } from "@/lib/format";
import {
  useBlogCategories,
  useBlogPosts,
  useDeleteBlogPost,
} from "@/features/admin/cms-hooks";
import type { BlogPostListItem, BlogStatus } from "@/features/admin/cms-schemas";
import { ADMIN_BLOG_TEXT as T } from "@/features/admin/labels";

type Tab = "ALL" | BlogStatus;
const TABS: Tab[] = ["ALL", "DRAFT", "PUBLISHED"];

function statusTone(status: BlogStatus): BadgeProps["tone"] {
  return status === "PUBLISHED" ? "success" : "warning";
}

export function BlogListContent() {
  const [tab, setTab] = useState<Tab>("ALL");
  const [categoryId, setCategoryId] = useState<string>("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      page,
      ...(tab !== "ALL" ? { status: tab } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(q.trim() ? { q: q.trim() } : {}),
    }),
    [page, tab, categoryId, q],
  );

  const { data, isLoading, isError } = useBlogPosts(params);
  const { data: categories } = useBlogCategories();
  const del = useDeleteBlogPost();

  useEffect(() => {
    setPage(1);
  }, [tab, categoryId, q]);

  const items = data?.items ?? [];

  function handleDelete(id: string) {
    if (!window.confirm(T.editor.confirmDelete)) return;
    del.mutate(id);
  }

  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-wrap items-end justify-between gap-sp-4">
        <div className="flex flex-col gap-sp-1">
          <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
            {T.title}
          </h1>
          <p className="text-t-14 text-fg-2">{T.subtitle}</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Icon icon={Plus} size={18} />
            {T.newPost}
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-sp-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="flex-1">
          <TabsList>
            {TABS.map((value) => (
              <TabsTrigger key={value} value={value}>
                {value === "ALL"
                  ? "Hammasi"
                  : T.status[value as BlogStatus]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="h-10 rounded-ilm-md bg-ilm-surface px-3 text-t-14 font-medium text-ilm-ink ring-1 ring-inset ring-transparent focus-visible:outline-none focus-visible:ring-ilm-ink"
        >
          <option value="">{T.filters.allCategories}</option>
          {(categories ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={T.searchPlaceholder}
          className="h-10 w-full max-w-xs"
        />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError || !data ? (
        <ErrorCard />
      ) : items.length === 0 ? (
        <Card padding="lg">
          <EmptyState icon={FileText} text={T.empty} />
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ilm-border text-t-12 uppercase tracking-ilm-wide text-fg-3">
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.title}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.category}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.status}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.updated}
                  </th>
                  <th className="px-sp-4 py-sp-3 text-right font-semibold">
                    {T.columns.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((p: BlogPostListItem) => (
                  <tr
                    key={p.id}
                    className="border-b border-ilm-border last:border-0 hover:bg-ilm-surface/60"
                  >
                    <td className="px-sp-4 py-sp-3">
                      <div className="flex items-center gap-sp-3">
                        {p.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.coverImageUrl}
                            alt=""
                            className="h-10 w-16 flex-none rounded-ilm-sm object-cover"
                          />
                        ) : (
                          <span className="grid h-10 w-16 flex-none place-items-center rounded-ilm-sm bg-ilm-surface text-fg-3">
                            <FileText className="h-4 w-4" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-t-14 font-semibold text-ilm-ink">
                            {p.title}
                          </p>
                          <p className="truncate text-t-12 text-fg-3">
                            /{p.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                      {p.category?.name ?? "—"}
                    </td>
                    <td className="px-sp-4 py-sp-3">
                      <Badge tone={statusTone(p.status)}>
                        {T.status[p.status]}
                      </Badge>
                    </td>
                    <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                      {formatShortDate(p.updatedAt)}
                    </td>
                    <td className="px-sp-4 py-sp-3">
                      <div className="flex justify-end gap-sp-2">
                        <Button asChild variant="secondary" size="sm">
                          <Link href={`/admin/blog/${p.id}/edit`}>
                            <Icon icon={Pencil} size={14} />
                            Tahrirlash
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          iconLeft={Trash2}
                          iconOnly
                          aria-label="O'chirish"
                          disabled={del.isPending}
                          onClick={() => handleDelete(p.id)}
                        />
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
    </div>
  );
}
