import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isMasterAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const tenantId = req.nextUrl.searchParams.get("tenantId") || undefined;
  const leads = await repository.listLeads(tenantId);
  return NextResponse.json({ leads });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenant_id,
      name,
      phone,
      chosen_modality,
      preferred_shift,
      utm_source,
      utm_medium,
      utm_campaign,
    } = body;

    if (!tenant_id || !name || !chosen_modality || !preferred_shift) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes" },
        { status: 400 }
      );
    }

    const lead = await repository.createLead({
      tenant_id,
      name: String(name).trim(),
      phone: String(phone || "").trim(),
      chosen_modality: String(chosen_modality).trim(),
      preferred_shift,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/leads]", err);
    return NextResponse.json(
      { error: "Erro ao salvar lead" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || !["novo", "agendado", "matriculado"].includes(status)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const updated = await repository.updateLeadStatus(id, status);
    return NextResponse.json({ lead: updated });
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar status do lead" },
      { status: 500 }
    );
  }
}

