import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Mascot } from "@/components/features/home/mascot";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-sp-6 bg-ilm-paper px-sp-4 py-sp-12">
      <div className="grid place-items-center rounded-ilm-2xl bg-ilm-ink">
        <Mascot variant={3} size={400} />
      </div>
      <span className="text-t-14 font-semibold uppercase tracking-ilm-wide text-ilm-muted-2">
        404
      </span>
      <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink md:text-t-48">
        Sahifa topilmadi
      </h1>
      <p className="max-w-md text-center text-t-16 leading-relaxed text-fg-2">
        Siz qidirayotgan sahifa mavjud emas, ko&apos;chirilgan yoki o&apos;chirilgan.
        Iltimos, manzilni qaytadan tekshiring yoki bosh sahifaga qayting.
      </p>
      <Button variant="primary" size="lg" asChild>
        <Link href="/">
          <Icon icon={ArrowLeft} size={20} />
          Bosh sahifaga qaytish
        </Link>
      </Button>
    </div>
  );
}
