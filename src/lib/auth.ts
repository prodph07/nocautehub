import { cookies } from "next/headers";
import { createServerSupabase, isSupabaseConfigured } from "./supabase/server";

export const MASTER_SESSION_COOKIE = "nocaute_master_session";

export function getLocalMasterCredentials() {
  return {
    email: process.env.MASTER_ADMIN_EMAIL || "admin@nocautehub.com.br",
    password: process.env.MASTER_ADMIN_PASSWORD || "nocaute123",
  };
}

export async function isMasterAuthenticated(): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    if (!supabase) return false;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return Boolean(user);
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(MASTER_SESSION_COOKIE)?.value;
  return token === "local_master_authenticated_v1";
}

