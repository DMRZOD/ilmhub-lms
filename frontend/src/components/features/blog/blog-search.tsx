"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Field } from "@/components/ui/field";

/** Navigates to /blog?q=… to filter the listing (resets other filters). */
export function BlogSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    router.push(trimmed ? `/blog?q=${encodeURIComponent(trimmed)}` : "/blog");
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="w-full sm:max-w-xs">
      <Field
        type="search"
        name="q"
        shape="pill"
        icon={Search}
        placeholder="Maqolalardan qidiring..."
        aria-label="Blogdan qidirish"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </form>
  );
}
