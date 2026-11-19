import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { repository } from "@/lib/repository";
import { getPlanCapabilities } from "@/lib/plans";
import { TenantSiteClient } from "@/components/site/TenantSiteClient";
import { SuspendedScreen } from "@/components/site/SuspendedScreen";
import { TrackingScripts } from "@/components/site/TrackingScripts";

export const dynamic = "force-dynamic";

interface SitePageProps {
  params: Promise<{ domain: string }>;
}

export async function generateMetadata({
  params,
}: SitePageProps): Promise<Metadata> {
  const { domain } = await params;
  const tenant = await repository.getTenantByDomainOrSlug(decodeURIComponent(domain));

  if (!tenant) {
    return {
      title: "Academia não encontrada | Nocaute Hub",
    };
  }

  const title = `${tenant.name} — ${tenant.hero_config?.eyebrow || tenant.city}`;
  const description =
    tenant.hero_config?.subheadline ||
    `Agende sua aula experimental gratuita na ${tenant.name}.`;
  const ogImage =
    tenant.hero_config?.media_type === "image" && tenant.hero_config.media_url
      ? tenant.hero_config.media_url
      : tenant.logo_url || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "pt_BR",
      siteName: tenant.name,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function TenantSitePage({ params }: SitePageProps) {
  const { domain } = await params;
  const tenant = await repository.getTenantByDomainOrSlug(decodeURIComponent(domain));

  if (!tenant) {
    notFound();
  }

  if (tenant.status === "suspended") {
    return <SuspendedScreen academyName={tenant.name} />;
  }

  const schemaOrgGym = {
    "@context": "https://schema.org",
    "@type": "ExerciseGym",
    name: tenant.name,
    description: tenant.hero_config?.subheadline,
    image: tenant.hero_config?.media_url || tenant.logo_url || undefined,
    telephone: `+${tenant.whatsapp_number}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: tenant.address,
      addressLocality: tenant.city,
      addressRegion: tenant.neighborhood,
      addressCountry: "BR",
    },
    openingHours: tenant.opening_hours,
    sport: tenant.modalities.map((m) => m.name),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: String(Math.max(tenant.testimonials.length, 48)),
    },
  };

  const schemaOrgFaq =
    tenant.faqs?.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: tenant.faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgGym) }}
      />
      {schemaOrgFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgFaq) }}
        />
      )}
      {getPlanCapabilities(tenant.plan_tier).pixelTracking && (
        <TrackingScripts pixelId={tenant.pixel_id} gtmId={tenant.gtm_id} />
      )}
      <TenantSiteClient tenant={tenant} />
    </>
  );
}

