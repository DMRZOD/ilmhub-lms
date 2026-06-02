"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageRange(page: number, total: number): Array<number | "..."> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: Array<number | "..."> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

export function CatalogPagination({
  page,
  totalPages,
  onPageChange,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const range = getPageRange(page, totalPages);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <Pagination>
      <PaginationContent className="gap-sp-1">
        <PaginationItem>
          <button
            type="button"
            disabled={prevDisabled}
            onClick={() => onPageChange(page - 1)}
            className={cn(
              "inline-flex h-10 items-center gap-1 rounded-ilm-md px-3 text-t-14 font-medium text-ilm-ink transition-colors hover:bg-ilm-surface",
              prevDisabled && "pointer-events-none opacity-40"
            )}
            aria-label="Oldingi sahifa"
          >
            <ChevronLeft className="h-4 w-4" />
            Oldingi
          </button>
        </PaginationItem>

        {range.map((p, i) =>
          p === "..." ? (
            <PaginationItem key={`e-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <button
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-ilm-md text-t-14 font-semibold transition-colors",
                  p === page
                    ? "bg-ilm-ink text-white"
                    : "text-ilm-ink hover:bg-ilm-surface"
                )}
              >
                {p}
              </button>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <button
            type="button"
            disabled={nextDisabled}
            onClick={() => onPageChange(page + 1)}
            className={cn(
              "inline-flex h-10 items-center gap-1 rounded-ilm-md px-3 text-t-14 font-medium text-ilm-ink transition-colors hover:bg-ilm-surface",
              nextDisabled && "pointer-events-none opacity-40"
            )}
            aria-label="Keyingi sahifa"
          >
            Keyingi
            <ChevronRight className="h-4 w-4" />
          </button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
