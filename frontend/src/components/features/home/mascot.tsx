import Image from "next/image";

import { cn } from "@/lib/utils";

export type MascotVariant = 1 | 2 | 3;

const SRC: Record<MascotVariant, string> = {
  1: "/Mascot-1.png",
  2: "/Mascot-2.png",
  3: "/Mascot-3.png",
};

export function Mascot({
  variant = 1,
  size = 120,
  className,
}: {
  variant?: MascotVariant;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={SRC[variant]}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={cn("select-none", className)}
    />
  );
}
