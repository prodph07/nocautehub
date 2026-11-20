import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isMasterAuthenticated } from "@/lib/auth";
import {
  createAdminSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export async function GET() {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const tenants = await repository.listTenants();
  return NextResponse.json({ tenants, localMode: repository.isLocalMode() });
}

export async function POST(req: NextRequest) {
  const authed = await isMasterAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { client_email, client_password, ...tenantInput } = body;

    const planTier: "essencial" | "pro" =
      tenantInput.plan_tier === "essencial" ? "essencial" : "pro";
    const isPartner = tenantInput.billing_mode === "partner";
    const initialStatus =
      tenantInput.status || (isPartner ? "active" : "preview");
    const initialBillingMode =
      tenantInput.billing_mode || (initialStatus === "active" ? "partner" : "preview");
    const initialSubStatus = tenantInput.subscription_status || "none";

    const tenant = await repository.createTenant({
      ...tenantInput,
      plan_tier: planTier,
      status: initialStatus,
      billing_mode: initialBillingMode,
      subscription_status: initialSubStatus,
      monthly_price_cents: planTier === "pro" ? 9700 : 4700,
      admin_email: client_email
        ? String(client_email).trim().toLowerCase()
        : undefined,
      admin_password: client_password ? String(client_password) : undefined,
    });

    // Se e-mail e senha do dono foram informados, já cria o login vinculado no Supabase Auth
    let clientAccessCreated = false;
    let clientAccessWarning: string | null = null;

    if (client_email && client_password) {
      const cleanEmail = String(client_email).trim().toLowerCase();
      if (isSupabaseConfigured()) {
        const adminSupabase = createAdminSupabase();
        if (adminSupabase) {
          let userId: string | null = null;
          const { data: created, error: createErr } =
            await adminSupabase.auth.admin.createUser({
              email: cleanEmail,
              password: String(client_password),
              email_confirm: true,
              app_metadata: { role: "client", tenant_id: tenant.id },
            });

          if (createErr) {
            const { data: listData } =
              await adminSupabase.auth.admin.listUsers();
            const existing = listData?.users?.find(
              (u) => u.email?.toLowerCase() === cleanEmail
            );
            if (existing) {
              userId = existing.id;
              await adminSupabase.auth.admin.updateUserById(userId, {
                password: String(client_password),
                email_confirm: true,
                app_metadata: { role: "client", tenant_id: tenant.id },
              });
            } else {
              clientAccessWarning = createErr.message;
            }
          } else {
            userId = created.user?.id || null;
          }

          if (userId) {
            await adminSupabase.from("tenant_users").upsert(
              {
                tenant_id: tenant.id,
                user_id: userId,
                email: cleanEmail,
                role: "owner",
              },
              { onConflict: "tenant_id,user_id" }
            );
            clientAccessCreated = true;
          }
        }
      } else {
        clientAccessCreated = true;
      }
    }

    return NextResponse.json(
      { tenant, clientAccessCreated, clientAccessWarning },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/tenants]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar academia" },
      { status: 500 }
    );
  }
}
