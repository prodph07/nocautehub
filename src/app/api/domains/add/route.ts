import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isTenantAdminAuthenticated } from "@/lib/client-auth";

const DOMAIN_REGEX =
  /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63})*\.[a-zA-Z]{2,}$/;

export async function POST(req: NextRequest) {
  try {
    const { tenantId, domain } = await req.json();
    if (!tenantId || !domain) {
      return NextResponse.json(
        { error: "tenantId e domain são obrigatórios" },
        { status: 400 }
      );
    }

    const authed = await isTenantAdminAuthenticated(tenantId);
    if (!authed) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const cleanDomain = String(domain)
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "");

    if (!DOMAIN_REGEX.test(cleanDomain)) {
      return NextResponse.json(
        { error: "Formato de domínio inválido. Ex: academiaalfa.com.br" },
        { status: 400 }
      );
    }

    let cloudflareHostnameId: string | null = `cf_sim_${Date.now()}`;
    let mode: "cloudflare" | "simulated" = "simulated";

    // Se Cloudflare for SaaS estiver configurado, registra Custom Hostname real
    const cfToken = process.env.CLOUDFLARE_API_TOKEN;
    const cfZone = process.env.CLOUDFLARE_ZONE_ID;

    if (cfToken && cfZone) {
      const cfRes = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${cfZone}/custom_hostnames`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hostname: cleanDomain,
            ssl: {
              method: "http",
              type: "dv",
              settings: { min_tls_version: "1.2" },
            },
          }),
        }
      );

      const cfData = await cfRes.json();
      if (!cfRes.ok || !cfData.success) {
        return NextResponse.json(
          {
            error:
              cfData.errors?.[0]?.message ||
              "Erro ao registrar domínio na Cloudflare",
          },
          { status: 400 }
        );
      }

      cloudflareHostnameId = cfData.result?.id || null;
      mode = "cloudflare";
    }

    const updated = await repository.updateTenant(tenantId, {
      custom_domain: cleanDomain,
      domain_status: "pending",
      cloudflare_hostname_id: cloudflareHostnameId,
    });

    return NextResponse.json({
      tenant: updated,
      cnameTarget:
        process.env.NEXT_PUBLIC_CLOUDFLARE_CNAME_TARGET ||
        "cname.nocautehub.com",
      mode,
    });
  } catch (err) {
    console.error("[POST /api/domains/add]", err);
    return NextResponse.json(
      { error: "Erro ao adicionar domínio" },
      { status: 500 }
    );
  }
}

