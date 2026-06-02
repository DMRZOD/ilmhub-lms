"use client";

import dynamic from "next/dynamic";

// Tiptap is heavy (~prosemirror + extensions). Load it client-only and lazily
// so it stays out of the route's initial JS until an editor/renderer actually
// mounts. Public API (RichTextEditor, NoteContent) is preserved for consumers.

const editorFallback = (
  <div className="min-h-[120px] rounded-ilm-xl border border-ilm-border bg-ilm-paper" />
);

export const RichTextEditor = dynamic(
  () => import("./rich-text-editor-impl").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => editorFallback,
  },
);

export const NoteContent = dynamic(
  () => import("./rich-text-editor-impl").then((m) => m.NoteContent),
  {
    ssr: false,
    loading: () => (
      <div className="h-4 w-2/3 animate-pulse rounded bg-ilm-surface" />
    ),
  },
);
