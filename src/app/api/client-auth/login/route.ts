import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { CLIENT_SESSION_COOKIE } from "@/lib/client-auth";
import {
  createServerSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { tenantId, email, password } = await req.json();
    if (!tenantId || !email || !password) {
      return NextResponse.json(
        { error: "Informe e-mail e senha" },
        { status: 400 }
      );
    }

    const tenant = await repository.getTenantById(tenantId);
    if (!tenant) {
      return NextResponse.json(
        { error: "Academia não encontrada" },
        { status: 404 }
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabase();
      if (!supabase) {
        return NextResponse.json(
          { error: "Erro ao conectar ao Supabase" },
          { status: 500 }
        );
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        return NextResponse.json(
          { error: "E-mail ou senha inválidos" },
          { status: 401 }
        );
      }

      const { data: membership } = await supabase
        .from("tenant_users")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!membership) {
        await supabase.auth.signOut();
        return NextResponse.json(
          { error: "Usuário não autorizado para esta academia" },
          { status: 403 }
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Modo Local: valida contra admin_email / admin_password da academia (ou padrão)
    const expectedEmail = (
      tenant.admin_email || `dono@${tenant.slug}.com.br`
    ).toLowerCase();
    const expectedPassword = tenant.admin_password || "academia123";

    if (
      String(email).trim().toLowerCase() !== expectedEmail ||
      String(password) !== expectedPassword
    ) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(CLIENT_SESSION_COOKIE, `tenant:${tenantId}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Erro ao autenticar" }, { status: 500 });
  }
}

