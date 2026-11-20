export const SALES_WHATSAPP_NUMBER =
  (process.env.NEXT_PUBLIC_SALES_WHATSAPP || "5521960194354").replace(
    /\D/g,
    ""
  ) || "5521960194354";

export function buildSalesWhatsAppUrl(message: string): string {
  return `https://api.whatsapp.com/send?phone=${SALES_WHATSAPP_NUMBER}&text=${encodeURIComponent(
    message
  )}`;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export type PlatformConversionEvent =
  | "Lead"
  | "CompleteRegistration"
  | "StartTrial"
  | "Subscribe";

/**
 * Dispara eventos de conversão do funil comercial do Nocaute Hub
 * para Meta Pixel (fbq) e Google Tag Manager / Google Ads / GA4 (gtag + dataLayer).
 */
export function trackPlatformConversion(
  event: PlatformConversionEvent,
  params: Record<string, unknown> = {}
) {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", event, params);
    }
  } catch {
    // ignora bloqueadores de script
  }

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", event, params);
    }
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: `nocaute_${event.toLowerCase()}`,
        ...params,
      });
    }
  } catch {
    // ignora bloqueadores de script
  }
}
