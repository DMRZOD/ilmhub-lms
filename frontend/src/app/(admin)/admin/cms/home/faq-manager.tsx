"use client";

import * as React from "react";
import { HelpCircle, Pencil, Plus, Trash2 } from "lucide-react";

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
  useCreateFaq,
  useDeleteFaq,
  useFaqs,
  useUpdateFaq,
} from "@/features/admin/cms-hooks";
import type { Faq } from "@/features/admin/cms-schemas";
import { ADMIN_CMS_TEXT as T } from "@/features/admin/labels";

interface Draft {
  question: string;
  answer: string;
  sortOrder: number;
  published: boolean;
}

const EMPTY: Draft = { question: "", answer: "", sortOrder: 0, published: true };
const labelCls = "text-t-13 font-semibold text-ilm-ink";

export function FaqManager() {
  const { data, isLoading, isError } = useFaqs();
  const create = useCreateFaq();
  const update = useUpdateFaq();
  const del = useDeleteFaq();

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Faq | null>(null);
  const [draft, setDraft] = React.useState<Draft>(EMPTY);

  function startCreate() {
    setEditing(null);
    setDraft(EMPTY);
    setOpen(true);
  }

  function startEdit(f: Faq) {
    setEditing(f);
    setDraft({
      question: f.question,
      answer: f.answer,
      sortOrder: f.sortOrder,
      published: f.published,
    });
    setOpen(true);
  }

  async function save() {
    if (editing) await update.mutateAsync({ id: editing.id, body: draft });
    else await create.mutateAsync(draft);
    setOpen(false);
  }

  function handleDelete(f: Faq) {
    if (!window.confirm(T.common.confirmDelete)) return;
    del.mutate(f.id);
  }

  const items = data ?? [];
  const saving = create.isPending || update.isPending;
  const valid = draft.question.trim().length >= 4 && draft.answer.trim().length >= 2;

  return (
    <div className="flex flex-col gap-sp-4">
      <div className="flex items-center justify-between">
        <h3 className="text-t-16 font-bold text-ilm-ink">{T.home.faq}</h3>
        <Button size="sm" iconLeft={Plus} onClick={startCreate}>
          {T.home.addFaq}
        </Button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorCard />
      ) : items.length === 0 ? (
        <Card padding="lg">
          <EmptyState icon={HelpCircle} text="Savollar yo'q" />
        </Card>
      ) : (
        <div className="flex flex-col gap-sp-2">
          {items.map((f) => (
            <Card key={f.id} padding="md" className="flex items-start justify-between gap-sp-3">
              <div className="min-w-0">
                <p className="text-t-14 font-semibold text-ilm-ink">{f.question}</p>
                <p className="mt-sp-1 line-clamp-2 text-t-13 text-fg-2">{f.answer}</p>
              </div>
              <div className="flex flex-none items-center gap-sp-1">
                {!f.published && <Badge tone="warning">Yashirin</Badge>}
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={Pencil}
                  iconOnly
                  aria-label={T.common.edit}
                  onClick={() => startEdit(f)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  iconLeft={Trash2}
                  iconOnly
                  aria-label={T.common.delete}
                  disabled={del.isPending}
                  onClick={() => handleDelete(f)}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing ? T.common.edit : T.home.addFaq}</SheetTitle>
          </SheetHeader>
          <div className="mt-sp-5 flex flex-col gap-sp-4">
            <div className="flex flex-col gap-sp-1">
              <label className={labelCls}>{T.home.question}</label>
              <Input
                value={draft.question}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, question: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-sp-1">
              <label className={labelCls}>{T.home.answer}</label>
              <textarea
                value={draft.answer}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, answer: e.target.value }))
                }
                rows={4}
                className="min-h-[96px] w-full rounded-ilm-md bg-ilm-surface px-4 py-3 text-t-14 text-ilm-ink ring-1 ring-inset ring-transparent focus-visible:bg-ilm-paper focus-visible:outline-none focus-visible:ring-ilm-ink"
              />
            </div>
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
