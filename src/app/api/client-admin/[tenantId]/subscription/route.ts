import { NextRequest, NextResponse } from "next/server";
import { isTenantAdminAuthenticated } from "@/lib/client-auth";
import { repository } from "@/lib/repository";
import {
  getPagarmeSubscriptionDetails,
  upgradePagarmeSubscriptionToPro,
  updatePagarmeSubscriptionCard,
  PLAN_PRICING,
} from "@/lib/pagarme";

interface RouteContext {
  params: Promise<{ tenantId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { tenantId } = await params;
  const authed = await isTenantAdminAuthenticated(tenantId);
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const tenant = await repository.getTenantById(tenantId);
  if (!tenant) {
    return NextResponse.json(
      { error: "Academia não encontrada" },
      { status: 404 }
    );
  }

  const pagarmeSnapshot = tenant.pagarme_subscription_id
    ? await getPagarmeSubscriptionDetails(tenant.pagarme_subscription_id)
    : null;

  return NextResponse.json({
    ok: true,
    subscription: pagarmeSnapshot,
    tenant: {
      id: tenant.id,
      slug: tenant.slug,
      status: tenant.status,
      plan_tier: tenant.plan_tier,
      billing_mode: tenant.billing_mode || "partner",
      subscription_status: tenant.subscription_status || "none",
      monthly_price_cents:
        tenant.monthly_price_cents ||
        PLAN_PRICING[tenant.plan_tier].regularCents,
      pagarme_subscription_id: tenant.pagarme_subscription_id || null,
    },
  });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { tenantId } = await params;
  const authed = await isTenantAdminAuthenticated(tenantId);
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const tenant = await repository.getTenantById(tenantId);
  if (!tenant) {
    return NextResponse.json(
      { error: "Academia não encontrada" },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const action = String(body.action || "");

    if (action === "upgrade_pro") {
      if (tenant.plan_tier === "pro") {
        return NextResponse.json({
          ok: true,
          tenant,
          message: "Sua academia já está no Plano Pro.",
        });
      }

      if (tenant.pagarme_subscription_id) {
        const upgradedInPagarme = await upgradePagarmeSubscriptionToPro(
          tenant.pagarme_subscription_id,
          tenant.name
        );
        if (!upgradedInPagarme) {
          return NextResponse.json(
            {
              error:
                "Não foi possível atualizar o valor da assinatura na operadora. Fale com nosso suporte no WhatsApp.",
            },
            { status: 400 }
          );
        }
      }

      const updated = await repository.updateTenant(tenant.id, {
        plan_tier: "pro",
        monthly_price_cents: PLAN_PRICING.pro.regularCents,
      });

      const snapshot = tenant.pagarme_subscription_id
        ? await getPagarmeSubscriptionDetails(tenant.pagarme_subscription_id)
        : null;

      return NextResponse.json({
        ok: true,
        tenant: updated,
        subscription: snapshot,
        message: "Upgrade para o Plano Pro ativado com sucesso!",
      });
    }

    if (action === "update_card") {
      if (!tenant.pagarme_subscription_id) {
        return NextResponse.json(
          {
            error:
              "Esta academia ainda não possui uma assinatura ativa com cartão cadastrado.",
          },
          { status: 400 }
        );
      }

      await updatePagarmeSubscriptionCard(tenant.pagarme_subscription_id, {
        cardToken: body.cardToken ? String(body.cardToken) : null,
        card: body.card
          ? {
              number: String(body.card.number || ""),
              holderName: String(body.card.holderName || ""),
              expMonth: Number(body.card.expMonth || 0),
              expYear: Number(body.card.expYear || 0),
              cvv: String(body.card.cvv || ""),
            }
          : undefined,
      });

      const snapshot = await getPagarmeSubscriptionDetails(
        tenant.pagarme_subscription_id
      );

      return NextResponse.json({
        ok: true,
        subscription: snapshot,
        message: "Cartão de crédito atualizado com sucesso!",
      });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (err) {
    console.error("[POST /api/client-admin/subscription]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Erro ao atualizar assinatura",
      },
      { status: 400 }
    );
  }
}
