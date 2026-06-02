"use client";

import * as React from "react";
import { LayoutGrid, Pencil, Plus, Trash2 } from "lucide-react";

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
  useCmsCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/features/admin/cms-hooks";
import type { Category } from "@/features/admin/cms-schemas";
import { ADMIN_CMS_TEXT as T } from "@/features/admin/labels";

interface Draft {
  name: string;
  slug: string;
  description: string;
  iconName: string;
  sortOrder: number;
}

const EMPTY: Draft = { name: "", slug: "", description: "", iconName: "", sortOrder: 0 };
const labelCls = "text-t-13 font-semibold text-ilm-ink";

export function CategoriesContent() {
  const { data, isLoading, isError } = useCmsCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del = useDeleteCategory();

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [draft, setDraft] = React.useState<Draft>(EMPTY);

  function startCreate() {
    setEditing(null);
    setDraft(EMPTY);
    setOpen(true);
  }

  function startEdit(c: Category) {
    setEditing(c);
    setDraft({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      iconName: c.iconName ?? "",
      sortOrder: c.sortOrder,
    });
    setOpen(true);
  }

  async function save() {
    const body = {
      name: draft.name,
      slug: draft.slug || undefined,
      description: draft.description,
      iconName: draft.iconName,
      sortOrder: draft.sortOrder,
    };
    if (editing) await update.mutateAsync({ id: editing.id, body });
    else await create.mutateAsync(body);
    setOpen(false);
  }

  function handleDelete(c: Category) {
    if (!window.confirm(T.common.confirmDelete)) return;
    del.mutate(c.id);
  }

  const items = data ?? [];
  const saving = create.isPending || update.isPending;

  return (
    <div className="flex flex-col gap-sp-4">
      <div className="flex items-center justify-between">
        <h2 className="text-t-18 font-bold text-ilm-ink">{T.categories.title}</h2>
        <Button size="sm" iconLeft={Plus} onClick={startCreate}>
          {T.categories.add}
        </Button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorCard />
      ) : items.length === 0 ? (
        <Card padding="lg">
          <EmptyState icon={LayoutGrid} text={T.categories.empty} />
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ilm-border text-t-12 uppercase tracking-ilm-wide text-fg-3">
                  <th className="px-sp-4 py-sp-3 font-semibold">{T.common.name}</th>
                  <th className="px-sp-4 py-sp-3 font-semibold">{T.common.slug}</th>
                  <th className="px-sp-4 py-sp-3 font-semibold">{T.common.icon}</th>
                  <th className="px-sp-4 py-sp-3 font-semibold">{T.categories.courses}</th>
                  <th className="px-sp-4 py-sp-3 font-semibold">{T.common.sortOrder}</th>
                  <th className="px-sp-4 py-sp-3 text-right font-semibold">{" "}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-ilm-border last:border-0 hover:bg-ilm-surface/60"
                  >
                    <td className="px-sp-4 py-sp-3 text-t-14 font-semibold text-ilm-ink">
                      {c.name}
                    </td>
                    <td className="px-sp-4 py-sp-3 text-t-12 text-fg-3">{c.slug}</td>
                    <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                      {c.iconName ?? "—"}
                    </td>
                    <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                      {c.coursesCount}
                    </td>
                    <td className="px-sp-4 py-sp-3 text-t-14 text-fg-2">
                      {c.sortOrder}
                    </td>
                    <td className="px-sp-4 py-sp-3">
                      <div className="flex justify-end gap-sp-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          iconLeft={Pencil}
                          iconOnly
                          aria-label={T.common.edit}
                          onClick={() => startEdit(c)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          iconLeft={Trash2}
                          iconOnly
                          aria-label={T.common.delete}
                          disabled={del.isPending}
                          onClick={() => handleDelete(c)}
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
            <SheetTitle>{editing ? T.common.edit : T.categories.add}</SheetTitle>
          </SheetHeader>
          <div className="mt-sp-5 flex flex-col gap-sp-4">
            <Labeled label={T.common.name}>
              <Input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </Labeled>
            <Labeled label={T.common.slug}>
              <Input
                value={draft.slug}
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                placeholder="auto"
              />
            </Labeled>
            <Labeled label={T.common.icon}>
              <Input
                value={draft.iconName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, iconName: e.target.value }))
                }
                placeholder="Code"
              />
            </Labeled>
            <Labeled label={T.common.description}>
              <Input
                value={draft.description}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
              />
            </Labeled>
            <Labeled label={T.common.sortOrder}>
              <Input
                type="number"
                value={draft.sortOrder}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, sortOrder: Number(e.target.value) || 0 }))
                }
              />
            </Labeled>
            <div className="flex justify-end gap-sp-2 pt-sp-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                {T.common.cancel}
              </Button>
              <Button onClick={save} disabled={saving || draft.name.trim().length < 2}>
                {T.common.save}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Labeled({
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
