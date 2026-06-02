/**
 * Server-rendered JSON-LD structured data.
 * Renders a <script type="application/ld+json"> into the document so crawlers
 * read schema.org markup even though page bodies are client-rendered.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline; no user-controlled HTML.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
