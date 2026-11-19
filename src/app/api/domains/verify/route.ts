import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isTenantAdminAuthenticated } from "@/lib/client-auth";
import type { DomainStatus } from "@/types/tenant";

export async function GET(req: NextRequest) {
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
    if (!tenant || !tenant.custom_domain) {
      return NextResponse.json(
        { error: "Nenhum domínio próprio configurado" },
        { status: 404 }
      );
    }

    let nextStatus: DomainStatus = "active";
    let detail = "DNS propagado e SSL emitido com sucesso (Modo Simulado)";

    const cfToken = process.env.CLOUDFLARE_API_TOKEN;
    const cfZone = process.env.CLOUDFLARE_ZONE_ID;

    if (
      cfToken &&
      cfZone &&
      tenant.cloudflare_hostname_id &&
      !tenant.cloudflare_hostname_id.startsWith("cf_sim_")
    ) {
      const cfRes = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${cfZone}/custom_hostnames/${tenant.cloudflare_hostname_id}`,
        {
          headers: { Authorization: `Bearer ${cfToken}` },
        }
      );
      const cfData = await cfRes.json();

      if (!cfRes.ok || !cfData.success) {
        nextStatus = "error";
        detail =
          cfData.errors?.[0]?.message ||
          "Falha ao consultar status na Cloudflare";
      } else {
        const hostnameStatus = cfData.result?.status;
        const sslStatus = cfData.result?.ssl?.status;
        if (hostnameStatus === "active" && sslStatus === "active") {
          nextStatus = "active";
          detail = "Conectado e Seguro via Cloudflare SSL";
        } else if (hostnameStatus === "pending" || sslStatus === "pending_validation") {
          nextStatus = "pending";
          detail = "Aguardando propagação do registro CNAME no seu provedor de DNS";
        } else {
          nextStatus = "error";
          detail = `Status Cloudflare: ${hostnameStatus} / SSL: ${sslStatus}`;
        }
      }
    }

    const updated = await repository.updateTenant(tenantId, {
      domain_status: nextStatus,
    });

    return NextResponse.json({
      tenant: updated,
      domain_status: nextStatus,
      detail,
    });
  } catch (err) {
    console.error("[GET /api/domains/verify]", err);
    return NextResponse.json(
      { error: "Erro ao verificar domínio" },
      { status: 500 }
    );
  }
}

