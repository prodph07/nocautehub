import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isMasterAuthenticated } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const tenant = await repository.getTenantById(id);
  if (!tenant) {
    return NextResponse.json({ error: "Academia não encontrada" }, { status: 404 });
  }

  const leads = await repository.listLeads(id);
  return NextResponse.json({ tenant, leads });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await req.json();
    const updated = await repository.updateTenant(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Academia não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ tenant: updated });
  } catch (err) {
    console.error("[PATCH /api/tenants/[id]]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao atualizar academia" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await repository.deleteTenant(id);
  if (!deleted) {
    return NextResponse.json({ error: "Academia não encontrada" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

