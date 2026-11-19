import { cookies } from "next/headers";
import {
  createAdminSupabase,
  createServerSupabase,
  isSupabaseConfigured,
} from "./supabase/server";

export const MASTER_SESSION_COOKIE = "nocaute_master_session";

export function getLocalMasterCredentials() {
  return {
    email: process.env.MASTER_ADMIN_EMAIL || "admin@nocautehub.com.br",
    password: process.env.MASTER_ADMIN_PASSWORD || "nocaute123",
  };
}

/**
 * Determina se um usuário autenticado no Supabase Auth é um administrador Master.
 * Bloqueia qualquer conta marcada como 'client' ou vinculada a uma academia em tenant_users.
 */
export async function isSupabaseUserMaster(user: {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
}): Promise<boolean> {
  if (user.app_metadata?.role === "master") {
    return true;
  }

  const configuredMasters = (process.env.MASTER_ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (user.email && configuredMasters.includes(user.email.toLowerCase())) {
    return true;
  }

  // Se estiver explicitamente marcado como cliente, nega acesso Master
  if (user.app_metadata?.role === "client") {
    return false;
  }

  // Verifica se pertence à tabela tenant_users (dono/staff de academia)
  const admin = createAdminSupabase();
  if (admin) {
    const { data } = await admin
      .from("tenant_users")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (data) {
      return false;
    }
  }

  return true;
}

export async function isMasterAuthenticated(): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    if (!supabase) return false;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    return isSupabaseUserMaster(user);
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(MASTER_SESSION_COOKIE)?.value;
  return token === "local_master_authenticated_v1";
}
