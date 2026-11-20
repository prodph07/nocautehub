import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { getDefaultTrialDays, PLAN_PRICING } from "@/lib/pagarme";
import { buildGoogleMapsEmbedUrl } from "@/components/shared/CepAddressFields";
import {
  createAdminSupabase,
  createServerSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { CLIENT_SESSION_COOKIE } from "@/lib/client-auth";
import type { PlanTier } from "@/types/tenant";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const rawSlug = String(body.slug || "").trim();
    const whatsapp = String(body.whatsapp_number || "").replace(/\D/g, "");
    const address = String(body.address || "").trim() || "Endereço a definir";
    const neighborhood = String(body.neighborhood || "").trim() || "Centro";
    const city = String(body.city || "").trim() || "São Paulo - SP";
    const primaryColor = String(body.primary_color || "#E11D48").trim();
    const planTier: PlanTier =
      body.plan_tier === "essencial" ? "essencial" : "pro";
    const clientEmail = String(body.client_email || "")
      .trim()
      .toLowerCase();
    const clientPassword = String(body.client_password || "");

    if (name.length < 2) {
      return NextResponse.json(
        { error: "Informe o nome da sua academia." },
        { status: 400 }
      );
    }

    if (whatsapp.length < 12) {
      return NextResponse.json(
        { error: "Informe um WhatsApp válido com DDD." },
        { status: 400 }
      );
    }

    if (clientEmail && clientPassword && clientPassword.length < 6) {
      return NextResponse.json(
        { error: "A senha de acesso deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const trialDays = getDefaultTrialDays();
    const regularCents = PLAN_PRICING[planTier].regularCents;

    const tenant = await repository.createTenant({
      name,
      slug: rawSlug || undefined,
      whatsapp_number: whatsapp,
      address,
      neighborhood,
      city,
      google_maps_embed: buildGoogleMapsEmbedUrl({
        address,
        neighborhood,
        city,
      }),
      plan_tier: planTier,
      status: "preview",
      billing_mode: "preview",
      subscription_status: "none",
      monthly_price_cents: regularCents,
      admin_email: clientEmail || undefined,
      admin_password: clientPassword || undefined,
      theme_config: {
        primary: primaryColor,
        secondary: "#F59E0B",
        bg: "#0C0C0C",
        surface: "#141414",
        font_preset: "condensada",
        hero_preset: "full",
      },
      hero_config: {
        eyebrow: `${neighborhood} • ${city}`,
        headline: `TRANSFORME SEU CORPO E SUA MENTE NA ${name.toUpperCase()}`,
        subheadline: `Jiu-Jitsu, Muay Thai e Boxe em ${neighborhood} com metodologia segura para iniciantes do zero, turmas Kids e estrutura completa.`,
        cta_text: "Agendar Aula Experimental Gratuita",
        objection_breaker:
          "Não precisa ter equipamento • Emprestamos luvas/kimono na 1ª aula",
        media_type: "image",
        media_url:
          "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1800&q=85",
        marquee_items: [
          "JIU-JITSU",
          "MUAY THAI",
          "BOXE",
          "DISCIPLINA",
          "DEFESA PESSOAL",
          "TURMA KIDS",
          "CONDICIONAMENTO",
        ],
      },
    });

    const origin = req.nextUrl.origin;
    const checkoutUrl = `${origin}/assinar/${tenant.slug}?trial=${trialDays}`;
    await repository.updateTenant(tenant.id, {
      pagarme_payment_link_id: `transparent_${tenant.slug}_${trialDays}d`,
      pagarme_payment_link_url: checkoutUrl,
    });

    // Se o dono informou e-mail e senha, cria o usuário no Supabase Auth
    if (clientEmail && clientPassword && isSupabaseConfigured()) {
      const adminSupabase = createAdminSupabase();
      if (adminSupabase) {
        let userId: string | null = null;
        const { data: created, error: createErr } =
          await adminSupabase.auth.admin.createUser({
            email: clientEmail,
            password: clientPassword,
            email_confirm: true,
            app_metadata: { role: "client", tenant_id: tenant.id },
          });

        if (createErr) {
          const { data: listData } =
            await adminSupabase.auth.admin.listUsers();
          const existing = listData?.users?.find(
            (u) => u.email?.toLowerCase() === clientEmail
          );
          if (existing) {
            userId = existing.id;
          }
        } else {
          userId = created.user?.id || null;
        }

        if (userId) {
          await adminSupabase.from("tenant_users").upsert(
            {
              tenant_id: tenant.id,
              user_id: userId,
              email: clientEmail,
              role: "owner",
            },
            { onConflict: "tenant_id,user_id" }
          );

          // Autentica a sessão SSR do dono recém-criado
          try {
            const serverSupabase = await createServerSupabase();
            if (serverSupabase) {
              await serverSupabase.auth.signInWithPassword({
                email: clientEmail,
                password: clientPassword,
              });
            }
          } catch {
            // login manual também disponível
          }
        }
      }
    }

    const res = NextResponse.json(
      {
        ok: true,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          plan_tier: tenant.plan_tier,
        },
        previewUrl: `/sites/${tenant.slug}`,
        adminUrl: `/sites/${tenant.slug}/admin`,
        checkoutUrl: `/assinar/${tenant.slug}?trial=${trialDays}`,
      },
      { status: 201 }
    );

    res.cookies.set(CLIENT_SESSION_COOKIE, `tenant:${tenant.id}`, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });

    return res;
  } catch (err) {
    console.error("[POST /api/public/onboarding]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Não foi possível gerar seu site agora. Tente novamente.",
      },
      { status: 500 }
    );
  }
}
