import { Briefcase, Camera, Mail, MapPin, Phone, Play, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Icon } from "@/components/ui/icon";

interface ContactRow {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
}

const contactRows: ContactRow[] = [
  {
    icon: Phone,
    label: "Telefon",
    value: "+998 90 123 45 67",
    href: "tel:+998901234567",
  },
  {
    icon: Mail,
    label: "Email",
    value: "salom@ilmhub.uz",
    href: "mailto:salom@ilmhub.uz",
  },
  {
    icon: MapPin,
    label: "Manzil",
    value: "Toshkent sh., Mirzo Ulug'bek tumani, Universitet ko'chasi 7",
    href: "https://yandex.uz/maps/?ll=69.279737%2C41.311081&z=12",
  },
];

const socials: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Telegram", href: "https://t.me/ilmhub", icon: Send },
  { label: "Instagram", href: "https://instagram.com/ilmhub", icon: Camera },
  { label: "YouTube", href: "https://youtube.com/@ilmhub", icon: Play },
  { label: "LinkedIn", href: "https://linkedin.com/company/ilmhub", icon: Briefcase },
];

export function ContactInfo() {
  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-col gap-sp-4">
        {contactRows.map((row) => (
          <a
            key={row.label}
            href={row.href}
            target={row.href.startsWith("http") ? "_blank" : undefined}
            rel={row.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex items-start gap-sp-4 rounded-ilm-2xl bg-ilm-surface p-sp-5 transition-colors hover:bg-ilm-paper"
          >
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-ilm-md bg-ilm-paper">
              <Icon icon={row.icon} size={20} className="text-ilm-ink" />
            </div>
            <div className="flex flex-col gap-sp-1">
              <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-ilm-muted-2">
                {row.label}
              </span>
              <span className="text-t-16 font-medium text-ilm-ink">
                {row.value}
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className="flex flex-col gap-sp-3">
        <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-ilm-muted-2">
          Ijtimoiy tarmoqlar
        </span>
        <div className="flex flex-wrap gap-sp-2">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="inline-flex h-11 w-11 items-center justify-center rounded-ilm-full bg-ilm-surface text-ilm-ink transition-colors hover:bg-ilm-ink hover:text-ilm-paper"
            >
              <Icon icon={s.icon} size={18} />
            </a>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-ilm-2xl">
        <iframe
          title="IlmHub ofis manzili Yandex xaritada"
          src="https://yandex.uz/map-widget/v1/?ll=69.279737%2C41.311081&z=12&l=map"
          loading="lazy"
          className="aspect-video w-full border-0"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
