import { NextRequest, NextResponse } from "next/server";
import {
  getLocalMasterCredentials,
  isSupabaseUserMaster,
  MASTER_SESSION_COOKIE,
} from "@/lib/auth";
import { CLIENT_SESSION_COOKIE } from "@/lib/client-auth";
import {
  createAdminSupabase,
  createServerSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { repository } from "@/lib/repository";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Informe e-mail e senha" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabase();
      if (!supabase) {
        return NextResponse.json(
          { error: "Erro ao inicializar Supabase" },
          { status: 500 }
        );
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: String(password),
      });

      if (error || !data.user) {
        return NextResponse.json(
          { error: "E-mail ou senha inválidos" },
          { status: 401 }
        );
      }

      const isMaster = await isSupabaseUserMaster(data.user);
      if (isMaster) {
        return NextResponse.json({
          ok: true,
          role: "master",
          redirectTo: "/master",
          mode: "supabase",
        });
      }

      // É um dono de academia: busca o tenant vinculado e redireciona direto para /sites/<slug>/admin
      const admin = createAdminSupabase();
      if (admin) {
        const { data: membership } = await admin
          .from("tenant_users")
          .select("tenant_id")
          .eq("user_id", data.user.id)
          .limit(1)
          .maybeSingle();

        if (membership?.tenant_id) {
          const tenant = await repository.getTenantById(membership.tenant_id);
          if (tenant) {
            return NextResponse.json({
              ok: true,
              role: "client",
              redirectTo: `/sites/${tenant.slug}/admin`,
              mode: "supabase",
            });
          }
        }
      }

      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Esta conta não está vinculada a nenhuma academia ativa." },
        { status: 403 }
      );
    }

    // MODO LOCAL: primeiro verifica se é Master
    const creds = getLocalMasterCredentials();
    if (
      cleanEmail === creds.email.toLowerCase() &&
      String(password) === creds.password
    ) {
      const res = NextResponse.json({
        ok: true,
        role: "master",
        redirectTo: "/master",
        mode: "local",
      });
      res.cookies.set(MASTER_SESSION_COOKIE, "local_master_authenticated_v1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    // MODO LOCAL: verifica se pertence a alguma academia
    const tenants = await repository.listTenants();
    const matchedTenant = tenants.find((t) => {
      const expectedEmail = (
        t.admin_email || `dono@${t.slug}.com.br`
      ).toLowerCase();
      const expectedPass = t.admin_password || "academia123";
      return cleanEmail === expectedEmail && String(password) === expectedPass;
    });

    if (matchedTenant) {
      const res = NextResponse.json({
        ok: true,
        role: "client",
        redirectTo: `/sites/${matchedTenant.slug}/admin`,
        mode: "local",
      });
      res.cookies.set(CLIENT_SESSION_COOKIE, `tenant:${matchedTenant.id}`, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    return NextResponse.json(
      { error: "E-mail ou senha inválidos" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Erro ao autenticar" },
      { status: 500 }
    );
  }
}
