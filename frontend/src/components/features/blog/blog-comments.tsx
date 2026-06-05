"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MessageSquare, Trash2 } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks";
import {
  useBlogComments,
  useCreateBlogComment,
  useDeleteBlogComment,
} from "@/features/blog/hooks";
import type { BlogComment, BlogCommentReply } from "@/features/blog/schemas";
import { initialsOf } from "@/lib/format";

const TEXTAREA_CLASS =
  "w-full resize-none rounded-ilm-md bg-ilm-surface px-4 py-3 text-t-14 font-medium text-ilm-ink ring-1 ring-inset ring-transparent transition-[box-shadow,background-color] duration-base ease-ilm-out placeholder:text-ilm-muted focus-visible:bg-ilm-paper focus-visible:outline-none focus-visible:ring-ilm-ink";

function relativeTime(iso: string): string {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "hozir";
  if (diffMin < 60) return `${diffMin} daq oldin`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} kun oldin`;
  return new Date(iso).toLocaleDateString("uz-UZ");
}

export function BlogComments({ slug }: { slug: string }) {
  const { data: viewer } = useAuth();
  const commentsQuery = useBlogComments(slug);
  const create = useCreateBlogComment(slug);
  const del = useDeleteBlogComment(slug);
  const [text, setText] = useState("");

  const comments = commentsQuery.data ?? [];
  const count = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  function submitTop() {
    const body = text.trim();
    if (!body || create.isPending) return;
    create.mutate({ body }, { onSuccess: () => setText("") });
  }

  function canDelete(authorId: string): boolean {
    return Boolean(viewer && (viewer.id === authorId || viewer.role === "ADMIN"));
  }

  return (
    <section id="izohlar" className="mt-sp-12 flex flex-col gap-sp-6">
      <h2 className="flex items-center gap-sp-2 text-t-24 font-extrabold text-ilm-ink">
        <MessageSquare className="h-6 w-6" />
        Izohlar ({count})
      </h2>

      {viewer ? (
        <div className="flex flex-col gap-sp-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 2000))}
            rows={3}
            placeholder="Fikringizni yozing..."
            className={TEXTAREA_CLASS}
          />
          <Button
            variant="primary"
            size="md"
            className="self-start"
            onClick={submitTop}
            disabled={!text.trim() || create.isPending}
          >
            Yuborish
          </Button>
        </div>
      ) : (
        <Card padding="md" className="flex flex-wrap items-center justify-between gap-sp-3">
          <span className="text-t-14 text-fg-2">
            Izoh qoldirish uchun tizimga kiring.
          </span>
          <Button asChild variant="primary" size="sm">
            <Link href={`/login?from=/blog/${slug}`}>Kirish</Link>
          </Button>
        </Card>
      )}

      {commentsQuery.isPending ? (
        <div className="flex justify-center py-sp-8">
          <Loader2 className="h-6 w-6 animate-spin text-fg-3" />
        </div>
      ) : comments.length === 0 ? (
        <p className="py-sp-6 text-center text-t-14 text-fg-3">
          Hali izoh yo&apos;q. Birinchi bo&apos;lib fikr bildiring.
        </p>
      ) : (
        <ul className="flex flex-col gap-sp-6">
          {comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              canReply={Boolean(viewer)}
              canDelete={canDelete}
              onReply={(body, parentId) => create.mutate({ body, parentId })}
              onDelete={(id) => del.mutate(id)}
              replyPending={create.isPending}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function CommentRow({
  comment,
  canDelete,
  onDelete,
  onReplyClick,
}: {
  comment: BlogCommentReply;
  canDelete: boolean;
  onDelete: () => void;
  onReplyClick?: () => void;
}) {
  return (
    <div className="flex gap-sp-3">
      <Avatar
        size="sm"
        src={comment.user.avatarUrl ?? undefined}
        alt={comment.user.name}
        initials={initialsOf(comment.user.name)}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-sp-2">
          <span className="text-t-14 font-semibold text-ilm-ink">
            {comment.user.name}
          </span>
          <span className="text-t-12 text-fg-3">
            {relativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="whitespace-pre-line text-t-14 text-fg-1">{comment.body}</p>
        <div className="flex items-center gap-sp-3">
          {onReplyClick && (
            <button
              type="button"
              onClick={onReplyClick}
              className="text-t-12 font-medium text-fg-3 transition-colors hover:text-ilm-ink"
            >
              Javob berish
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1 text-t-12 font-medium text-fg-3 transition-colors hover:text-ilm-error"
            >
              <Trash2 className="h-3.5 w-3.5" />
              O&apos;chirish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentThread({
  comment,
  canReply,
  canDelete,
  onReply,
  onDelete,
  replyPending,
}: {
  comment: BlogComment;
  canReply: boolean;
  canDelete: (authorId: string) => boolean;
  onReply: (body: string, parentId: string) => void;
  onDelete: (id: string) => void;
  replyPending: boolean;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  function submitReply() {
    const body = replyText.trim();
    if (!body || replyPending) return;
    onReply(body, comment.id);
    setReplyText("");
    setReplyOpen(false);
  }

  return (
    <li className="flex flex-col gap-sp-3">
      <CommentRow
        comment={comment}
        canDelete={canDelete(comment.user.id)}
        onDelete={() => onDelete(comment.id)}
        onReplyClick={canReply ? () => setReplyOpen((v) => !v) : undefined}
      />

      {replyOpen && (
        <div className="ml-[2.75rem] flex flex-col gap-sp-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value.slice(0, 2000))}
            rows={2}
            placeholder="Javobingizni yozing..."
            className={TEXTAREA_CLASS}
          />
          <div className="flex gap-sp-2">
            <Button
              variant="primary"
              size="sm"
              onClick={submitReply}
              disabled={!replyText.trim() || replyPending}
            >
              Javob berish
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyOpen(false)}
            >
              Bekor qilish
            </Button>
          </div>
        </div>
      )}

      {comment.replies.length > 0 && (
        <ul className="ml-[2.75rem] flex flex-col gap-sp-4 border-l border-ilm-border pl-sp-4">
          {comment.replies.map((reply) => (
            <li key={reply.id}>
              <CommentRow
                comment={reply}
                canDelete={canDelete(reply.user.id)}
                onDelete={() => onDelete(reply.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
