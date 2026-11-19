import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isMasterAuthenticated } from "@/lib/auth";

export async function GET() {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const tenants = await repository.listTenants();
  return NextResponse.json({ tenants, localMode: repository.isLocalMode() });
}

export async function POST(req: NextRequest) {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const tenant = await repository.createTenant(body);
    return NextResponse.json({ tenant }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/tenants]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar academia" },
      { status: 500 }
    );
  }
}

