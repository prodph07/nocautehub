import { NextRequest, NextResponse } from "next/server";
import {
  getLocalMasterCredentials,
  MASTER_SESSION_COOKIE,
} from "@/lib/auth";
import {
  createServerSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Informe e-mail e senha" },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabase();
      if (!supabase) {
        return NextResponse.json(
          { error: "Erro ao inicializar Supabase" },
          { status: 500 }
        );
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json(
          { error: "Credenciais inválidas" },
          { status: 401 }
        );
      }

      return NextResponse.json({ ok: true, mode: "supabase" });
    }

    const creds = getLocalMasterCredentials();
    if (
      String(email).trim().toLowerCase() !== creds.email.toLowerCase() ||
      String(password) !== creds.password
    ) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos (Modo Local)" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true, mode: "local" });
    res.cookies.set(MASTER_SESSION_COOKIE, "local_master_authenticated_v1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: "Erro ao autenticar" },
      { status: 500 }
    );
  }
}

