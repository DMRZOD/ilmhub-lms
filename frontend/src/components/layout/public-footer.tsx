import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Icon } from "@/components/ui/icon";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Kompaniya",
    links: [
      { label: "Biz haqimizda", href: "/about" },
      { label: "Ustoz bo'lish", href: "/student/become-instructor" },
      { label: "Karyera", href: "/career" },
      { label: "Yangiliklar", href: "/blog" },
    ],
  },
  {
    title: "Kurslar",
    links: [
      { label: "Frontend", href: "/courses?category=frontend" },
      { label: "Backend", href: "/courses?category=backend" },
      { label: "Dizayn", href: "/courses?category=design" },
      { label: "Barcha kategoriyalar", href: "/courses" },
    ],
  },
  {
    title: "Yordam",
    links: [
      { label: "Yordam markazi", href: "/help" },
      { label: "Sertifikatlar", href: "/certificates" },
      { label: "FAQ", href: "/faq" },
      { label: "Aloqa", href: "/contact" },
    ],
  },
];

const socials = [
  { label: "LinkedIn", href: "https://linkedin.com/company/ilmhub", src: "/linkedin.png" },
  { label: "YouTube", href: "https://youtube.com/@ilmhub", src: "/youtube.png" },
  { label: "Telegram", href: "https://t.me/ilmhub", src: "/telegram.png" },
  { label: "Instagram", href: "https://instagram.com/ilmhub", src: "/instagram.png" },
];

export function PublicFooter() {
  return (
    <footer className="bg-ilm-ink text-ilm-paper">
      <div className="mx-auto max-w-7xl px-sp-4 py-sp-16 md:px-sp-6 md:py-sp-20">
        <div className="grid gap-sp-10 sm:grid-cols-2 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-sp-4">
              <h3 className="text-t-14 font-bold uppercase tracking-ilm-wide text-ilm-paper">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-sp-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-t-14 font-medium text-white/70 transition-colors duration-base ease-ilm-out hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex flex-col gap-sp-4 sm:col-span-2 md:col-span-1">
            <h3 className="text-t-14 font-bold uppercase tracking-ilm-wide text-ilm-paper">
              Aloqa
            </h3>
            <ul className="flex flex-col gap-sp-3 text-t-14 font-medium text-white/70">
              <li className="flex items-center gap-sp-2">
                <Icon icon={Mail} size={16} className="text-white/70" />
                <a
                  href="mailto:salom@ilmhub.uz"
                  className="transition-colors hover:text-white"
                >
                  salom@ilmhub.uz
                </a>
              </li>
              <li className="flex items-center gap-sp-2">
                <Icon icon={Phone} size={16} className="text-white/70" />
                <a
                  href="tel:+998901234567"
                  className="transition-colors hover:text-white"
                >
                  +998 90 123 45 67
                </a>
              </li>
              <li className="flex items-start gap-sp-2">
                <Icon icon={MapPin} size={16} className="mt-0.5 text-white/70" />
                <span>Toshkent, Mirzo Ulug&apos;bek tumani</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-sp-12 flex flex-col items-start gap-sp-6 border-t border-white/10 pt-sp-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" aria-label="IlmHub bosh sahifa">
            <Image
              src="/logo-white.svg"
              alt="IlmHub"
              width={168}
              height={31}
              className="h-7 w-auto"
            />
          </Link>

          <div className="flex items-center gap-sp-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-ilm-full transition-colors duration-base ease-ilm-out hover:bg-white/10"
              >
                <Image
                  src={s.src}
                  alt={s.label}
                  width={22}
                  height={22}
                  className="h-[30px] w-[30px] object-contain"
                />
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-sp-3 md:flex-row md:items-center md:gap-sp-6">
            <div className="flex flex-wrap gap-x-sp-4 gap-y-sp-2 text-t-14 text-white/60">
              <Link
                href="/privacy"
                className="transition-colors hover:text-white"
              >
                Maxfiylik siyosati
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-white"
              >
                Foydalanish shartlari
              </Link>
            </div>
            <p className="text-t-14 text-white/60">
              © 2026 IlmHub
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
