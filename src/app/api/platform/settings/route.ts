import { NextRequest, NextResponse } from "next/server";
import { isMasterAuthenticated } from "@/lib/auth";
import {
  getPlatformSettings,
  savePlatformSettings,
} from "@/lib/platform-settings";

export async function GET() {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const settings = await getPlatformSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await savePlatformSettings({
      meta_pixel_id: String(body.meta_pixel_id || ""),
      gtm_id: String(body.gtm_id || ""),
      google_ads_id: String(body.google_ads_id || ""),
    });

    return NextResponse.json({
      ok: true,
      settings: result.settings,
      persistedInDb: result.persistedInDb,
      warning: result.warning || null,
    });
  } catch (err) {
    console.error("[PATCH /api/platform/settings]", err);
    return NextResponse.json(
      { error: "Erro ao salvar configurações de pixel" },
      { status: 500 }
    );
  }
}

