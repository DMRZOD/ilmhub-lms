// Default values for platform settings. Returned when a key has not been
// persisted yet, so the app behaves identically with or without seeded rows.
// These mirror the frontend home-page fallbacks and prisma/seed.ts.

export interface HomeHero {
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

export interface HomeStat {
  value: number;
  suffix: string;
  label: string;
}

export interface EmailSender {
  name: string;
  address: string;
}

export const HOME_HERO_DEFAULT: HomeHero = {
  title: "Kelajak kasbingizni bugun o'rganing",
  subtitle:
    "Eng yaxshi ustozlardan onlayn kurslar. O'zingiz uchun mos sur'atda o'rganing, real loyihalar ustida ishlang va sertifikat oling.",
  primaryCtaLabel: "Kurslarni ko'rish",
  primaryCtaHref: '/courses',
  secondaryCtaLabel: 'Bepul boshlash',
  secondaryCtaHref: '/register',
};

export const HOME_STATS_DEFAULT: HomeStat[] = [
  { value: 10000, suffix: '+', label: 'talaba' },
  { value: 200, suffix: '+', label: 'kurs' },
  { value: 50, suffix: '+', label: 'ustoz' },
  { value: 95, suffix: '%', label: 'tugatish darajasi' },
];

export const EMAIL_SENDER_DEFAULT: EmailSender = {
  name: 'IlmHub',
  address: 'no-reply@ilmhub.uz',
};

// Default platform commission applied to instructor gross revenue.
export const COMMISSION_RATE_DEFAULT = 0.1;

export const SETTING_KEYS = {
  commissionRate: 'commission_rate',
  maintenanceMode: 'maintenance_mode',
  emailSender: 'email_sender',
  homeHero: 'home_hero',
  homeStats: 'home_stats',
} as const;

export const SETTING_DEFAULTS: Record<string, unknown> = {
  [SETTING_KEYS.commissionRate]: COMMISSION_RATE_DEFAULT,
  [SETTING_KEYS.maintenanceMode]: false,
  [SETTING_KEYS.emailSender]: EMAIL_SENDER_DEFAULT,
  [SETTING_KEYS.homeHero]: HOME_HERO_DEFAULT,
  [SETTING_KEYS.homeStats]: HOME_STATS_DEFAULT,
};
