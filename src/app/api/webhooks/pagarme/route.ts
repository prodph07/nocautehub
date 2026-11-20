import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";

/**
 * Webhook oficial Pagar.me API v5:
 * Configure no painel da Pagar.me:
 * URL: https://nocautehub.com/api/webhooks/pagarme?secret=SEU_PAGARME_WEBHOOK_SECRET
 *
 * Eventos tratados:
 * - Ativação automática: charge.paid, order.paid, invoice.paid, subscription.created
 * - Suspensão automática (exceto Parceiros): charge.payment_failed, invoice.payment_failed, subscription.canceled
 */
export async function POST(req: NextRequest) {
  try {
    const expectedSecret = process.env.PAGARME_WEBHOOK_SECRET?.trim();
    if (expectedSecret) {
      const provided =
        req.nextUrl.searchParams.get("secret") ||
        req.headers.get("x-webhook-secret") ||
        "";
      if (provided !== expectedSecret) {
        return NextResponse.json(
          { error: "Webhook Pagar.me não autorizado" },
          { status: 401 }
        );
      }
    }

    const body = await req.json();
    const eventType = String(body.type || "").toLowerCase();
    const data = body.data || {};

    // Tenta localizar tenant_id ou slug nos metadados da Pagar.me v5
    const metadata =
      data.metadata ||
      data.subscription?.metadata ||
      data.order?.metadata ||
      data.invoice?.metadata ||
      {};

    const tenantRef = String(
      metadata.tenant_id ||
        metadata.slug ||
        data.code ||
        ""
    ).trim();

    if (!tenantRef) {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: "Sem tenant_id/slug nos metadados do evento",
        event: eventType,
      });
    }

    const tenant =
      (await repository.getTenantById(tenantRef)) ??
      (await repository.getTenantByDomainOrSlug(tenantRef));

    if (!tenant) {
      return NextResponse.json(
        { error: "Academia não encontrada para este webhook" },
        { status: 404 }
      );
    }

    const subscriptionId =
      data.subscription?.id ||
      (eventType.startsWith("subscription.") ? data.id : null) ||
      tenant.pagarme_subscription_id ||
      null;

    const ACTIVATE_EVENTS = [
      "charge.paid",
      "order.paid",
      "invoice.paid",
      "subscription.created",
    ];

    const SUSPEND_EVENTS = [
      "charge.payment_failed",
      "invoice.payment_failed",
      "subscription.canceled",
    ];

    if (ACTIVATE_EVENTS.includes(eventType)) {
      const updated = await repository.updateTenant(tenant.id, {
        status: "active",
        billing_mode: "pagarme",
        subscription_status: "paid",
        pagarme_subscription_id: subscriptionId,
      });

      return NextResponse.json({
        ok: true,
        action: "activated",
        tenant_id: tenant.id,
        status: updated?.status,
        event: eventType,
      });
    }

    if (SUSPEND_EVENTS.includes(eventType)) {
      // Parceiros liberados manualmente nunca são suspensos por falha de cobrança
      if (tenant.billing_mode === "partner") {
        return NextResponse.json({
          ok: true,
          ignored: true,
          reason: "Academia em modo Parceiro protegida contra suspensão automática",
        });
      }

      const nextSubStatus =
        eventType === "subscription.canceled" ? "canceled" : "past_due";

      const updated = await repository.updateTenant(tenant.id, {
        status: "suspended",
        subscription_status: nextSubStatus,
        pagarme_subscription_id: subscriptionId,
      });

      return NextResponse.json({
        ok: true,
        action: "suspended",
        tenant_id: tenant.id,
        status: updated?.status,
        event: eventType,
      });
    }

    return NextResponse.json({
      ok: true,
      ignored: true,
      event: eventType,
    });
  } catch (err) {
    console.error("[POST /api/webhooks/pagarme]", err);
    return NextResponse.json(
      { error: "Erro ao processar webhook Pagar.me" },
      { status: 500 }
    );
  }
}

