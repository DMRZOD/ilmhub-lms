"use client";

import { useEffect, useMemo, useState } from "react";
import { Flag, Trash2, X } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarInput } from "@/components/ui/star-input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmptyState,
  ErrorCard,
  Pager,
  PageLoader,
} from "@/components/instructor-shell/page-states";
import { formatShortDate, initialsOf } from "@/lib/format";
import { useAdminReports, useModerateReport } from "@/features/admin/hooks";
import type {
  AdminReviewReport,
  ReviewReportStatus,
} from "@/features/admin/schemas";
import {
  ADMIN_REPORTS_TEXT as T,
  REVIEW_REPORT_STATUS_LABELS,
} from "@/features/admin/labels";

type Tab = "PENDING" | "DISMISSED" | "ALL";
const TABS: Tab[] = ["PENDING", "DISMISSED", "ALL"];

function statusTone(status: ReviewReportStatus): BadgeProps["tone"] {
  switch (status) {
    case "RESOLVED":
      return "success";
    case "DISMISSED":
      return "error";
    default:
      return "warning";
  }
}

export function ReportsContent() {
  const [tab, setTab] = useState<Tab>("PENDING");
  const [page, setPage] = useState(1);

  const params = useMemo(() => ({ page, status: tab }), [page, tab]);
  const { data, isLoading, isError } = useAdminReports(params);
  const moderate = useModerateReport();

  useEffect(() => {
    setPage(1);
  }, [tab]);

  const items = data?.items ?? [];

  function handleDismiss(id: string) {
    if (!window.confirm(T.confirmDismiss)) return;
    moderate.mutate({ id, action: "dismiss" });
  }

  function handleRemove(id: string) {
    if (!window.confirm(T.confirmRemove)) return;
    moderate.mutate({ id, action: "remove" });
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

      {isLoading ? (
        <PageLoader />
      ) : isError || !data ? (
        <ErrorCard />
      ) : items.length === 0 ? (
        <Card padding="lg">
          <EmptyState icon={Flag} text={T.empty} />
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ilm-border text-t-12 uppercase tracking-ilm-wide text-fg-3">
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.course}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.review}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.reporter}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.reason}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.status}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.created}
                  </th>
                  <th className="px-sp-4 py-sp-3 text-right font-semibold">
                    {T.columns.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((r: AdminReviewReport) => {
                  const isPending = r.status === "PENDING";
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-ilm-border align-top last:border-0 hover:bg-ilm-surface/60"
                    >
                      <td className="px-sp-4 py-sp-3">
                        <p className="max-w-[200px] truncate text-t-14 font-semibold text-ilm-ink">
                          {r.review.course.title}
                        </p>
                      </td>
                      <td className="px-sp-4 py-sp-3">
                        <div className="flex items-center gap-sp-2">
                          <Avatar
                            size="sm"
                            ink
                            src={r.review.author.avatarUrl ?? undefined}
                            alt={r.review.author.name}
                            initials={initialsOf(r.review.author.name)}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-sp-1">
                              <span className="truncate text-t-13 font-semibold text-ilm-ink">
                                {r.review.author.name}
                              </span>
                              <StarInput value={r.review.rating} readOnly size={12} />
                            </div>
                            {r.review.comment && (
                              <p className="max-w-[280px] truncate text-t-12 text-fg-3">
                                {r.review.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                        {r.reporter.name}
                      </td>
                      <td className="px-sp-4 py-sp-3">
                        <p className="max-w-[260px] text-t-13 text-fg-2">
                          {r.reason}
                        </p>
                      </td>
                      <td className="px-sp-4 py-sp-3">
                        <Badge tone={statusTone(r.status)}>
                          {REVIEW_REPORT_STATUS_LABELS[r.status]}
                        </Badge>
                      </td>
                      <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                        {formatShortDate(r.createdAt)}
                      </td>
                      <td className="px-sp-4 py-sp-3">
                        <div className="flex justify-end gap-sp-2">
                          {isPending ? (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                iconLeft={X}
                                disabled={moderate.isPending}
                                onClick={() => handleDismiss(r.id)}
                              >
                                {T.dismiss}
                              </Button>
                              <Button
                                size="sm"
                                iconLeft={Trash2}
                                disabled={moderate.isPending}
                                onClick={() => handleRemove(r.id)}
                              >
                                {T.remove}
                              </Button>
                            </>
                          ) : (
                            <span className="text-t-12 text-fg-3">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
