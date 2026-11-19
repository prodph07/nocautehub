import { NextRequest, NextResponse } from "next/server";
import { isMasterAuthenticated } from "@/lib/auth";
import {
  createAdminSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { repository } from "@/lib/repository";

/**
 * Permite ao Master Admin criar o usuário de acesso do dono da academia (/admin)
 * em 1 clique, sem precisar abrir o dashboard do Supabase manualmente.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id: tenantId } = await context.params;
    const { email, password } = await req.json();

    if (!email || !password || String(password).length < 6) {
      return NextResponse.json(
        { error: "Informe um e-mail válido e senha com no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    if (!isSupabaseConfigured()) {
      await repository.updateTenant(tenantId, {
        admin_email: cleanEmail,
        admin_password: String(password),
      });
      return NextResponse.json({
        ok: true,
        email: cleanEmail,
        message: "Acesso do cliente atualizado no Modo Local!",
      });
    }

    const adminSupabase = createAdminSupabase();
    if (!adminSupabase) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY não configurada." },
        { status: 500 }
      );
    }

    // Cria usuário já confirmado no Supabase Auth
    let userId: string | null = null;
    const { data: created, error: createErr } =
      await adminSupabase.auth.admin.createUser({
        email: cleanEmail,
        password: String(password),
        email_confirm: true,
        app_metadata: { role: "client", tenant_id: tenantId },
      });

    if (createErr) {
      // Se o e-mail já existe no Auth, localiza o usuário e atualiza a senha
      const { data: listData } = await adminSupabase.auth.admin.listUsers();
      const existing = listData?.users?.find(
        (u) => u.email?.toLowerCase() === cleanEmail
      );
      if (!existing) {
        return NextResponse.json(
          { error: createErr.message || "Erro ao criar usuário no Supabase Auth" },
          { status: 400 }
        );
      }
      userId = existing.id;
      await adminSupabase.auth.admin.updateUserById(userId, {
        password: String(password),
        email_confirm: true,
        app_metadata: { role: "client", tenant_id: tenantId },
      });
    } else {
      userId = created.user?.id || null;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Não foi possível obter o ID do usuário." },
        { status: 500 }
      );
    }

    const { error: linkErr } = await adminSupabase
      .from("tenant_users")
      .upsert(
        {
          tenant_id: tenantId,
          user_id: userId,
          email: cleanEmail,
          role: "owner",
        },
        { onConflict: "tenant_id,user_id" }
      );

    if (linkErr) {
      return NextResponse.json({ error: linkErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      email: cleanEmail,
      message: `Acesso criado! O cliente já pode entrar em /admin com ${cleanEmail}.`,
    });
  } catch (err) {
    console.error("[POST /api/tenants/[id]/client-user]", err);
    return NextResponse.json(
      { error: "Erro interno ao criar acesso do cliente" },
      { status: 500 }
    );
  }
}

