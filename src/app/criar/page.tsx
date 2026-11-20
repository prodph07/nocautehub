import type { Metadata } from "next";
import { getDefaultTrialDays } from "@/lib/pagarme";
import { getPlatformSettings } from "@/lib/platform-settings";
import { TrackingScripts } from "@/components/site/TrackingScripts";
import { SelfServiceOnboardingClient } from "@/components/onboarding/SelfServiceOnboardingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Criar Site da Minha Academia (15 Dias Grátis) | Nocaute Hub",
  description:
    "Gere a demonstração oficial do site da sua academia de luta em 10 segundos ou crie junto com nosso time no WhatsApp.",
};

export default async function CriarAcademiaPage() {
  const [platformSettings] = await Promise.all([getPlatformSettings()]);
  const trialDays = getDefaultTrialDays();

  return (
    <>
      <TrackingScripts
        pixelId={platformSettings.meta_pixel_id || null}
        gtmId={platformSettings.gtm_id || null}
        googleAdsId={platformSettings.google_ads_id || null}
      />
      <SelfServiceOnboardingClient trialDays={trialDays} />
    </>
  );
}
