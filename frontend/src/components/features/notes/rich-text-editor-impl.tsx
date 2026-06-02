"use client";

import * as React from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Link2, List, ListOrdered } from "lucide-react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { NOTES_TEXT } from "@/features/notes/labels";

// Base schema shared by the editable and read-only editors so stored HTML
// round-trips identically. Kept to the "basic" set: bold, italic, lists, links.
const baseExtensions = [
  StarterKit.configure({
    heading: false,
    codeBlock: false,
    blockquote: false,
    horizontalRule: false,
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
  }),
];

interface RichTextEditorProps {
  initialContent: string;
  onChange: (html: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
}

export function RichTextEditor({
  initialContent,
  onChange,
  autoFocus,
  placeholder,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: placeholder
      ? [...baseExtensions, Placeholder.configure({ placeholder })]
      : baseExtensions,
    content: initialContent || "",
    immediatelyRender: false,
    autofocus: autoFocus ? "end" : false,
    editorProps: {
      attributes: {
        class:
          "ilm-prose min-h-[88px] w-full px-sp-3 py-sp-3 text-t-14 leading-relaxed text-fg-1 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="rounded-ilm-xl border border-ilm-border bg-ilm-paper transition-shadow focus-within:ring-1 focus-within:ring-ilm-ink">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

/** Read-only render of stored note HTML using the same schema (no raw innerHTML). */
export function NoteContent({ html }: { html: string }) {
  const editor = useEditor({
    extensions: baseExtensions,
    content: html,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "ilm-prose text-t-14 leading-relaxed text-fg-1" },
    },
  });

  React.useEffect(() => {
    if (editor && !editor.isDestroyed && html !== editor.getHTML()) {
      editor.commands.setContent(html, false);
    }
  }, [editor, html]);

  return <EditorContent editor={editor} />;
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(NOTES_TEXT.linkPrompt, previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  const items = [
    {
      key: "bold",
      icon: Bold,
      label: NOTES_TEXT.toolbarBold,
      active: editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      key: "italic",
      icon: Italic,
      label: NOTES_TEXT.toolbarItalic,
      active: editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      key: "bullet",
      icon: List,
      label: NOTES_TEXT.toolbarBullet,
      active: editor.isActive("bulletList"),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      key: "ordered",
      icon: ListOrdered,
      label: NOTES_TEXT.toolbarOrdered,
      active: editor.isActive("orderedList"),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      key: "link",
      icon: Link2,
      label: NOTES_TEXT.toolbarLink,
      active: editor.isActive("link"),
      run: setLink,
    },
  ];

  return (
    <div className="flex items-center gap-sp-1 border-b border-ilm-border px-sp-2 py-sp-1">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          aria-label={item.label}
          aria-pressed={item.active}
          title={item.label}
          onClick={item.run}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-ilm-md text-fg-2 transition-colors hover:bg-ilm-surface hover:text-ilm-ink",
            item.active && "bg-ilm-surface text-ilm-ink",
          )}
        >
          <Icon icon={item.icon} size={16} />
        </button>
      ))}
    </div>
  );
}
