"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export default function CheckoutFailedPage() {
  return (
    <div className="mx-auto max-w-md px-sp-4 py-sp-12">
      <Card className="flex flex-col items-center gap-sp-5 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-ilm-full bg-ilm-error/15 text-ilm-error">
          <Icon icon={XCircle} size={32} />
        </span>
        <div className="flex flex-col gap-sp-2">
          <h1 className="text-t-24 font-extrabold text-ilm-ink">
            To&apos;lov amalga oshmadi
          </h1>
          <p className="text-t-14 text-fg-2">
            To&apos;lov bekor qilindi yoki xatolik yuz berdi. Savatingiz
            saqlanib qoldi — qaytadan urinib ko&apos;ring.
          </p>
        </div>
        <Button variant="primary" size="lg" className="w-full" asChild>
          <Link href="/checkout">Qayta urinish</Link>
        </Button>
        <Button variant="ghost" size="md" asChild>
          <Link href="/courses">Kurslarga qaytish</Link>
        </Button>
      </Card>
    </div>
  );
}
