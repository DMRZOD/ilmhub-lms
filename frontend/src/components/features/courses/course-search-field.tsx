"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Field, type FieldProps } from "@/components/ui/field";

interface CourseSearchFieldProps {
  shape?: FieldProps["shape"];
  placeholder?: string;
  defaultValue?: string;
  autoFocus?: boolean;
  /** Extra classes for the wrapping <form>. */
  className?: string;
  /** Extra classes for the Field itself. */
  wrapperClassName?: string;
  /** Called after a successful submit (e.g. to close a mobile menu). */
  onSubmitted?: () => void;
}

/**
 * A search box that sends the typed query to the courses catalogue
 * (`/courses?q=…`), which reads it from the URL via nuqs. Reused by the public
 * navbar and the homepage hero. An empty submit opens the full catalogue.
 */
export function CourseSearchField({
  shape = "pill",
  placeholder = "Kurs qidiring...",
  defaultValue = "",
  autoFocus,
  className,
  wrapperClassName,
  onSubmitted,
}: CourseSearchFieldProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/courses?q=${encodeURIComponent(trimmed)}` : "/courses");
    setQuery(""); // reset the box after searching so it's ready for the next query
    onSubmitted?.();
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={className}>
      <Field
        type="search"
        name="q"
        shape={shape}
        icon={Search}
        placeholder={placeholder}
        aria-label="Kurs qidirish"
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        wrapperClassName={wrapperClassName}
      />
    </form>
  );
}
