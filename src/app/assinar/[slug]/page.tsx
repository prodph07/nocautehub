import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { repository } from "@/lib/repository";
import { getDefaultTrialDays } from "@/lib/pagarme";
import { getPlatformSettings } from "@/lib/platform-settings";
import { TrackingScripts } from "@/components/site/TrackingScripts";
import { TransparentCheckoutClient } from "@/components/billing/TransparentCheckoutClient";

export const dynamic = "force-dynamic";

interface AssinarPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ trial?: string }>;
}

export async function generateMetadata({
  params,
}: AssinarPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await repository.getTenantByDomainOrSlug(
    decodeURIComponent(slug)
  );
  if (!tenant) {
    return { title: "Ativar Assinatura | Nocaute Hub" };
  }
  return {
    title: `Ativar Assinatura — ${tenant.name} | Nocaute Hub`,
    description: `Ative o site oficial da ${tenant.name} no Nocaute Hub.`,
  };
}

export default async function AssinarTenantPage({
  params,
  searchParams,
}: AssinarPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const [tenant, platformSettings] = await Promise.all([
    repository.getTenantByDomainOrSlug(decodeURIComponent(slug)),
    getPlatformSettings(),
  ]);

  if (!tenant) {
    notFound();
  }

  let trialDays = getDefaultTrialDays();
  if (sp.trial !== undefined && sp.trial !== "") {
    const parsed = Number(sp.trial);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 90) {
      trialDays = Math.floor(parsed);
    }
  } else if (tenant.pagarme_payment_link_url) {
    try {
      const savedUrl = new URL(
        tenant.pagarme_payment_link_url,
        "https://nocautehub.com"
      );
      const savedTrial = savedUrl.searchParams.get("trial");
      if (savedTrial !== null && savedTrial !== "") {
        const parsed = Number(savedTrial);
        if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 90) {
          trialDays = Math.floor(parsed);
        }
      }
    } catch {
      // mantém default
    }
  }

  return (
    <>
      <TrackingScripts
        pixelId={platformSettings.meta_pixel_id || null}
        gtmId={platformSettings.gtm_id || null}
        googleAdsId={platformSettings.google_ads_id || null}
      />
      <TransparentCheckoutClient
        tenant={{
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          custom_domain: tenant.custom_domain,
          plan_tier: tenant.plan_tier,
          status: tenant.status,
          primaryColor: tenant.theme_config?.primary || "#E11D48",
        }}
        trialDays={trialDays}
      />
    </>
  );
}

