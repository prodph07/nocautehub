import { NextResponse } from "next/server";
import { CLIENT_SESSION_COOKIE } from "@/lib/client-auth";
import {
  createServerSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export async function POST() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    if (supabase) await supabase.auth.signOut();
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(CLIENT_SESSION_COOKIE);
  return res;
}

