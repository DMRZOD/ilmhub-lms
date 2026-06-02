"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Eye,
  Loader2,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PageLoader } from "@/components/instructor-shell/page-states";
import { BlogContent, BlogEditor } from "@/components/features/blog-editor/blog-editor";
import { uploadCourseImage } from "@/features/course-wizard/api";
import {
  useBlogCategories,
  useBlogPost,
  useCreateBlogPost,
  useDeleteBlogPost,
  useUpdateBlogPost,
} from "@/features/admin/cms-hooks";
import type { BlogPostInput } from "@/features/admin/cms-api";
import type { BlogStatus } from "@/features/admin/cms-schemas";
import { ADMIN_BLOG_TEXT as T } from "@/features/admin/labels";

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  categoryId: string;
  tags: string[];
  content: string;
  status: BlogStatus;
}

const EMPTY: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  coverImageUrl: "",
  categoryId: "",
  tags: [],
  content: "",
  status: "DRAFT",
};

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function toPayload(f: FormState): BlogPostInput {
  return {
    title: f.title,
    slug: f.slug,
    excerpt: f.excerpt,
    content: f.content,
    coverImageUrl: f.coverImageUrl,
    categoryId: f.categoryId, // "" → disconnect on the backend
    tags: f.tags,
    status: f.status,
  };
}

const labelCls = "text-t-13 font-semibold text-ilm-ink";
const fieldCls =
  "min-h-[88px] w-full rounded-ilm-md bg-ilm-surface px-4 py-3 text-t-14 font-medium text-ilm-ink ring-1 ring-inset ring-transparent focus-visible:bg-ilm-paper focus-visible:outline-none focus-visible:ring-ilm-ink";

export function BlogEditorForm({ postId }: { postId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(postId);

  const { data: post, isLoading } = useBlogPost(postId);
  const { data: categories } = useBlogCategories();
  const create = useCreateBlogPost();
  const update = useUpdateBlogPost();
  const del = useDeleteBlogPost();

  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [tagDraft, setTagDraft] = React.useState("");
  const [coverUploading, setCoverUploading] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const loadedRef = React.useRef<string>("");

  // Hydrate the form once the post is fetched (edit mode).
  React.useEffect(() => {
    if (!post) return;
    const next: FormState = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      coverImageUrl: post.coverImageUrl ?? "",
      categoryId: post.category?.id ?? "",
      tags: post.tags,
      content: post.content,
      status: post.status,
    };
    setForm(next);
    loadedRef.current = JSON.stringify(next);
    setSlugTouched(true);
  }, [post]);

  const serialized = JSON.stringify(form);

  // Debounced autosave (edit mode only — needs an id to PATCH).
  React.useEffect(() => {
    if (!isEdit || !postId) return;
    if (serialized === loadedRef.current) return;
    const handle = setTimeout(() => {
      update
        .mutateAsync({ id: postId, body: toPayload(form) })
        .then(() => {
          loadedRef.current = serialized;
          setSavedAt(Date.now());
        })
        .catch(() => undefined);
    }, 1200);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized, isEdit, postId]);

  function setTitle(value: string) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: slugTouched ? f.slug : slugify(value),
    }));
  }

  function addTag() {
    const t = tagDraft.trim();
    setTagDraft("");
    if (!t) return;
    setForm((f) =>
      f.tags.includes(t) || f.tags.length >= 20
        ? f
        : { ...f, tags: [...f.tags, t] },
    );
  }

  function removeTag(t: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));
  }

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCoverUploading(true);
    try {
      const { url } = await uploadCourseImage(file);
      setForm((f) => ({ ...f, coverImageUrl: url }));
    } catch {
      toast.error("Rasmni yuklab bo'lmadi");
    } finally {
      setCoverUploading(false);
    }
  }

  async function saveDraft() {
    if (form.title.trim().length < 2) {
      toast.error(T.editor.titleRequired);
      return;
    }
    const created = await create.mutateAsync(toPayload(form));
    toast.success(T.editor.saved);
    router.replace(`/admin/blog/${created.id}/edit`);
  }

  async function togglePublish() {
    if (!postId) return;
    const nextStatus: BlogStatus =
      form.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const nextForm = { ...form, status: nextStatus };
    setForm(nextForm);
    await update.mutateAsync({ id: postId, body: toPayload(nextForm) });
    loadedRef.current = JSON.stringify(nextForm);
    setSavedAt(Date.now());
    toast.success(
      nextStatus === "PUBLISHED" ? "Nashr etildi" : "Qoralamaga olindi",
    );
  }

  function handleDelete() {
    if (!postId) return;
    if (!window.confirm(T.editor.confirmDelete)) return;
    del.mutate(postId, { onSuccess: () => router.replace("/admin/blog") });
  }

  if (isEdit && isLoading) return <PageLoader />;

  const saveIndicator = update.isPending
    ? T.editor.saving
    : savedAt
      ? T.editor.autosaved
      : null;

  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-wrap items-center justify-between gap-sp-3">
        <div className="flex items-center gap-sp-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/blog">
              <Icon icon={ArrowLeft} size={14} />
              {T.editor.back}
            </Link>
          </Button>
          <Badge tone={form.status === "PUBLISHED" ? "success" : "warning"}>
            {T.status[form.status]}
          </Badge>
          {saveIndicator && (
            <span className="flex items-center gap-sp-1 text-t-12 text-fg-3">
              {update.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3 text-ilm-success" />
              )}
              {saveIndicator}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-sp-2">
          <Button
            variant="secondary"
            size="sm"
            iconLeft={Eye}
            onClick={() => setPreviewOpen(true)}
          >
            {T.editor.preview}
          </Button>
          {isEdit ? (
            <>
              <Button size="sm" onClick={togglePublish} disabled={update.isPending}>
                {form.status === "PUBLISHED"
                  ? T.editor.unpublish
                  : T.editor.publish}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconLeft={Trash2}
                disabled={del.isPending}
                onClick={handleDelete}
              >
                {T.editor.delete}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              iconLeft={Save}
              onClick={saveDraft}
              disabled={create.isPending}
            >
              {T.editor.save}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-sp-6 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="flex flex-col gap-sp-4">
          <div className="flex flex-col gap-sp-1">
            <label className={labelCls}>{T.editor.fields.title}</label>
            <Input
              value={form.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={T.editor.fields.title}
            />
          </div>

          <div className="flex flex-col gap-sp-1">
            <label className={labelCls}>{T.editor.fields.slug}</label>
            <Input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
              }}
              placeholder="post-slug"
            />
          </div>

          <div className="flex flex-col gap-sp-1">
            <label className={labelCls}>{T.editor.fields.excerpt}</label>
            <textarea
              value={form.excerpt}
              onChange={(e) =>
                setForm((f) => ({ ...f, excerpt: e.target.value }))
              }
              placeholder={T.editor.fields.excerpt}
              rows={2}
              className={fieldCls}
            />
          </div>

          <div className="flex flex-col gap-sp-1">
            <label className={labelCls}>{T.editor.fields.content}</label>
            <BlogEditor
              value={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-sp-4">
          <Card padding="md" className="flex flex-col gap-sp-3">
            <label className={labelCls}>{T.editor.fields.cover}</label>
            {form.coverImageUrl ? (
              <div className="overflow-hidden rounded-ilm-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.coverImageUrl}
                  alt=""
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            ) : (
              <div className="grid aspect-[16/9] w-full place-items-center rounded-ilm-md bg-ilm-surface text-t-12 text-fg-3">
                {T.editor.fields.cover}
              </div>
            )}
            <div className="flex items-center gap-sp-2">
              <label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onCover}
                />
                <span className="inline-flex h-9 cursor-pointer items-center gap-sp-1 rounded-ilm-md bg-ilm-paper px-3.5 text-t-14 font-semibold text-ilm-ink ring-1 ring-inset ring-ilm-ink hover:bg-ilm-surface">
                  {coverUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {form.coverImageUrl ? T.editor.changeCover : T.editor.uploadCover}
                </span>
              </label>
              {form.coverImageUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setForm((f) => ({ ...f, coverImageUrl: "" }))}
                >
                  {T.editor.removeCover}
                </Button>
              )}
            </div>
          </Card>

          <Card padding="md" className="flex flex-col gap-sp-3">
            <div className="flex flex-col gap-sp-1">
              <label className={labelCls}>{T.editor.fields.category}</label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoryId: e.target.value }))
                }
                className="h-11 rounded-ilm-md bg-ilm-surface px-3 text-t-14 font-medium text-ilm-ink ring-1 ring-inset ring-transparent focus-visible:bg-ilm-paper focus-visible:outline-none focus-visible:ring-ilm-ink"
              >
                <option value="">{T.editor.fields.noCategory}</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-sp-1">
              <label className={labelCls}>{T.editor.fields.tags}</label>
              <Input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder={T.editor.tagsPlaceholder}
                className="h-10"
              />
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-sp-1 pt-sp-1">
                  {form.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-ilm-full bg-ilm-surface px-2.5 py-1 text-t-12 font-medium text-ilm-ink"
                    >
                      {t}
                      <button
                        type="button"
                        aria-label="O'chirish"
                        onClick={() => removeTag(t)}
                        className="text-fg-3 hover:text-ilm-error"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle>{T.editor.previewTitle}</SheetTitle>
          </SheetHeader>
          <div className="mt-sp-4 flex flex-col gap-sp-4">
            {form.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.coverImageUrl}
                alt=""
                className="aspect-[16/9] w-full rounded-ilm-md object-cover"
              />
            )}
            <h1 className="text-t-28 font-extrabold tracking-ilm-tight text-ilm-ink">
              {form.title || "—"}
            </h1>
            {form.excerpt && (
              <p className="text-t-16 text-fg-2">{form.excerpt}</p>
            )}
            <BlogContent html={form.content} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
