"use client";

import * as React from "react";
import { Award, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  EmptyState,
  ErrorCard,
  PageLoader,
} from "@/components/instructor-shell/page-states";
import {
  useAchievements,
  useCreateAchievement,
  useDeleteAchievement,
  useUpdateAchievement,
} from "@/features/admin/cms-hooks";
import type { Achievement } from "@/features/admin/cms-schemas";
import { ADMIN_CMS_TEXT as T } from "@/features/admin/labels";

interface Draft {
  code: string;
  title: string;
  description: string;
  iconName: string;
  criteria: string; // raw JSON text
}

const EMPTY: Draft = { code: "", title: "", description: "", iconName: "", criteria: "" };
const labelCls = "text-t-13 font-semibold text-ilm-ink";
const areaCls =
  "min-h-[88px] w-full rounded-ilm-md bg-ilm-surface px-4 py-3 font-mono text-t-13 text-ilm-ink ring-1 ring-inset ring-transparent focus-visible:bg-ilm-paper focus-visible:outline-none focus-visible:ring-ilm-ink";

export function AchievementsContent() {
  const { data, isLoading, isError } = useAchievements();
  const create = useCreateAchievement();
  const update = useUpdateAchievement();
  const del = useDeleteAchievement();

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Achievement | null>(null);
  const [draft, setDraft] = React.useState<Draft>(EMPTY);

  function startCreate() {
    setEditing(null);
    setDraft(EMPTY);
    setOpen(true);
  }

  function startEdit(a: Achievement) {
    setEditing(a);
    setDraft({
      code: a.code,
      title: a.title,
      description: a.description,
      iconName: a.iconName ?? "",
      criteria:
        a.criteria == null ? "" : JSON.stringify(a.criteria, null, 2),
    });
    setOpen(true);
  }

  async function save() {
    let criteria: Record<string, unknown> | undefined;
    if (draft.criteria.trim()) {
      try {
        criteria = JSON.parse(draft.criteria) as Record<string, unknown>;
      } catch {
        toast.error(T.achievements.invalidJson);
        return;
      }
    }
    const body = {
      code: draft.code,
      title: draft.title,
      description: draft.description,
      iconName: draft.iconName,
      criteria,
    };
    if (editing) await update.mutateAsync({ id: editing.id, body });
    else await create.mutateAsync(body);
    setOpen(false);
  }

  function handleDelete(a: Achievement) {
    if (!window.confirm(T.common.confirmDelete)) return;
    del.mutate(a.id);
  }

  const items = data ?? [];
  const saving = create.isPending || update.isPending;
  const valid =
    draft.code.trim().length >= 2 &&
    draft.title.trim().length >= 2 &&
    draft.description.trim().length >= 2;

  return (
    <div className="flex flex-col gap-sp-4">
      <div className="flex items-center justify-between">
        <h2 className="text-t-18 font-bold text-ilm-ink">{T.achievements.title}</h2>
        <Button size="sm" iconLeft={Plus} onClick={startCreate}>
          {T.achievements.add}
        </Button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorCard />
      ) : items.length === 0 ? (
        <Card padding="lg">
          <EmptyState icon={Award} text={T.achievements.empty} />
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ilm-border text-t-12 uppercase tracking-ilm-wide text-fg-3">
                  <th className="px-sp-4 py-sp-3 font-semibold">{T.achievements.code}</th>
                  <th className="px-sp-4 py-sp-3 font-semibold">{T.achievements.achTitle}</th>
                  <th className="px-sp-4 py-sp-3 font-semibold">{T.common.icon}</th>
                  <th className="px-sp-4 py-sp-3 text-right font-semibold">{" "}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-ilm-border last:border-0 hover:bg-ilm-surface/60"
                  >
                    <td className="px-sp-4 py-sp-3">
                      <code className="text-t-12 text-fg-2">{a.code}</code>
                    </td>
                    <td className="px-sp-4 py-sp-3">
                      <p className="text-t-14 font-semibold text-ilm-ink">{a.title}</p>
                      <p className="truncate text-t-12 text-fg-3">{a.description}</p>
                    </td>
                    <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                      {a.iconName ?? "—"}
                    </td>
                    <td className="px-sp-4 py-sp-3">
                      <div className="flex justify-end gap-sp-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          iconLeft={Pencil}
                          iconOnly
                          aria-label={T.common.edit}
                          onClick={() => startEdit(a)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          iconLeft={Trash2}
                          iconOnly
                          aria-label={T.common.delete}
                          disabled={del.isPending}
                          onClick={() => handleDelete(a)}
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

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing ? T.common.edit : T.achievements.add}</SheetTitle>
          </SheetHeader>
          <div className="mt-sp-5 flex flex-col gap-sp-4">
            <Field label={T.achievements.code}>
              <Input
                value={draft.code}
                onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
                placeholder="FIRST_ENROLLMENT"
              />
            </Field>
            <Field label={T.achievements.achTitle}>
              <Input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              />
            </Field>
            <Field label={T.common.description}>
              <Input
                value={draft.description}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
              />
            </Field>
            <Field label={T.common.icon}>
              <Input
                value={draft.iconName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, iconName: e.target.value }))
                }
                placeholder="Trophy"
              />
            </Field>
            <Field label={T.achievements.criteria}>
              <textarea
                value={draft.criteria}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, criteria: e.target.value }))
                }
                placeholder={T.achievements.criteriaHint}
                rows={4}
                className={areaCls}
              />
            </Field>
            <div className="flex justify-end gap-sp-2 pt-sp-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                {T.common.cancel}
              </Button>
              <Button onClick={save} disabled={saving || !valid}>
                {T.common.save}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-sp-1">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}
