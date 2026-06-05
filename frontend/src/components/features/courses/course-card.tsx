"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, Heart, Star } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  LEVEL_LABELS,
  formatCompactCount,
  formatDurationHours,
  formatPriceUsd,
  isFreePrice,
} from "@/lib/format";
import type { ViewMode } from "@/lib/courses-filter";
import type { CourseCard as CourseCardType } from "@/types/api";

export type CourseCardVariant = "public" | "enrolled" | "favorite";

interface CourseCardProps {
  course: CourseCardType;
  variant?: CourseCardVariant;
  view?: ViewMode;
  className?: string;
  /** Where the card links to. Defaults to the public course page. */
  href?: string;
  progressPercent?: number;
  isCompleted?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

function enrolledCtaLabel(progress: number, completed: boolean): string {
  if (completed) return "Yana ko'rib chiqish";
  if (progress > 0) return "Davom etish";
  return "Boshlash";
}

export function CourseCard({
  course,
  variant = "public",
  view = "grid",
  className,
  href,
  progressPercent = 0,
  isCompleted = false,
  isFavorited = false,
  onToggleFavorite,
}: CourseCardProps) {
  const isFree = isFreePrice(course.priceUsdCents);
  const isList = view === "list";
  const showHeart = variant !== "enrolled";
  const heartFilled = variant === "favorite" || isFavorited;

  function handleHeartClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    onToggleFavorite?.();
  }

  return (
    <Link
      href={href ?? `/courses/${course.slug}`}
      className={cn("group block", className)}
      aria-label={course.title}
    >
      <Card
        hoverable
        padding="none"
        className={cn(
          "flex h-full overflow-hidden",
          isList ? "flex-col sm:flex-row" : "flex-col"
        )}
      >
        <div
          className={cn(
            "relative aspect-[16/9] overflow-hidden bg-ilm-surface",
            isList && "sm:aspect-auto sm:w-80 sm:shrink-0"
          )}
        >
          {course.thumbnailUrl && (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              sizes={
                isList
                  ? "(min-width: 640px) 320px, 100vw"
                  : "(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
              }
              className="object-cover transition-transform duration-slow ease-ilm-out group-hover:scale-[1.03]"
            />
          )}
          <div className="absolute left-sp-3 top-sp-3">
            <Badge tone="neutral" className="bg-white/95">
              {LEVEL_LABELS[course.level]}
            </Badge>
          </div>
          {showHeart && (
            <button
              type="button"
              onClick={handleHeartClick}
              aria-pressed={heartFilled}
              aria-label={
                heartFilled
                  ? "Sevimlilardan olib tashlash"
                  : "Sevimlilarga qo'shish"
              }
              className={cn(
                "absolute right-sp-3 top-sp-3 grid h-9 w-9 place-items-center rounded-ilm-full border bg-white/95 text-ilm-ink shadow-ilm-sm transition-colors",
                "hover:bg-white",
                heartFilled ? "border-transparent" : "border-ilm-border"
              )}
            >
              <Heart
                size={18}
                strokeWidth={2}
                className={cn(
                  heartFilled ? "fill-ilm-error text-ilm-error" : "text-fg-2"
                )}
              />
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-sp-3 p-sp-5">
          <div>
            <Badge tone="neutral" className="bg-ilm-surface">
              {course.category.name}
            </Badge>
          </div>

          <h3 className="line-clamp-2 text-t-18 font-semibold leading-snug text-ilm-ink">
            {course.title}
          </h3>

          {isList && course.subtitle && (
            <p className="line-clamp-2 text-t-14 text-fg-2">
              {course.subtitle}
            </p>
          )}

          <div className="flex items-center gap-sp-2">
            <Avatar
              size="sm"
              src={course.instructor.avatarUrl ?? undefined}
              alt={course.instructor.name}
            />
            <span className="text-t-14 font-medium text-fg-2">
              {course.instructor.name}
            </span>
          </div>

          {variant === "enrolled" ? (
            <div className="flex flex-col gap-sp-2">
              <div className="flex items-center justify-between text-t-12 text-fg-2">
                <span>
                  {isCompleted ? "Tugatildi" : "Progress"}
                </span>
                <span className="font-semibold text-ilm-ink">
                  {progressPercent}%
                </span>
              </div>
              <Progress value={progressPercent} />
            </div>
          ) : (
            <div className="flex flex-wrap gap-sp-2">
              <Badge icon={Star}>
                {course.ratingAvg.toFixed(1)} (
                {formatCompactCount(course.ratingCount)})
              </Badge>
              <Badge icon={Clock}>
                {formatDurationHours(course.durationMinutes)} soat
              </Badge>
              <Badge icon={BookOpen}>{course.lessonsCount} dars</Badge>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between pt-sp-2">
            {variant === "enrolled" ? (
              <span className="text-t-14 text-fg-2">
                {course.lessonsCount} dars
              </span>
            ) : (
              <div
                className={cn(
                  "text-t-24 font-extrabold",
                  isFree ? "text-ilm-success" : "text-ilm-ink"
                )}
              >
                {formatPriceUsd(course.priceUsdCents)}
              </div>
            )}
            <Button variant="primary" size="sm">
              {variant === "enrolled"
                ? enrolledCtaLabel(progressPercent, isCompleted)
                : isFree
                  ? "Bepul boshlash"
                  : "Sotib olish"}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
