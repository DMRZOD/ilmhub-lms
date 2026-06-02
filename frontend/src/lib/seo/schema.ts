/**
 * schema.org JSON-LD builders. Kept framework-agnostic (plain objects) so they
 * can be rendered by the <JsonLd> server component on any page.
 */
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "./site";

type Json = Record<string, unknown>;

/** Organization — IlmHub itself. Used on the home page and as `provider`. */
export function organizationSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("logo-black.svg"),
  };
}

/** WebSite — enables sitelinks / search box hinting. */
export function websiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "uz",
  };
}

export interface CourseSchemaInput {
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  priceUsdCents?: number | null;
  ratingAvg?: number | null;
  ratingCount?: number | null;
  instructor?: { name?: string | null } | null;
}

/** Course — provider, instructor, rating, offer. */
export function courseSchema(c: CourseSchemaInput): Json {
  const schema: Json = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: c.title,
    description: c.subtitle || c.description || c.title,
    url: absoluteUrl(`kurslar/${c.slug}`),
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    inLanguage: "uz",
  };

  if (c.thumbnailUrl) schema.image = c.thumbnailUrl;
  if (c.instructor?.name) {
    schema.instructor = { "@type": "Person", name: c.instructor.name };
  }
  if (typeof c.ratingCount === "number" && c.ratingCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(c.ratingAvg ?? 0),
      ratingCount: c.ratingCount,
    };
  }
  if (typeof c.priceUsdCents === "number") {
    schema.offers = {
      "@type": "Offer",
      price: (c.priceUsdCents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`kurslar/${c.slug}`),
    };
  }
  return schema;
}

export interface PersonSchemaInput {
  id: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

/** Person — instructor profile. */
export function personSchema(p: PersonSchemaInput): Json {
  const schema: Json = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.name,
    url: absoluteUrl(`ustozlar/${p.id}`),
    worksFor: { "@type": "Organization", name: SITE_NAME, sameAs: SITE_URL },
  };
  if (p.bio) schema.description = p.bio;
  if (p.avatarUrl) schema.image = p.avatarUrl;
  return schema;
}
