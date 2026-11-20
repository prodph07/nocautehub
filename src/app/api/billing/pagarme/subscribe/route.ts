import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import {
  createPagarmeDirectSubscription,
  getDefaultTrialDays,
} from "@/lib/pagarme";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      slug,
      trialDays,
      customer,
      billingAddress,
      card,
    } = body;

    if (!slug) {
      return NextResponse.json(
        { error: "Academia não informada." },
        { status: 400 }
      );
    }

    const tenant = await repository.getTenantByDomainOrSlug(String(slug));
    if (!tenant) {
      return NextResponse.json(
        { error: "Academia não encontrada." },
        { status: 404 }
      );
    }

    const appliedTrial =
      typeof trialDays === "number" &&
      Number.isFinite(trialDays) &&
      trialDays >= 0 &&
      trialDays <= 90
        ? Math.floor(trialDays)
        : getDefaultTrialDays();

    const result = await createPagarmeDirectSubscription({
      tenantId: tenant.id,
      tenantName: tenant.name,
      slug: tenant.slug,
      planTier: tenant.plan_tier,
      trialDays: appliedTrial,
      customer: {
        name: String(customer?.name || ""),
        email: String(customer?.email || ""),
        document: String(customer?.document || ""),
        phone: String(customer?.phone || ""),
      },
      billingAddress: {
        zipCode: String(billingAddress?.zipCode || ""),
        street: String(billingAddress?.street || ""),
        number: String(billingAddress?.number || ""),
        neighborhood: String(billingAddress?.neighborhood || ""),
        city: String(billingAddress?.city || ""),
        state: String(billingAddress?.state || ""),
      },
      card: {
        number: String(card?.number || ""),
        holderName: String(card?.holderName || ""),
        expMonth: Number(card?.expMonth || 0),
        expYear: Number(card?.expYear || 0),
        cvv: String(card?.cvv || ""),
      },
    });

    // Ativa a academia imediatamente após a assinatura ser aprovada na Pagar.me
    await repository.updateTenant(tenant.id, {
      status: "active",
      billing_mode: "pagarme",
      subscription_status: "paid",
      monthly_price_cents: result.regularCents,
      pagarme_subscription_id: result.subscriptionId,
    });

    return NextResponse.json({
      ok: true,
      subscriptionId: result.subscriptionId,
      status: result.status,
      trialDays: result.trialDays,
      firstChargeDateIso: result.firstChargeDateIso,
    });
  } catch (err) {
    console.error("[POST /api/billing/pagarme/subscribe]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Erro ao processar assinatura. Verifique os dados do cartão.",
      },
      { status: 400 }
    );
  }
}

