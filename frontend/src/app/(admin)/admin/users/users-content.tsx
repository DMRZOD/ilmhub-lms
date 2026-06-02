"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BadgeCheck,
  GraduationCap,
  Mail,
  MoreVertical,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  EmptyState,
  ErrorCard,
  Pager,
  PageLoader,
} from "@/components/instructor-shell/page-states";
import { formatShortDate, formatUsd, initialsOf } from "@/lib/format";
import { adminUsersKeys } from "@/lib/query-keys";
import { useAuth } from "@/features/auth/hooks";
import {
  useAdminUser,
  useAdminUsers,
  useDeleteAdminUser,
  useEmailAdminUsers,
  useUpdateAdminUser,
} from "@/features/admin/hooks";
import { updateAdminUser } from "@/features/admin/api";
import type {
  AdminUserListItem,
  UserRole,
  UserStatus,
} from "@/features/admin/schemas";
import {
  ADMIN_USERS_TEXT as T,
  AUDIT_ACTION_LABELS,
  ORDER_STATUS_LABELS,
  ROLE_LABELS,
  STATUS_LABELS,
} from "@/features/admin/labels";

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function roleTone(role: UserRole): BadgeProps["tone"] {
  return role === "STUDENT" ? "neutral" : "info";
}

function statusTone(status: UserStatus): BadgeProps["tone"] {
  return status === "ACTIVE" ? "success" : "error";
}

export function UsersContent() {
  const qc = useQueryClient();
  const { data: me } = useAuth();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"ALL" | UserRole>("ALL");
  const [status, setStatus] = useState<"ALL" | UserStatus>("ALL");
  const [sort, setSort] = useState<"newest" | "oldest" | "name" | "lastLogin">(
    "newest",
  );
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [emailTargets, setEmailTargets] = useState<string[] | null>(null);
  const [bulkPending, setBulkPending] = useState(false);

  const q = useDebounced(search);
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();

  const params = useMemo(
    () => ({
      page,
      q: q || undefined,
      role: role === "ALL" ? undefined : role,
      status: status === "ALL" ? undefined : status,
      sort,
    }),
    [page, q, role, status, sort],
  );

  const { data, isLoading, isError } = useAdminUsers(params);

  useEffect(() => {
    setPage(1);
  }, [q, role, status, sort]);

  // Drop any selections that are no longer on the current page.
  useEffect(() => {
    if (!data) return;
    const visible = new Set(data.items.map((u) => u.id));
    setSelected((prev) => {
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [data]);

  const items = data?.items ?? [];
  const allSelected = items.length > 0 && items.every((u) => selected.has(u.id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(items.map((u) => u.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleRoleChange(user: AdminUserListItem) {
    const nextRole = user.role === "INSTRUCTOR" ? "STUDENT" : "INSTRUCTOR";
    updateUser.mutate({ id: user.id, body: { role: nextRole } });
  }

  function handleToggleStatus(user: AdminUserListItem) {
    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    updateUser.mutate({ id: user.id, body: { status: nextStatus } });
  }

  function handleDelete(user: AdminUserListItem) {
    if (!window.confirm(T.confirmDelete)) return;
    if (!window.confirm(T.confirmDeleteAgain)) return;
    deleteUser.mutate(user.id);
  }

  async function bulkSetStatus(nextStatus: UserStatus) {
    const ids = [...selected];
    if (ids.length === 0) return;
    setBulkPending(true);
    const results = await Promise.allSettled(
      ids.map((id) => updateAdminUser(id, { status: nextStatus })),
    );
    const ok = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - ok;
    await qc.invalidateQueries({ queryKey: adminUsersKeys.lists() });
    setBulkPending(false);
    setSelected(new Set());
    if (failed === 0) toast.success(`${ok} ta foydalanuvchi yangilandi`);
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

      <div className="flex flex-col gap-sp-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ilm-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={T.searchPlaceholder}
            className="pl-10"
          />
        </div>
        <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
          <SelectTrigger className="h-12 w-full rounded-ilm-md bg-ilm-surface px-4 text-t-14 font-medium lg:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{T.filters.allRoles}</SelectItem>
            <SelectItem value="STUDENT">{ROLE_LABELS.STUDENT}</SelectItem>
            <SelectItem value="INSTRUCTOR">{ROLE_LABELS.INSTRUCTOR}</SelectItem>
            <SelectItem value="ADMIN">{ROLE_LABELS.ADMIN}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as typeof status)}
        >
          <SelectTrigger className="h-12 w-full rounded-ilm-md bg-ilm-surface px-4 text-t-14 font-medium lg:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{T.filters.allStatuses}</SelectItem>
            <SelectItem value="ACTIVE">{STATUS_LABELS.ACTIVE}</SelectItem>
            <SelectItem value="SUSPENDED">{STATUS_LABELS.SUSPENDED}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="h-12 w-full rounded-ilm-md bg-ilm-surface px-4 text-t-14 font-medium lg:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{T.sort.newest}</SelectItem>
            <SelectItem value="oldest">{T.sort.oldest}</SelectItem>
            <SelectItem value="name">{T.sort.name}</SelectItem>
            <SelectItem value="lastLogin">{T.sort.lastLogin}</SelectItem>
          </SelectContent>
        </Select>
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
              iconLeft={ShieldOff}
              disabled={bulkPending}
              onClick={() => bulkSetStatus("SUSPENDED")}
            >
              {T.bulk.suspend}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={ShieldCheck}
              disabled={bulkPending}
              onClick={() => bulkSetStatus("ACTIVE")}
            >
              {T.bulk.unsuspend}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={Mail}
              disabled={bulkPending}
              onClick={() => setEmailTargets([...selected])}
            >
              {T.bulk.email}
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
          <EmptyState icon={Users} text={T.empty} />
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
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
                    {T.columns.user}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.role}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.status}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.courses}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.created}
                  </th>
                  <th className="px-sp-4 py-sp-3 font-semibold">
                    {T.columns.lastLogin}
                  </th>
                  <th className="px-sp-4 py-sp-3 text-right font-semibold">
                    {T.columns.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => {
                  const isSelf = me?.id === u.id;
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-ilm-border last:border-0 hover:bg-ilm-surface/60"
                    >
                      <td className="px-sp-4 py-sp-3">
                        <Checkbox
                          checked={selected.has(u.id)}
                          onCheckedChange={() => toggleOne(u.id)}
                          aria-label={`select-${u.id}`}
                        />
                      </td>
                      <td className="px-sp-4 py-sp-3">
                        <button
                          type="button"
                          onClick={() => setOpenUserId(u.id)}
                          className="flex items-center gap-sp-3 text-left"
                        >
                          <Avatar
                            size="sm"
                            ink
                            src={u.avatarUrl ?? undefined}
                            alt={u.name}
                            initials={initialsOf(u.name)}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-t-14 font-semibold text-ilm-ink">
                              {u.name}
                            </p>
                            <p className="truncate text-t-12 text-fg-3">
                              {u.email}
                            </p>
                          </div>
                        </button>
                      </td>
                      <td className="px-sp-4 py-sp-3">
                        <Badge tone={roleTone(u.role)}>
                          {ROLE_LABELS[u.role]}
                        </Badge>
                      </td>
                      <td className="px-sp-4 py-sp-3">
                        <Badge tone={statusTone(u.status)}>
                          {STATUS_LABELS[u.status]}
                        </Badge>
                      </td>
                      <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                        {u.coursesCount}
                      </td>
                      <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                        {formatShortDate(u.createdAt)}
                      </td>
                      <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                        {u.lastLoginAt ? formatShortDate(u.lastLoginAt) : "—"}
                      </td>
                      <td className="px-sp-4 py-sp-3">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                iconLeft={MoreVertical}
                                aria-label="actions"
                              />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem
                                onClick={() => setOpenUserId(u.id)}
                              >
                                <UserRound className="h-4 w-4" />
                                {T.actions.view}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setEmailTargets([u.id])}
                              >
                                <Mail className="h-4 w-4" />
                                {T.actions.email}
                              </DropdownMenuItem>
                              {u.role !== "ADMIN" && (
                                <DropdownMenuItem
                                  disabled={isSelf}
                                  onClick={() => handleRoleChange(u)}
                                >
                                  <GraduationCap className="h-4 w-4" />
                                  {u.role === "INSTRUCTOR"
                                    ? T.actions.makeStudent
                                    : T.actions.makeInstructor}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                disabled={isSelf}
                                onClick={() => handleToggleStatus(u)}
                              >
                                {u.status === "ACTIVE" ? (
                                  <ShieldOff className="h-4 w-4" />
                                ) : (
                                  <ShieldCheck className="h-4 w-4" />
                                )}
                                {u.status === "ACTIVE"
                                  ? T.actions.suspend
                                  : T.actions.unsuspend}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                disabled={isSelf}
                                className="text-ilm-error focus:text-ilm-error"
                                onClick={() => handleDelete(u)}
                              >
                                <Trash2 className="h-4 w-4" />
                                {T.actions.delete}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      <UserDetailSheet
        userId={openUserId}
        onClose={() => setOpenUserId(null)}
        onEmail={(id) => setEmailTargets([id])}
      />

      <EmailComposeSheet
        targets={emailTargets}
        onClose={() => setEmailTargets(null)}
      />
    </div>
  );
}

function UserDetailSheet({
  userId,
  onClose,
  onEmail,
}: {
  userId: string | null;
  onClose: () => void;
  onEmail: (id: string) => void;
}) {
  const { data, isLoading, isError } = useAdminUser(userId ?? undefined);

  return (
    <Sheet open={Boolean(userId)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {isLoading ? (
          <PageLoader />
        ) : isError || !data ? (
          <ErrorCard />
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center gap-sp-3">
                <Avatar
                  size="md"
                  ink
                  src={data.user.avatarUrl ?? undefined}
                  alt={data.user.name}
                  initials={initialsOf(data.user.name)}
                />
                <div className="min-w-0">
                  <SheetTitle className="truncate text-left">
                    {data.user.name}
                  </SheetTitle>
                  <SheetDescription className="truncate text-left">
                    {data.user.email}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="mt-sp-6 flex flex-col gap-sp-5">
              <div className="flex flex-wrap items-center gap-sp-2">
                <Badge tone={roleTone(data.user.role)}>
                  {ROLE_LABELS[data.user.role]}
                </Badge>
                <Badge tone={statusTone(data.user.status)}>
                  {STATUS_LABELS[data.user.status]}
                </Badge>
                {data.user.emailVerified ? (
                  <Badge tone="success" icon={BadgeCheck}>
                    {T.detail.verified}
                  </Badge>
                ) : (
                  <Badge tone="warning">{T.detail.notVerified}</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-sp-3 text-t-12 text-fg-3">
                <div>
                  {T.columns.created}: {formatShortDate(data.user.createdAt)}
                </div>
                <div>
                  {T.columns.lastLogin}:{" "}
                  {data.user.lastLoginAt
                    ? formatShortDate(data.user.lastLoginAt)
                    : "—"}
                </div>
              </div>

              <Button
                variant="secondary"
                iconLeft={Mail}
                onClick={() => userId && onEmail(userId)}
              >
                {T.actions.email}
              </Button>

              <Section title={`${T.detail.courses} (${data.courses.length})`}>
                {data.courses.length === 0 ? (
                  <p className="text-t-12 text-fg-3">{T.detail.noCourses}</p>
                ) : (
                  <div className="flex flex-col gap-sp-2">
                    {data.courses.map((c) => (
                      <div
                        key={c.course.id}
                        className="flex items-center justify-between gap-sp-2 rounded-ilm-md bg-ilm-surface px-sp-3 py-sp-2"
                      >
                        <span className="truncate text-t-14 text-ilm-ink">
                          {c.course.title}
                        </span>
                        <span className="shrink-0 text-t-12 text-fg-3">
                          {formatShortDate(c.enrolledAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title={`${T.detail.orders} (${data.orders.length})`}>
                {data.orders.length === 0 ? (
                  <p className="text-t-12 text-fg-3">{T.detail.noOrders}</p>
                ) : (
                  <div className="flex flex-col gap-sp-2">
                    {data.orders.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between gap-sp-2 rounded-ilm-md bg-ilm-surface px-sp-3 py-sp-2"
                      >
                        <div className="min-w-0">
                          <p className="text-t-14 font-semibold text-ilm-ink">
                            {formatUsd(o.totalUsdCents)}
                          </p>
                          <p className="truncate text-t-12 text-fg-3">
                            {o.items.map((it) => it.course.title).join(", ")}
                          </p>
                        </div>
                        <Badge
                          tone={o.status === "PAID" ? "success" : "neutral"}
                        >
                          {ORDER_STATUS_LABELS[o.status] ?? o.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title={T.detail.auditLog}>
                {data.auditLog.length === 0 ? (
                  <p className="text-t-12 text-fg-3">{T.detail.noAudit}</p>
                ) : (
                  <div className="flex flex-col gap-sp-2">
                    {data.auditLog.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start justify-between gap-sp-2 rounded-ilm-md bg-ilm-surface px-sp-3 py-sp-2"
                      >
                        <div className="min-w-0">
                          <p className="text-t-14 text-ilm-ink">
                            {AUDIT_ACTION_LABELS[entry.action] ?? entry.action}
                          </p>
                          {entry.actor && (
                            <p className="truncate text-t-12 text-fg-3">
                              {entry.actor.name}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-t-12 text-fg-3">
                          {formatShortDate(entry.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-sp-2">
      <h4 className="text-t-14 font-bold text-ilm-ink">{title}</h4>
      {children}
    </div>
  );
}

function EmailComposeSheet({
  targets,
  onClose,
}: {
  targets: string[] | null;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const emailUsers = useEmailAdminUsers();

  useEffect(() => {
    if (targets) {
      setSubject("");
      setBody("");
    }
  }, [targets]);

  function handleSend() {
    if (!targets || !subject.trim() || !body.trim()) return;
    emailUsers.mutate(
      { userIds: targets, subject: subject.trim(), body: body.trim() },
      { onSuccess: () => onClose() },
    );
  }

  return (
    <Sheet open={Boolean(targets)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-left">{T.emailForm.title}</SheetTitle>
          <SheetDescription className="text-left">
            {T.emailForm.recipients(targets?.length ?? 0)}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-sp-6 flex flex-col gap-sp-4">
          <div className="flex flex-col gap-sp-2">
            <label className="text-t-12 font-semibold text-fg-2">
              {T.emailForm.subject}
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="flex flex-col gap-sp-2">
            <label className="text-t-12 font-semibold text-fg-2">
              {T.emailForm.body}
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              maxLength={5000}
              className="w-full rounded-ilm-md bg-ilm-surface px-4 py-3 text-t-14 font-medium text-ilm-ink ring-1 ring-inset ring-transparent transition-[box-shadow,background-color] duration-base ease-ilm-out placeholder:text-ilm-muted focus-visible:bg-ilm-paper focus-visible:outline-none focus-visible:ring-ilm-ink"
            />
          </div>
          <Button
            iconLeft={Mail}
            disabled={
              emailUsers.isPending || !subject.trim() || !body.trim()
            }
            onClick={handleSend}
          >
            {T.emailForm.send}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
