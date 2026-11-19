import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isTenantAdminAuthenticated } from "@/lib/client-auth";

/**
 * Endpoint do Painel do Cliente:
 * Permite ao dono da academia editar TODO o conteúdo visual do próprio site
 * (todas as 11 seções, cores, fotos, horários, contatos e rastreamento),
 * bloqueando campos administrativos exclusivos do Master (status, plan_tier, slug, feature_flags).
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await context.params;
  const authed = await isTenantAdminAuthenticated(tenantId);
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (body.action === "update_lead_status") {
      const updatedLead = await repository.updateLeadStatus(
        body.leadId,
        body.status
      );
      return NextResponse.json({ lead: updatedLead });
    }

    // Remove campos exclusivos do Master antes de salvar
    const {
      id: _id,
      slug: _slug,
      status: _status,
      plan_tier: _plan,
      feature_flags: _flags,
      cloudflare_hostname_id: _cf,
      domain_status: _ds,
      custom_domain: _cd,
      created_at: _ca,
      updated_at: _ua,
      leads_count: _lc,
      ...allowedClientFields
    } = body;

    if (typeof allowedClientFields.whatsapp_number === "string") {
      allowedClientFields.whatsapp_number =
        allowedClientFields.whatsapp_number.replace(/\D/g, "");
    }

    const updated = await repository.updateTenant(tenantId, allowedClientFields);
    return NextResponse.json({ tenant: updated });
  } catch (err) {
    console.error("[PATCH /api/client-admin/[tenantId]]", err);
    return NextResponse.json(
      { error: "Erro ao salvar alterações" },
      { status: 500 }
    );
  }
}
