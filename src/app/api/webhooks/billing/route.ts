import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";

/**
 * Webhook unificado de Cobrança Recorrente (Fase 3 - Asaas, Mercado Pago ou Stripe).
 * Altera automaticamente o status do tenant para 'suspended' em inadimplência
 * e reativa para 'active' na compensação do pagamento.
 */
export async function POST(req: NextRequest) {
  try {
    const expectedSecret = process.env.BILLING_WEBHOOK_SECRET;
    if (expectedSecret) {
      const provided =
        req.headers.get("x-webhook-secret") ||
        req.headers.get("asaas-access-token") ||
        "";
      if (provided !== expectedSecret) {
        return NextResponse.json(
          { error: "Webhook não autorizado" },
          { status: 401 }
        );
      }
    }

    const body = await req.json();

    // Extrai evento e referência do tenant (suporta payloads Asaas, Stripe e Mercado Pago)
    const eventName = String(
      body.event || body.type || body.action || ""
    ).toUpperCase();

    const tenantRef = String(
      body.tenant_id ||
        body.slug ||
        body.payment?.externalReference ||
        body.data?.object?.metadata?.tenant_id ||
        body.data?.external_reference ||
        ""
    ).trim();

    if (!tenantRef) {
      return NextResponse.json(
        { error: "Referência do tenant (tenant_id/slug) não encontrada no payload" },
        { status: 400 }
      );
    }

    const tenant =
      (await repository.getTenantById(tenantRef)) ??
      (await repository.getTenantByDomainOrSlug(tenantRef));

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant não encontrado" },
        { status: 404 }
      );
    }

    const SUSPEND_EVENTS = [
      "PAYMENT_OVERDUE",
      "SUBSCRIPTION_DELETED",
      "SUBSCRIPTION_INACTIVATED",
      "INVOICE.PAYMENT_FAILED",
      "CUSTOMER.SUBSCRIPTION.DELETED",
      "PAYMENT.REJECTED",
    ];

    const ACTIVATE_EVENTS = [
      "PAYMENT_RECEIVED",
      "PAYMENT_CONFIRMED",
      "INVOICE.PAID",
      "PAYMENT.APPROVED",
    ];

    let nextStatus: "active" | "suspended" | null = null;
    if (SUSPEND_EVENTS.includes(eventName)) {
      nextStatus = "suspended";
    } else if (ACTIVATE_EVENTS.includes(eventName)) {
      nextStatus = "active";
    }

    if (!nextStatus) {
      return NextResponse.json({
        ok: true,
        ignored: true,
        event: eventName,
      });
    }

    const updated = await repository.updateTenantStatus(tenant.id, nextStatus);
    return NextResponse.json({
      ok: true,
      tenant_id: tenant.id,
      status: updated?.status,
      event: eventName,
    });
  } catch (err) {
    console.error("[POST /api/webhooks/billing]", err);
    return NextResponse.json(
      { error: "Erro ao processar webhook de cobrança" },
      { status: 500 }
    );
  }
}

