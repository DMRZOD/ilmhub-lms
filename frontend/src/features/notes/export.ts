import TurndownService from "turndown";

import type { Note } from "./types";
import { formatTimestamp } from "./utils";

let turndown: TurndownService | null = null;

function getTurndown(): TurndownService {
  if (!turndown) {
    turndown = new TurndownService({
      headingStyle: "atx",
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
    });
  }
  return turndown;
}

function noteToMarkdown(note: Note): string {
  const ts =
    note.timestampSeconds != null
      ? `**[${formatTimestamp(note.timestampSeconds)}]** `
      : "";
  const body = getTurndown().turndown(note.content || "").trim();
  return `${ts}${body}`.trim();
}

/** Build a Markdown document from a flat list of notes (lesson-player export). */
export function notesToMarkdown(title: string, notes: Note[]): string {
  const lines: string[] = [`# ${title}`, ""];
  for (const note of notes) {
    lines.push(noteToMarkdown(note), "");
  }
  return lines.join("\n").trimEnd() + "\n";
}

/** Build a Markdown document grouped by lesson (course-overview export). */
export function courseNotesToMarkdown(
  courseTitle: string,
  groups: Array<{ lessonTitle: string; notes: Note[] }>,
): string {
  const lines: string[] = [`# ${courseTitle}`, ""];
  for (const group of groups) {
    lines.push(`## ${group.lessonTitle}`, "");
    for (const note of group.notes) {
      lines.push(noteToMarkdown(note), "");
    }
  }
  return lines.join("\n").trimEnd() + "\n";
}

export function downloadMarkdown(filename: string, content: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".md") ? filename : `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

/** Slugify a title into a safe-ish filename stem. */
export function toFilenameStem(title: string): string {
  const stem = title
    .toLowerCase()
    .replace(/[^a-z0-9Ѐ-ӿ]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return stem || "eslatmalar";
}
