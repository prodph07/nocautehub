import { cookies } from "next/headers";
import { isMasterAuthenticated } from "./auth";
import { createServerSupabase, isSupabaseConfigured } from "./supabase/server";

export const CLIENT_SESSION_COOKIE = "nocaute_client_session";

/**
 * Verifica se a requisição tem permissão para administrar um tenant específico.
 * Aceita tanto o dono daquela academia (isolado por tenant_id) quanto o Master Admin.
 */
export async function isTenantAdminAuthenticated(
  tenantId: string
): Promise<boolean> {
  if (await isMasterAuthenticated()) {
    return true;
  }

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    if (!supabase) return false;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from("tenant_users")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .maybeSingle();

    return Boolean(data);
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;
  return token === `tenant:${tenantId}`;
}

