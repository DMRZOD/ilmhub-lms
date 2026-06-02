"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { useCartCount } from "@/features/cart/store";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserMenu } from "@/components/layout/user-menu";
import { useAuth, useLogout } from "@/features/auth/hooks";

const navLinks = [
  { href: "/courses", label: "Kurslar" },
  { href: "/categories", label: "Kategoriyalar" },
  { href: "/instructors", label: "Ustozlar" },
  { href: "/about", label: "Biz haqimizda" },
];

function CartLink({
  count,
  onClick,
  className,
}: {
  count: number;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href="/checkout"
      onClick={onClick}
      aria-label={count > 0 ? `Savat, ${count} ta kurs` : "Savat"}
      className={cn(
        "relative grid h-10 w-10 place-items-center rounded-ilm-full text-ilm-ink transition-colors hover:bg-ilm-surface",
        className,
      )}
    >
      <Icon icon={ShoppingCart} size={20} />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[1.25rem] place-items-center rounded-ilm-full bg-ilm-ink px-1 text-t-12 font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { data: user } = useAuth();
  const logout = useLogout();
  const cartCount = useCartCount();

  return (
    <header className="sticky top-0 z-40 border-b border-ilm-border bg-white/50 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-sp-4 px-sp-4 md:gap-sp-6 md:px-sp-6 lg:h-20">
        <Link href="/" aria-label="IlmHub bosh sahifa" className="shrink-0">
          <Image
            src="/logo-black.svg"
            alt="IlmHub"
            width={128}
            height={31}
            priority
            className="h-6 w-auto md:h-5"
          />
        </Link>

        <nav className="hidden items-center gap-sp-2 lg:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-ilm-md px-sp-3 py-sp-2 text-t-14 font-semibold transition-colors duration-base ease-ilm-out",
                  isActive
                    ? "text-ilm-ink"
                    : "text-ilm-muted-2 hover:text-ilm-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden flex-1 max-w-xs lg:block">
          <Field
            shape="pill"
            icon={Search}
            placeholder="Kurs qidiring..."
            aria-label="Kurs qidirish"
          />
        </div>

        <div className="ml-auto hidden items-center gap-sp-2 lg:flex">
          <CartLink count={cartCount} />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/login">Kirish</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/register">Ro&apos;yxatdan o&apos;tish</Link>
              </Button>
            </>
          )}
        </div>

        <CartLink count={cartCount} className="ml-auto lg:hidden" />

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button
              variant="secondary"
              size="sm"
              iconLeft={Menu}
              iconOnly
              aria-label="Menyuni ochish"
            />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="flex w-full flex-col gap-sp-6 sm:max-w-sm"
          >
            <SheetTitle className="sr-only">Asosiy menyu</SheetTitle>

            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="inline-flex"
              aria-label="IlmHub bosh sahifa"
            >
              <Image
                src="/logo-black.svg"
                alt="IlmHub"
                width={168}
                height={31}
                className="h-7 w-auto"
              />
            </Link>

            <Field
              shape="pill"
              icon={Search}
              placeholder="Kurs qidiring..."
              aria-label="Kurs qidirish"
            />

            <nav className="flex flex-col gap-sp-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-ilm-md px-sp-4 py-sp-3 text-t-16 font-semibold transition-colors duration-base ease-ilm-out",
                      isActive
                        ? "bg-ilm-surface text-ilm-ink"
                        : "text-ilm-muted-2 hover:bg-ilm-surface hover:text-ilm-ink",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto flex flex-col gap-sp-2">
              {user ? (
                <>
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    asChild
                  >
                    <Link
                      href="/student/dashboard"
                      onClick={() => setMobileOpen(false)}
                    >
                      {user.name}
                    </Link>
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    disabled={logout.isPending}
                    onClick={async () => {
                      setMobileOpen(false);
                      await logout.mutateAsync();
                    }}
                  >
                    Chiqish
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    asChild
                  >
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      Kirish
                    </Link>
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    asChild
                  >
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      Ro&apos;yxatdan o&apos;tish
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
