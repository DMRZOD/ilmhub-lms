"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, RotateCcw, X } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmptyState,
  ErrorCard,
  Pager,
  PageLoader,
} from "@/components/instructor-shell/page-states";
import { formatShortDate, formatUsd, initialsOf } from "@/lib/format";
import { adminRefundsKeys } from "@/lib/query-keys";
import { useAdminRefunds, useModerateRefund } from "@/features/admin/hooks";
import { approveRefund } from "@/features/admin/api";
import type { AdminRefund, RefundStatus } from "@/features/admin/schemas";
import {
  ADMIN_REFUNDS_TEXT as T,
  PAYMENT_PROVIDER_LABELS,
  REFUND_STATUS_LABELS,
} from "@/features/admin/labels";

type Tab = "REQUESTED" | "COMPLETED" | "REJECTED" | "ALL";
const TABS: Tab[] = ["REQUESTED", "COMPLETED", "REJECTED", "ALL"];

function statusTone(status: RefundStatus): BadgeProps["tone"] {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "REJECTED":
      return "error";
    case "APPROVED":
      return "info";
    default:
      return "warning";
  }
}

export function RefundsContent() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("REQUESTED");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPending, setBulkPending] = useState(false);

  const params = useMemo(() => ({ page, status: tab }), [page, tab]);
  const { data, isLoading, isError } = useAdminRefunds(params);
  const moderate = useModerateRefund();

  useEffect(() => {
    setPage(1);
  }, [tab]);

  useEffect(() => {
    setSelected(new Set());
  }, [tab, page]);

  const items = data?.items ?? [];
  const pendingItems = items.filter((r) => r.status === "REQUESTED");
  const allSelected =
    pendingItems.length > 0 && pendingItems.every((r) => selected.has(r.id));

  function toggleAll() {
    setSelected(
      allSelected ? new Set() : new Set(pendingItems.map((r) => r.id)),
    );
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleReject(id: string) {
    const reason = window.prompt(T.rejectPrompt);
    if (reason === null) return;
    if (reason.trim().length < 5) {
      window.alert(T.rejectPrompt);
      return;
    }
    moderate.mutate({ id, action: "reject", reason: reason.trim() });
  }

  function handleApprove(id: string) {
    if (!window.confirm(T.confirmApprove)) return;
    moderate.mutate({ id, action: "approve" });
  }

  async function bulkApprove() {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (!window.confirm(T.confirmApprove)) return;
    setBulkPending(true);
    const results = await Promise.allSettled(ids.map((id) => approveRefund(id)));
    const ok = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - ok;
    await qc.invalidateQueries({ queryKey: adminRefundsKeys.lists() });
    setBulkPending(false);
    setSelected(new Set());
    if (failed === 0) toast.success(`${ok} ta so'rov tasdiqlandi`);
    else toast.warning(`${ok} ta tasdiqlandi, ${failed} ta o'tkazib yuborildi`);
  }

  const showSelect = tab === "REQUESTED" || tab === "ALL";

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
              onClick={bulkApprove}
            >
              {T.bulk.approve}
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
          <EmptyState icon={RotateCcw} text={T.empty} />
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ilm-border text-t-12 uppercase tracking-ilm-wide text-fg-3">
                  {showSelect && (
                    <th className="w-10 px-sp-4 py-sp-3">
                      {pendingItems.length > 0 && (
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={toggleAll}
                          aria-label="select-all"
                        />
                      )}
                    </th>
                  )}
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.student}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.courses}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.amount}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.method}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.status}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.requested}
                  </th>
                  <th className="px-sp-4 py-sp-3 text-right font-semibold">
                    {T.columns.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((r: AdminRefund) => {
                  const isRequested = r.status === "REQUESTED";
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-ilm-border align-top last:border-0 hover:bg-ilm-surface/60"
                    >
                      {showSelect && (
                        <td className="px-sp-4 py-sp-3">
                          {isRequested && (
                            <Checkbox
                              checked={selected.has(r.id)}
                              onCheckedChange={() => toggleOne(r.id)}
                              aria-label={`select-${r.id}`}
                            />
                          )}
                        </td>
                      )}
                      <td className="px-sp-4 py-sp-3">
                        <div className="flex items-center gap-sp-2">
                          <Avatar
                            size="sm"
                            ink
                            src={r.student.avatarUrl ?? undefined}
                            alt={r.student.name}
                            initials={initialsOf(r.student.name)}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-t-14 font-semibold text-ilm-ink">
                              {r.student.name}
                            </p>
                            <p className="truncate text-t-12 text-fg-3">
                              {r.student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-sp-4 py-sp-3">
                        <p className="max-w-[260px] text-t-14 text-ilm-ink">
                          {r.courses.map((c) => c.title).join(", ")}
                        </p>
                        <p className="mt-sp-1 max-w-[260px] truncate text-t-12 text-fg-3">
                          {r.reason}
                        </p>
                      </td>
                      <td className="px-sp-4 py-sp-3 text-t-14 font-semibold text-ilm-ink">
                        {formatUsd(r.order.totalUsdCents)}
                      </td>
                      <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                        {PAYMENT_PROVIDER_LABELS[r.order.paymentMethod] ??
                          r.order.paymentMethod}
                      </td>
                      <td className="px-sp-4 py-sp-3">
                        <Badge tone={statusTone(r.status)}>
                          {REFUND_STATUS_LABELS[r.status]}
                        </Badge>
                      </td>
                      <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                        {formatShortDate(r.createdAt)}
                      </td>
                      <td className="px-sp-4 py-sp-3">
                        <div className="flex justify-end gap-sp-2">
                          {isRequested ? (
                            <>
                              <Button
                                size="sm"
                                iconLeft={Check}
                                disabled={moderate.isPending}
                                onClick={() => handleApprove(r.id)}
                              >
                                {T.approve}
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                iconLeft={X}
                                disabled={moderate.isPending}
                                onClick={() => handleReject(r.id)}
                              >
                                {T.reject}
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
