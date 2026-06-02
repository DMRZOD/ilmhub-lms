"use client";

import * as React from "react";
import { MessageSquareQuote, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  useCreateTestimonial,
  useDeleteTestimonial,
  useTestimonials,
  useUpdateTestimonial,
} from "@/features/admin/cms-hooks";
import type { Testimonial } from "@/features/admin/cms-schemas";
import { ADMIN_CMS_TEXT as T } from "@/features/admin/labels";

interface Draft {
  studentName: string;
  studentRole: string;
  courseName: string;
  studentAvatar: string;
  rating: number;
  text: string;
  sortOrder: number;
  published: boolean;
}

const EMPTY: Draft = {
  studentName: "",
  studentRole: "",
  courseName: "",
  studentAvatar: "",
  rating: 5,
  text: "",
  sortOrder: 0,
  published: true,
};
const labelCls = "text-t-13 font-semibold text-ilm-ink";

export function TestimonialsManager() {
  const { data, isLoading, isError } = useTestimonials();
  const create = useCreateTestimonial();
  const update = useUpdateTestimonial();
  const del = useDeleteTestimonial();

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Testimonial | null>(null);
  const [draft, setDraft] = React.useState<Draft>(EMPTY);

  function startCreate() {
    setEditing(null);
    setDraft(EMPTY);
    setOpen(true);
  }

  function startEdit(t: Testimonial) {
    setEditing(t);
    setDraft({
      studentName: t.studentName,
      studentRole: t.studentRole ?? "",
      courseName: t.courseName ?? "",
      studentAvatar: t.studentAvatar ?? "",
      rating: t.rating,
      text: t.text,
      sortOrder: t.sortOrder,
      published: t.published,
    });
    setOpen(true);
  }

  async function save() {
    if (editing) await update.mutateAsync({ id: editing.id, body: draft });
    else await create.mutateAsync(draft);
    setOpen(false);
  }

  function handleDelete(t: Testimonial) {
    if (!window.confirm(T.common.confirmDelete)) return;
    del.mutate(t.id);
  }

  const items = data ?? [];
  const saving = create.isPending || update.isPending;
  const valid = draft.studentName.trim().length >= 2 && draft.text.trim().length >= 2;

  return (
    <div className="flex flex-col gap-sp-4">
      <div className="flex items-center justify-between">
        <h3 className="text-t-16 font-bold text-ilm-ink">{T.home.testimonials}</h3>
        <Button size="sm" iconLeft={Plus} onClick={startCreate}>
          {T.home.addTestimonial}
        </Button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorCard />
      ) : items.length === 0 ? (
        <Card padding="lg">
          <EmptyState icon={MessageSquareQuote} text="Sharhlar yo'q" />
        </Card>
      ) : (
        <div className="grid gap-sp-3 md:grid-cols-2">
          {items.map((t) => (
            <Card key={t.id} padding="md" className="flex flex-col gap-sp-2">
              <div className="flex items-start justify-between gap-sp-2">
                <div>
                  <p className="text-t-14 font-semibold text-ilm-ink">
                    {t.studentName}
                  </p>
                  <p className="text-t-12 text-fg-3">{t.studentRole}</p>
                </div>
                <div className="flex items-center gap-sp-1">
                  {!t.published && <Badge tone="warning">Yashirin</Badge>}
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft={Pencil}
                    iconOnly
                    aria-label={T.common.edit}
                    onClick={() => startEdit(t)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    iconLeft={Trash2}
                    iconOnly
                    aria-label={T.common.delete}
                    disabled={del.isPending}
                    onClick={() => handleDelete(t)}
                  />
                </div>
              </div>
              <p className="line-clamp-3 text-t-13 text-fg-2">{t.text}</p>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editing ? T.common.edit : T.home.addTestimonial}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-sp-5 flex flex-col gap-sp-4">
            <Field label={T.home.studentName}>
              <Input
                value={draft.studentName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, studentName: e.target.value }))
                }
              />
            </Field>
            <Field label={T.home.studentRole}>
              <Input
                value={draft.studentRole}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, studentRole: e.target.value }))
                }
              />
            </Field>
            <Field label={T.home.courseName}>
              <Input
                value={draft.courseName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, courseName: e.target.value }))
                }
              />
            </Field>
            <Field label={T.home.avatar}>
              <Input
                value={draft.studentAvatar}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, studentAvatar: e.target.value }))
                }
                placeholder="https://…"
              />
            </Field>
            <Field label={T.home.rating}>
              <Input
                type="number"
                min={1}
                max={5}
                value={draft.rating}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    rating: Math.min(5, Math.max(1, Number(e.target.value) || 1)),
                  }))
                }
              />
            </Field>
            <Field label={T.home.testimonialText}>
              <textarea
                value={draft.text}
                onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
                rows={4}
                className="min-h-[96px] w-full rounded-ilm-md bg-ilm-surface px-4 py-3 text-t-14 text-ilm-ink ring-1 ring-inset ring-transparent focus-visible:bg-ilm-paper focus-visible:outline-none focus-visible:ring-ilm-ink"
              />
            </Field>
            <label className="flex items-center gap-sp-2 text-t-14 text-ilm-ink">
              <Checkbox
                checked={draft.published}
                onCheckedChange={(v) =>
                  setDraft((d) => ({ ...d, published: Boolean(v) }))
                }
              />
              {T.common.published}
            </label>
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
