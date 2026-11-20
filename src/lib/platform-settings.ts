import { createAdminSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

export interface PlatformSettings {
  meta_pixel_id: string;
  gtm_id: string;
  google_ads_id: string;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  meta_pixel_id: "",
  gtm_id: "",
  google_ads_id: "",
};

// Fallback em memória para ambiente local / caso a tabela ainda não exista no Supabase
let memorySettings: PlatformSettings = { ...DEFAULT_SETTINGS };

export async function getPlatformSettings(): Promise<PlatformSettings> {
  if (!isSupabaseConfigured()) {
    return { ...memorySettings };
  }

  try {
    const supabase = createAdminSupabase();
    if (!supabase) return { ...memorySettings };

    const { data, error } = await supabase
      .from("platform_settings")
      .select("meta_pixel_id, gtm_id, google_ads_id")
      .eq("id", "default")
      .maybeSingle();

    if (error || !data) {
      return { ...memorySettings };
    }

    return {
      meta_pixel_id: data.meta_pixel_id || "",
      gtm_id: data.gtm_id || "",
      google_ads_id: data.google_ads_id || "",
    };
  } catch {
    return { ...memorySettings };
  }
}

export async function savePlatformSettings(
  input: Partial<PlatformSettings>
): Promise<{ settings: PlatformSettings; persistedInDb: boolean; warning?: string }> {
  const clean: PlatformSettings = {
    meta_pixel_id: (input.meta_pixel_id ?? "").trim(),
    gtm_id: (input.gtm_id ?? "").trim(),
    google_ads_id: (input.google_ads_id ?? "").trim(),
  };

  memorySettings = clean;

  if (!isSupabaseConfigured()) {
    return { settings: clean, persistedInDb: false };
  }

  try {
    const supabase = createAdminSupabase();
    if (!supabase) {
      return { settings: clean, persistedInDb: false };
    }

    const { error } = await supabase.from("platform_settings").upsert(
      {
        id: "default",
        meta_pixel_id: clean.meta_pixel_id || null,
        gtm_id: clean.gtm_id || null,
        google_ads_id: clean.google_ads_id || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      return {
        settings: clean,
        persistedInDb: false,
        warning:
          "Salvo temporariamente. Rode a migration supabase/migrations/004_platform_settings.sql no Supabase para persistir definitivamente.",
      };
    }

    return { settings: clean, persistedInDb: true };
  } catch {
    return {
      settings: clean,
      persistedInDb: false,
      warning:
        "Salvo temporariamente. Verifique a migration 004_platform_settings.sql no Supabase.",
    };
  }
}

