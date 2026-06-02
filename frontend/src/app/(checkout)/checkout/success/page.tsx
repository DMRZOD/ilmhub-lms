"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { coursesKeys, studentKeys } from "@/lib/query-keys";
import { formatPriceUsd } from "@/lib/format";
import { dashboardQueryKey } from "@/features/student/hooks";
import { useCartStore } from "@/features/cart/store";
import { useOrder, useSimulatePayment } from "@/features/orders/hooks";

const IS_DEV = process.env.NODE_ENV !== "production";

function SuccessContent() {
  const router = useRouter();
  const qc = useQueryClient();
  const params = useSearchParams();
  const orderId = params.get("orderId");

  const { data: order, isPending } = useOrder(orderId);
  const simulate = useSimulatePayment();
  const clearCart = useCartStore((s) => s.clear);

  const status = order?.status;

  // On confirmed payment: empty the cart and refresh enrollment-derived data.
  React.useEffect(() => {
    if (status === "PAID") {
      clearCart();
      qc.invalidateQueries({ queryKey: studentKeys.enrollmentsRoot() });
      qc.invalidateQueries({ queryKey: coursesKeys.details() });
      qc.invalidateQueries({ queryKey: dashboardQueryKey });
    }
  }, [status, clearCart, qc]);

  // A failed payment routes to the dedicated failure screen.
  React.useEffect(() => {
    if (status === "FAILED" && orderId) {
      router.replace(`/checkout/failed?orderId=${orderId}`);
    }
  }, [status, orderId, router]);

  if (!orderId) {
    return (
      <CenteredCard>
        <h1 className="text-t-18 font-bold text-ilm-ink">Buyurtma topilmadi</h1>
        <Button variant="primary" size="md" asChild>
          <Link href="/courses">Kurslarga qaytish</Link>
        </Button>
      </CenteredCard>
    );
  }

  if (isPending) {
    return (
      <CenteredCard>
        <Skeleton className="h-12 w-12 rounded-ilm-full" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-24 w-full" />
      </CenteredCard>
    );
  }

  if (status === "PENDING") {
    return (
      <CenteredCard>
        <span className="grid h-14 w-14 place-items-center rounded-ilm-full bg-ilm-surface text-ilm-ink">
          <Loader2 className="h-7 w-7 animate-spin" />
        </span>
        <div className="flex flex-col gap-sp-2">
          <h1 className="text-t-18 font-bold text-ilm-ink">
            To&apos;lovingiz tasdiqlanmoqda...
          </h1>
          <p className="text-t-14 text-fg-2">
            Bu bir necha soniya davom etishi mumkin. Sahifani yopmang.
          </p>
        </div>
        {IS_DEV && order && (
          <div className="flex w-full flex-col gap-sp-2 rounded-ilm-md border border-dashed border-ilm-border p-sp-4">
            <span className="text-t-12 font-semibold uppercase text-ilm-muted-2">
              Test rejimi
            </span>
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              disabled={simulate.isPending}
              onClick={() =>
                simulate.mutate({
                  orderId,
                  provider: order.paymentMethod,
                })
              }
            >
              {simulate.isPending
                ? "Simulyatsiya..."
                : "To'lovni simulyatsiya qilish"}
            </Button>
          </div>
        )}
      </CenteredCard>
    );
  }

  if (status === "PAID" && order) {
    return (
      <CenteredCard>
        <span className="grid h-14 w-14 place-items-center rounded-ilm-full bg-ilm-success/15 text-ilm-success">
          <Icon icon={CheckCircle2} size={32} />
        </span>
        <div className="flex flex-col gap-sp-2">
          <h1 className="text-t-24 font-extrabold text-ilm-ink">
            To&apos;lov muvaffaqiyatli!
          </h1>
          <p className="text-t-14 text-fg-2">
            Quyidagi kurslar hisobingizga qo&apos;shildi.
          </p>
        </div>

        <ul className="flex w-full flex-col gap-sp-3 text-left">
          {order.items.map((item) => (
            <li
              key={item.courseId}
              className="flex items-center gap-sp-3 rounded-ilm-md border border-ilm-border p-sp-3"
            >
              <div className="relative aspect-[16/9] w-20 shrink-0 overflow-hidden rounded-ilm-sm bg-ilm-ink">
                {item.course.thumbnailUrl && (
                  <Image
                    src={item.course.thumbnailUrl}
                    alt={item.course.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </div>
              <span className="min-w-0 flex-1 truncate text-t-14 font-bold text-ilm-ink">
                {item.course.title}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex w-full items-center justify-between border-t border-ilm-border pt-sp-3 text-t-14">
          <span className="text-fg-2">Jami to&apos;langan</span>
          <span className="font-extrabold text-ilm-ink">
            {formatPriceUsd(order.totalUsdCents)}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => {
            if (order.firstLessonId) {
              router.push(`/lesson/${order.firstLessonId}`);
            } else {
              router.push("/student/courses");
            }
          }}
        >
          O&apos;qishni boshlash
        </Button>
        <Button variant="ghost" size="md" asChild>
          <Link href="/student/courses">Mening kurslarim</Link>
        </Button>
      </CenteredCard>
    );
  }

  // FAILED/REFUNDED — redirect effect handles FAILED; show a fallback meanwhile.
  return (
    <CenteredCard>
      <Loader2 className="h-7 w-7 animate-spin text-ilm-muted-2" />
    </CenteredCard>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-sp-4 py-sp-12">
      <Card className="flex flex-col items-center gap-sp-5 text-center">
        {children}
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <React.Suspense
      fallback={
        <div className="mx-auto max-w-md px-sp-4 py-sp-12">
          <Card className="flex flex-col items-center gap-sp-5">
            <Skeleton className="h-12 w-12 rounded-ilm-full" />
            <Skeleton className="h-5 w-48" />
          </Card>
        </div>
      }
    >
      <SuccessContent />
    </React.Suspense>
  );
}
