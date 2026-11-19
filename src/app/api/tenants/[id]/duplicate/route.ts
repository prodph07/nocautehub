import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isMasterAuthenticated } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const duplicated = await repository.duplicateTenant(id);
    if (!duplicated) {
      return NextResponse.json(
        { error: "Academia original não encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json({ tenant: duplicated }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/tenants/[id]/duplicate]", err);
    return NextResponse.json(
      { error: "Erro ao duplicar demo" },
      { status: 500 }
    );
  }
}

