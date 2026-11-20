import { NextRequest, NextResponse } from "next/server";
import { isMasterAuthenticated } from "@/lib/auth";
import { repository } from "@/lib/repository";
import { getDefaultTrialDays, PLAN_PRICING } from "@/lib/pagarme";
import type { PlanTier } from "@/types/tenant";

/**
 * Gera instantaneamente (0ms) o link do Checkout Transparente oficial do Nocaute Hub
 * (/assinar/<slug>?trial=<dias>) e salva na academia.
 */
export async function POST(req: NextRequest) {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { tenantId, planTier, trialDays } = await req.json();
    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId é obrigatório" },
        { status: 400 }
      );
    }

    const tenant = await repository.getTenantById(tenantId);
    if (!tenant) {
      return NextResponse.json(
        { error: "Academia não encontrada" },
        { status: 404 }
      );
    }

    const chosenPlan: PlanTier =
      planTier === "essencial" || planTier === "pro"
        ? planTier
        : tenant.plan_tier;

    const appliedTrial =
      typeof trialDays === "number" &&
      Number.isFinite(trialDays) &&
      trialDays >= 0 &&
      trialDays <= 90
        ? Math.floor(trialDays)
        : getDefaultTrialDays();

    const origin = req.nextUrl.origin;
    const checkoutUrl = `${origin}/assinar/${tenant.slug}?trial=${appliedTrial}`;
    const regularCents = PLAN_PRICING[chosenPlan].regularCents;

    const updated = await repository.updateTenant(tenant.id, {
      plan_tier: chosenPlan,
      monthly_price_cents: regularCents,
      pagarme_payment_link_id: `transparent_${tenant.slug}_${appliedTrial}d`,
      pagarme_payment_link_url: checkoutUrl,
      subscription_status:
        tenant.subscription_status === "paid" ? "paid" : "pending",
    });

    return NextResponse.json({
      ok: true,
      url: checkoutUrl,
      paymentLinkId: `transparent_${tenant.slug}_${appliedTrial}d`,
      regularCents,
      trialDays: appliedTrial,
      paymentLink: {
        id: `transparent_${tenant.slug}_${appliedTrial}d`,
        url: checkoutUrl,
        trialDays: appliedTrial,
      },
      tenant: updated,
    });
  } catch (err) {
    console.error("[POST /api/billing/pagarme/create-link]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Erro ao gerar link de assinatura",
      },
      { status: 500 }
    );
  }
}
