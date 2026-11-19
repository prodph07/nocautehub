import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isTenantAdminAuthenticated } from "@/lib/client-auth";

export async function POST(req: NextRequest) {
  try {
    const { tenant_id, event_type, source } = await req.json();
    if (
      !tenant_id ||
      !["page_view", "whatsapp_click"].includes(event_type)
    ) {
      return NextResponse.json({ error: "Evento inválido" }, { status: 400 });
    }

    await repository.recordAnalyticsEvent(tenant_id, event_type, source);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao registrar evento" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenantId");
  if (!tenantId) {
    return NextResponse.json({ error: "tenantId obrigatório" }, { status: 400 });
  }

  const authed = await isTenantAdminAuthenticated(tenantId);
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const summary = await repository.getWeeklyAnalytics(tenantId);
  return NextResponse.json({ summary });
}

