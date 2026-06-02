"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ExternalLink,
  GraduationCap,
  Inbox,
  Search,
  ShieldCheck,
  ShieldOff,
  X,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmptyState,
  ErrorCard,
  Pager,
  PageLoader,
} from "@/components/instructor-shell/page-states";
import { formatShortDate, formatUsd, initialsOf } from "@/lib/format";
import {
  useAdminApplications,
  useAdminInstructors,
  useApproveApplication,
  useRejectApplication,
  useUpdateAdminUser,
} from "@/features/admin/hooks";
import type {
  AdminInstructorListItem,
  ApplicationStatus,
} from "@/features/admin/schemas";
import {
  ADMIN_INSTRUCTORS_TEXT as T,
  STATUS_LABELS,
} from "@/features/admin/labels";

type Tab = "approved" | "pending" | "rejected";

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function InstructorsContent() {
  const [tab, setTab] = useState<Tab>("approved");

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
          <TabsTrigger value="approved">{T.tabs.approved}</TabsTrigger>
          <TabsTrigger value="pending">{T.tabs.pending}</TabsTrigger>
          <TabsTrigger value="rejected">{T.tabs.rejected}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div>
        {tab === "approved" && <ApprovedInstructors />}
        {tab === "pending" && <Applications status="PENDING" />}
        {tab === "rejected" && <Applications status="REJECTED" />}
      </div>
    </div>
  );
}

// ---------- Approved instructors ----------

function ApprovedInstructors() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "students" | "revenue">("name");
  const [page, setPage] = useState(1);
  const q = useDebounced(search);

  const { data, isLoading, isError } = useAdminInstructors({ page, q: q || undefined, sort });
  const updateUser = useUpdateAdminUser();

  useEffect(() => {
    setPage(1);
  }, [q, sort]);

  function toggleStatus(inst: AdminInstructorListItem) {
    const nextStatus = inst.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    updateUser.mutate({ id: inst.id, body: { status: nextStatus } });
  }

  return (
    <div className="flex flex-col gap-sp-5">
      <div className="flex flex-col gap-sp-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ilm-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={T.searchPlaceholder}
            className="pl-10"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="h-12 w-full rounded-ilm-md bg-ilm-surface px-4 text-t-14 font-medium sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">{T.sort.name}</SelectItem>
            <SelectItem value="students">{T.sort.students}</SelectItem>
            <SelectItem value="revenue">{T.sort.revenue}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError || !data ? (
        <ErrorCard />
      ) : data.items.length === 0 ? (
        <Card padding="lg">
          <EmptyState icon={GraduationCap} text={T.empty.approved} />
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ilm-border text-t-12 uppercase tracking-ilm-wide text-fg-3">
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.instructor}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.courses}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.students}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.revenue}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.status}
                  </th>
                  <th className="px-sp-4 py-sp-3 text-right font-semibold">
                    {T.columns.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((inst) => (
                  <tr
                    key={inst.id}
                    className="border-b border-ilm-border last:border-0 hover:bg-ilm-surface/60"
                  >
                    <td className="px-sp-4 py-sp-3">
                      <div className="flex items-center gap-sp-3">
                        <Avatar
                          size="sm"
                          ink
                          src={inst.avatarUrl ?? undefined}
                          alt={inst.name}
                          initials={initialsOf(inst.name)}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-t-14 font-semibold text-ilm-ink">
                            {inst.name}
                          </p>
                          <p className="truncate text-t-12 text-fg-3">
                            {inst.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                      {inst.coursesCount}
                    </td>
                    <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                      {inst.totalStudents}
                    </td>
                    <td className="px-sp-4 py-sp-3">
                      <p className="text-t-14 font-semibold text-ilm-ink">
                        {formatUsd(inst.grossUsdCents)}
                      </p>
                      <p className="text-t-12 text-fg-3">
                        {formatUsd(inst.netUsdCents)} net
                      </p>
                    </td>
                    <td className="px-sp-4 py-sp-3">
                      <Badge
                        tone={inst.status === "ACTIVE" ? "success" : "error"}
                      >
                        {STATUS_LABELS[inst.status]}
                      </Badge>
                    </td>
                    <td className="px-sp-4 py-sp-3">
                      <div className="flex justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          iconLeft={
                            inst.status === "ACTIVE" ? ShieldOff : ShieldCheck
                          }
                          disabled={updateUser.isPending}
                          onClick={() => toggleStatus(inst)}
                        >
                          {inst.status === "ACTIVE"
                            ? T.actions.suspend
                            : T.actions.unsuspend}
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
    </div>
  );
}

// ---------- Applications (pending / rejected) ----------

function Applications({ status }: { status: ApplicationStatus }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminApplications(status, { page });
  const approve = useApproveApplication();
  const reject = useRejectApplication();

  const isPending = status === "PENDING";

  function handleReject(id: string) {
    const reason = window.prompt(T.application.rejectPrompt);
    if (reason === null) return;
    if (reason.trim().length < 10) {
      window.alert(T.application.rejectPrompt);
      return;
    }
    reject.mutate({ id, reason: reason.trim() });
  }

  if (isLoading) return <PageLoader />;
  if (isError || !data) return <ErrorCard />;
  if (data.items.length === 0) {
    return (
      <Card padding="lg">
        <EmptyState
          icon={Inbox}
          text={isPending ? T.empty.pending : T.empty.rejected}
        />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-sp-4">
      {data.items.map((app) => (
        <Card key={app.id} padding="lg" className="flex flex-col gap-sp-4">
          <div className="flex items-start justify-between gap-sp-3">
            <div className="flex items-center gap-sp-3">
              <Avatar
                size="md"
                ink
                src={app.applicant.avatarUrl ?? undefined}
                alt={app.applicant.name}
                initials={initialsOf(app.applicant.name)}
              />
              <div className="min-w-0">
                <p className="truncate text-t-16 font-bold text-ilm-ink">
                  {app.applicant.name}
                </p>
                <p className="truncate text-t-12 text-fg-3">
                  {app.applicant.email}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-t-12 text-fg-3">
              {formatShortDate(app.createdAt)}
            </span>
          </div>

          <div className="flex flex-col gap-sp-1">
            <h4 className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
              {T.application.expertise}
            </h4>
            <p className="text-t-14 text-ilm-ink">{app.expertise}</p>
          </div>

          <div className="flex flex-col gap-sp-1">
            <h4 className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
              {T.application.bio}
            </h4>
            <p className="whitespace-pre-line text-t-14 text-fg-2">{app.bio}</p>
          </div>

          {app.sampleWorkUrls.length > 0 && (
            <div className="flex flex-col gap-sp-1">
              <h4 className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
                {T.application.links}
              </h4>
              <div className="flex flex-col gap-sp-1">
                {app.sampleWorkUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-sp-1 text-t-14 text-ilm-info hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="truncate">{url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {!isPending && app.rejectedReason && (
            <div className="rounded-ilm-md bg-ilm-error-bg px-sp-3 py-sp-2">
              <p className="text-t-12 font-semibold text-ilm-error">
                {T.application.rejectedReason}
              </p>
              <p className="text-t-14 text-ilm-ink">{app.rejectedReason}</p>
            </div>
          )}

          {isPending && (
            <div className="flex items-center gap-sp-2">
              <Button
                size="sm"
                iconLeft={Check}
                disabled={approve.isPending || reject.isPending}
                onClick={() => approve.mutate(app.id)}
              >
                {T.application.approve}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                iconLeft={X}
                disabled={approve.isPending || reject.isPending}
                onClick={() => handleReject(app.id)}
              >
                {T.application.reject}
              </Button>
            </div>
          )}
        </Card>
      ))}

      <Pager page={data.meta.page} totalPages={data.meta.totalPages} onPage={setPage} />
    </div>
  );
}
