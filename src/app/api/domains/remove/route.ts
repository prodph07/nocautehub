import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isTenantAdminAuthenticated } from "@/lib/client-auth";

export async function DELETE(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenantId");
    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId obrigatório" },
        { status: 400 }
      );
    }

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

    const cfToken = process.env.CLOUDFLARE_API_TOKEN;
    const cfZone = process.env.CLOUDFLARE_ZONE_ID;

    if (
      cfToken &&
      cfZone &&
      tenant.cloudflare_hostname_id &&
      !tenant.cloudflare_hostname_id.startsWith("cf_sim_")
    ) {
      await fetch(
        `https://api.cloudflare.com/client/v4/zones/${cfZone}/custom_hostnames/${tenant.cloudflare_hostname_id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${cfToken}` },
        }
      );
    }

    const updated = await repository.updateTenant(tenantId, {
      custom_domain: null,
      domain_status: "pending",
      cloudflare_hostname_id: null,
    });

    return NextResponse.json({ tenant: updated, ok: true });
  } catch (err) {
    console.error("[DELETE /api/domains/remove]", err);
    return NextResponse.json(
      { error: "Erro ao remover domínio" },
      { status: 500 }
    );
  }
}

