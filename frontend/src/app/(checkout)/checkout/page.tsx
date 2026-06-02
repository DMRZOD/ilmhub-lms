"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { formatPriceUsd } from "@/lib/format";
import { useAuth } from "@/features/auth/hooks";
import { effectiveCents, useCartItems, useCartStore } from "@/features/cart/store";
import { useCreateOrder } from "@/features/orders/hooks";
import type { PaymentProvider } from "@/types/api";

const PAYMENT_METHODS: {
  value: PaymentProvider;
  label: string;
  accent: string;
}[] = [
  { value: "PAYME", label: "Payme", accent: "text-[#00c2cb]" },
  { value: "CLICK", label: "Click", accent: "text-[#0098eb]" },
  { value: "UZUM", label: "Uzum", accent: "text-[#7f43ff]" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartItems();
  const remove = useCartStore((s) => s.remove);
  const { data: viewer } = useAuth();
  const createOrder = useCreateOrder();
  const [method, setMethod] = React.useState<PaymentProvider>("PAYME");

  const total = items.reduce((sum, i) => sum + effectiveCents(i), 0);

  function handlePay() {
    if (!viewer) {
      router.push("/login?next=/checkout");
      return;
    }
    if (items.length === 0) return;
    createOrder.mutate(
      { courseIds: items.map((i) => i.id), paymentMethod: method },
      {
        onSuccess: (data) => {
          window.location.href = data.paymentUrl;
        },
        onError: () => {
          toast.error("To'lovni boshlashda xato. Qaytadan urinib ko'ring.");
        },
      },
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-sp-5 px-sp-4 py-sp-16 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-ilm-full bg-ilm-surface text-ilm-muted-2">
          <Icon icon={ShoppingCart} size={28} />
        </span>
        <div className="flex flex-col gap-sp-2">
          <h1 className="text-t-24 font-extrabold text-ilm-ink">
            Savatingiz bo&apos;sh
          </h1>
          <p className="text-t-14 text-fg-2">
            Kurslarni ko&apos;rib chiqing va sotib olmoqchi bo&apos;lganlaringizni
            savatga qo&apos;shing.
          </p>
        </div>
        <Button variant="primary" size="lg" asChild>
          <Link href="/courses">Kurslarni ko&apos;rish</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-sp-4 py-sp-8 md:px-sp-6">
      <h1 className="mb-sp-6 text-t-24 font-extrabold text-ilm-ink">
        Buyurtmani rasmiylashtirish
      </h1>

      <div className="grid items-start gap-sp-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-sp-5">
          {/* Cart items */}
          <Card padding="none" className="overflow-hidden">
            <ul className="divide-y divide-ilm-border">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-sp-4 p-sp-4"
                >
                  <div className="relative aspect-[16/9] w-28 shrink-0 overflow-hidden rounded-ilm-md bg-ilm-ink">
                    {item.thumbnailUrl && (
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-sp-1">
                    <Link
                      href={`/courses/${item.slug}`}
                      className="truncate text-t-16 font-bold text-ilm-ink hover:underline"
                    >
                      {item.title}
                    </Link>
                    {item.instructorName && (
                      <span className="truncate text-t-12 text-fg-2">
                        {item.instructorName}
                      </span>
                    )}
                    <span className="text-t-16 font-bold text-ilm-ink">
                      {formatPriceUsd(effectiveCents(item))}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label="Savatdan olib tashlash"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-ilm-full text-ilm-muted-2 transition-colors hover:bg-ilm-surface hover:text-ilm-error"
                  >
                    <Icon icon={Trash2} size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {/* Promo code (no logic yet — step 24 prepares the field) */}
          <Card className="flex flex-col gap-sp-3">
            <h2 className="text-t-14 font-bold text-ilm-ink">Promo kod</h2>
            <div className="flex items-center gap-sp-3">
              <Field
                placeholder="Promo kodni kiriting"
                wrapperClassName="flex-1"
                disabled
              />
              <Button variant="secondary" size="md" disabled>
                Qo&apos;llash
              </Button>
            </div>
          </Card>

          {/* Payment method */}
          <Card className="flex flex-col gap-sp-4">
            <h2 className="text-t-14 font-bold text-ilm-ink">To&apos;lov usuli</h2>
            <RadioGroup
              value={method}
              onValueChange={(v) => setMethod(v as PaymentProvider)}
              className="gap-sp-3"
            >
              {PAYMENT_METHODS.map((pm) => {
                const active = method === pm.value;
                return (
                  <label
                    key={pm.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-sp-3 rounded-ilm-md border p-sp-4 transition-colors",
                      active
                        ? "border-ilm-ink bg-ilm-surface"
                        : "border-ilm-border hover:bg-ilm-surface",
                    )}
                  >
                    <RadioGroupItem value={pm.value} />
                    <span
                      className={cn("text-t-18 font-extrabold", pm.accent)}
                    >
                      {pm.label}
                    </span>
                  </label>
                );
              })}
            </RadioGroup>
          </Card>
        </div>

        {/* Summary */}
        <Card className="flex flex-col gap-sp-4 lg:sticky lg:top-24">
          <h2 className="text-t-16 font-bold text-ilm-ink">Buyurtma</h2>
          <div className="flex items-center justify-between text-t-14 text-fg-2">
            <span>
              {items.length} ta kurs
            </span>
            <span>{formatPriceUsd(total)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-ilm-border pt-sp-4">
            <span className="text-t-16 font-bold text-ilm-ink">Jami</span>
            <span className="text-t-24 font-extrabold text-ilm-ink">
              {formatPriceUsd(total)}
            </span>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handlePay}
            disabled={createOrder.isPending}
          >
            {createOrder.isPending ? "Yo'naltirilmoqda..." : "To'lash"}
          </Button>
          <p className="text-center text-t-12 text-ilm-muted-2">
            To&apos;lovni amalga oshirish bilan siz foydalanish shartlariga
            rozilik bildirasiz.
          </p>
        </Card>
      </div>
    </div>
  );
}
