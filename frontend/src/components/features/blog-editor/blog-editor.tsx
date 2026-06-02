"use client";

import * as React from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Video as YoutubeIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { uploadCourseImage } from "@/features/course-wizard/api";

// Richer than the notes editor: headings, code blocks, blockquotes, images and
// YouTube embeds — for authoring full blog articles. Stores HTML.
const extensions = [
  StarterKit.configure({ heading: { levels: [2, 3] } }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
  }),
  Image,
  Youtube.configure({ width: 640, height: 360, nocookie: true }),
  Placeholder.configure({ placeholder: "Maqola matnini yozing…" }),
];

export function BlogEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions,
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "ilm-prose min-h-[360px] w-full px-sp-4 py-sp-4 text-t-15 leading-relaxed text-fg-1 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync external content into the editor when loading a different post.
  React.useEffect(() => {
    if (editor && !editor.isDestroyed && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [editor, value]);

  return (
    <div className="rounded-ilm-xl border border-ilm-border bg-ilm-paper transition-shadow focus-within:ring-1 focus-within:ring-ilm-ink">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Havola URL", previous ?? "https://");
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

  const addYoutube = () => {
    const url = window.prompt("YouTube URL");
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url.trim() });
  };

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadCourseImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      toast.error("Rasmni yuklab bo'lmadi");
    } finally {
      setUploading(false);
    }
  };

  const items: Array<{
    key: string;
    icon: typeof Bold;
    label: string;
    active?: boolean;
    disabled?: boolean;
    run: () => void;
  }> = [
    {
      key: "bold",
      icon: Bold,
      label: "Qalin",
      active: editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      key: "italic",
      icon: Italic,
      label: "Kursiv",
      active: editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      key: "h2",
      icon: Heading2,
      label: "Sarlavha 2",
      active: editor.isActive("heading", { level: 2 }),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      key: "h3",
      icon: Heading3,
      label: "Sarlavha 3",
      active: editor.isActive("heading", { level: 3 }),
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      key: "bullet",
      icon: List,
      label: "Ro'yxat",
      active: editor.isActive("bulletList"),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      key: "ordered",
      icon: ListOrdered,
      label: "Raqamli ro'yxat",
      active: editor.isActive("orderedList"),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      key: "quote",
      icon: Quote,
      label: "Iqtibos",
      active: editor.isActive("blockquote"),
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      key: "code",
      icon: Code2,
      label: "Kod bloki",
      active: editor.isActive("codeBlock"),
      run: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      key: "link",
      icon: Link2,
      label: "Havola",
      active: editor.isActive("link"),
      run: setLink,
    },
    {
      key: "image",
      icon: ImageIcon,
      label: "Rasm",
      disabled: uploading,
      run: () => fileRef.current?.click(),
    },
    {
      key: "youtube",
      icon: YoutubeIcon,
      label: "YouTube",
      run: addYoutube,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-sp-1 border-b border-ilm-border px-sp-2 py-sp-1">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          aria-label={item.label}
          aria-pressed={item.active}
          title={item.label}
          disabled={item.disabled}
          onClick={item.run}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-ilm-md text-fg-2 transition-colors hover:bg-ilm-surface hover:text-ilm-ink disabled:opacity-50",
            item.active && "bg-ilm-surface text-ilm-ink",
          )}
        >
          <Icon icon={item.icon} size={16} />
        </button>
      ))}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPickImage}
      />
    </div>
  );
}

/** Read-only render of stored blog HTML, using the same schema. */
export function BlogContent({ html }: { html: string }) {
  const editor = useEditor({
    extensions,
    content: html,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "ilm-prose text-t-15 leading-relaxed text-fg-1" },
    },
  });

  React.useEffect(() => {
    if (editor && !editor.isDestroyed && html !== editor.getHTML()) {
      editor.commands.setContent(html, false);
    }
  }, [editor, html]);

  return <EditorContent editor={editor} />;
}
