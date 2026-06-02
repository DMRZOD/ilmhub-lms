import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

/**
 * Renders user-supplied Markdown (GFM) as safe HTML. Raw HTML in the source is
 * NOT rendered — react-markdown ignores it by default, so this is XSS-safe.
 */
const COMPONENTS: Components = {
  a: ({ children, ...props }) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-ilm-ink underline underline-offset-2"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-sp-2 list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-sp-2 list-decimal space-y-1 pl-5">{children}</ol>
  ),
  p: ({ children }) => <p className="my-sp-2 first:mt-0 last:mb-0">{children}</p>,
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className ?? "");
    return isBlock ? (
      <code className="block overflow-x-auto rounded-ilm-lg bg-ilm-surface p-sp-3 font-mono text-t-13">
        {children}
      </code>
    ) : (
      <code className="rounded bg-ilm-surface px-1 py-0.5 font-mono text-t-13">
        {children}
      </code>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="my-sp-2 border-l-2 border-ilm-border pl-sp-3 text-fg-2">
      {children}
    </blockquote>
  ),
};

export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-t-14 leading-relaxed text-fg-1 [word-break:break-word]",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
