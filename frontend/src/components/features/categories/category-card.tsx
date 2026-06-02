import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Tile } from "@/components/ui/tile";
import { getCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/api";

export function CategoryCard({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  const Icon = getCategoryIcon(category.iconName ?? undefined);

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn("group block", className)}
      aria-label={category.name}
    >
      <Card
        variant="surface"
        hoverable
        padding="md"
        className="flex h-full flex-col items-start gap-sp-4 bg-ilm-surface-2 transition-colors group-hover:bg-ilm-surface"
      >
        <Tile icon={Icon} variant="ink" size="lg" />
        <div className="flex flex-col gap-sp-1">
          <h3 className="text-t-18 font-semibold text-ilm-ink">
            {category.name}
          </h3>
          {category.description && (
            <p className="line-clamp-2 text-t-14 text-fg-2">
              {category.description}
            </p>
          )}
          {category.coursesCount != null && (
            <p className="text-t-12 font-medium text-fg-3">
              {category.coursesCount} ta kurs
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
