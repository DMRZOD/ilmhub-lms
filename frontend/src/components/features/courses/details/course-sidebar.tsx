"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Award,
  Check,
  Heart,
  Infinity as InfinityIcon,
  Link2,
  PlayCircle,
  Send,
  ShoppingCart,
  Smartphone,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/hooks";
import { useEnroll, useToggleFavorite } from "@/features/student/hooks";
import {
  useCartStore,
  useIsInCart,
  type CartItem,
} from "@/features/cart/store";

function FacebookGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.4H7.8V14h2.7v8h3z" />
    </svg>
  );
}

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  formatDurationHours,
  formatPriceUsd,
  isFreePrice,
} from "@/lib/format";
import type { CourseDetail } from "@/types/api";

function buildShareUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.href;
}

function buildShareText(course: CourseDetail) {
  return `IlmHub'da "${course.title}" kursini ko'ring`;
}

export function CourseSidebar({ course }: { course: CourseDetail }) {
  const router = useRouter();
  const isFree = isFreePrice(course.priceUsdCents);
  const [copied, setCopied] = React.useState(false);
  const { data: viewer } = useAuth();
  const toggleFavorite = useToggleFavorite();
  const enroll = useEnroll();
  const cartAdd = useCartStore((s) => s.add);
  const inCart = useIsInCart(course.id);
  const favorited = Boolean(course.isFavorited);
  const isEnrolled = Boolean(course.isEnrolled);

  function buildCartItem(): CartItem {
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      thumbnailUrl: course.thumbnailUrl ?? null,
      instructorName: course.instructor?.name ?? null,
      priceUsdCents: course.priceUsdCents,
      discountUsdCents: course.discountUsdCents ?? null,
    };
  }

  function handleAddToCartClick() {
    if (inCart) {
      router.push("/checkout");
      return;
    }
    cartAdd(buildCartItem());
    toast.success("Savatga qo'shildi");
  }

  function handleFavoriteClick() {
    if (!viewer) {
      router.push(
        `/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`,
      );
      return;
    }
    toggleFavorite.mutate({
      courseId: course.id,
      slug: course.slug,
      nextFavorited: !favorited,
    });
  }

  const resumeLessonId =
    course.currentUserProgress?.lastLessonId ??
    course.sections[0]?.lessons[0]?.id ??
    null;

  function handlePrimaryClick() {
    if (isEnrolled) {
      if (resumeLessonId) {
        router.push(`/lesson/${resumeLessonId}`);
      } else {
        router.push("/student/courses");
      }
      return;
    }
    if (isFree) {
      if (!viewer) {
        router.push(
          `/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`,
        );
        return;
      }
      enroll.mutate(course.id, {
        onSuccess: (data) => {
          const target = data.nextLessonId ?? data.firstLessonId;
          if (target) {
            router.push(`/lesson/${target}`);
          } else {
            router.push("/student/courses");
          }
        },
      });
      return;
    }
    // Paid course: add to cart (guests welcome — login is enforced at checkout)
    // and head to the cart-style checkout page.
    if (!inCart) cartAdd(buildCartItem());
    router.push("/checkout");
  }

  const primaryLabel = isEnrolled
    ? "Davom etish"
    : isFree
      ? "Bepul boshlash"
      : "Sotib olish";

  const handleCopy = React.useCallback(async () => {
    const url = buildShareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // silent fail — clipboard blocked
    }
  }, []);

  const shareText = buildShareText(course);

  const features: Array<{ icon: typeof Video; label: string }> = [
    {
      icon: Video,
      label: `${formatDurationHours(course.durationMinutes)} soat video`,
    },
    { icon: Award, label: "Yakuniy sertifikat" },
    { icon: InfinityIcon, label: "Umrbod kirish" },
    { icon: Smartphone, label: "Mobil va TV'da ko'rish" },
  ];

  return (
    <Card padding="none" className="overflow-hidden">
      {/* TODO(step-19): replace stub with real video player */}
      <div className="relative aspect-[16/9] bg-ilm-ink">
        {course.thumbnailUrl && (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            priority
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover opacity-90"
          />
        )}
        <button
          type="button"
          aria-label="Kurs preview'sini ko'rish"
          className="absolute inset-0 grid place-items-center bg-ilm-ink/35 transition-colors hover:bg-ilm-ink/45"
        >
          <span className="grid h-16 w-16 place-items-center rounded-ilm-full bg-white/95 text-ilm-ink shadow-ilm-md">
            <Icon icon={PlayCircle} size={36} strokeWidth={1.5} />
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-sp-5 p-sp-5">
        <div
          className={cn(
            "text-t-32 font-extrabold leading-none",
            isFree ? "text-ilm-success" : "text-ilm-ink"
          )}
        >
          {formatPriceUsd(course.priceUsdCents)}
        </div>

        <div className="flex flex-col gap-sp-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handlePrimaryClick}
            disabled={enroll.isPending}
          >
            {primaryLabel}
          </Button>
          {!isFree && !isEnrolled && (
            <Button
              variant="secondary"
              size="md"
              iconLeft={ShoppingCart}
              className="w-full"
              onClick={handleAddToCartClick}
            >
              {inCart ? "Savatda — rasmiylashtirish" : "Savatga qo'shish"}
            </Button>
          )}
          <Button
            variant="secondary"
            size="md"
            iconLeft={Heart}
            className="w-full"
            onClick={handleFavoriteClick}
            aria-pressed={favorited}
            disabled={toggleFavorite.isPending}
          >
            {favorited
              ? "Sevimlilarga qo'shildi"
              : "Sevimlilarga qo'shish"}
          </Button>
        </div>

        <div className="flex flex-col gap-sp-3">
          <h3 className="text-t-14 font-bold text-ilm-ink">Bu kursda</h3>
          <ul className="flex flex-col gap-sp-2">
            {features.map((f) => (
              <li
                key={f.label}
                className="flex items-center gap-sp-3 text-t-14 text-fg-2"
              >
                <Icon icon={f.icon} size={18} className="text-ilm-ink" />
                {f.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-sp-3 border-t border-ilm-border pt-sp-4">
          <h3 className="text-t-14 font-bold text-ilm-ink">
            Do&apos;stlaringizga ulashing
          </h3>
          <div className="flex items-center gap-sp-2">
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(
                buildShareUrl()
              )}&text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram'da ulashish"
              className="grid h-10 w-10 place-items-center rounded-ilm-full border border-ilm-border text-ilm-ink transition-colors hover:bg-ilm-surface"
            >
              <Icon icon={Send} size={16} />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                buildShareUrl()
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook'da ulashish"
              className="grid h-10 w-10 place-items-center rounded-ilm-full border border-ilm-border text-ilm-ink transition-colors hover:bg-ilm-surface"
            >
              <FacebookGlyph size={16} />
            </a>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Havolani nusxalash"
              className="inline-flex items-center gap-sp-2 rounded-ilm-full border border-ilm-border px-sp-3 py-sp-2 text-t-12 font-semibold text-ilm-ink transition-colors hover:bg-ilm-surface"
            >
              <Icon icon={copied ? Check : Link2} size={14} />
              {copied ? "Nusxalandi" : "Havolani nusxalash"}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
