import type {
  TenantWithRelations,
  Lead,
  TenantStatus,
  Modality,
  ScheduleItem,
  Instructor,
  Testimonial,
  AnalyticsEventType,
  WeeklyAnalyticsSummary,
} from "@/types/tenant";
import {
  isSupabaseConfigured,
  createServerSupabase,
  createAdminSupabase,
} from "./supabase/server";
import { localStore } from "./local-store";
import { createDemoSeedData } from "./defaults";

async function hydrateSupabaseTenant(
  tenantRow: Record<string, unknown>
): Promise<TenantWithRelations> {
  const supabase = (await createServerSupabase()) ?? createAdminSupabase();
  if (!supabase) {
    return tenantRow as unknown as TenantWithRelations;
  }

  const tenantId = String(tenantRow.id);
  const [mods, scheds, insts, tests, leadsCount] = await Promise.all([
    supabase
      .from("modalities")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("display_order", { ascending: true }),
    supabase
      .from("schedules")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("start_time", { ascending: true }),
    supabase
      .from("instructors")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("display_order", { ascending: true }),
    supabase.from("testimonials").select("*").eq("tenant_id", tenantId),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
  ]);

  return {
    ...(tenantRow as unknown as TenantWithRelations),
    modalities: (mods.data ?? []) as Modality[],
    schedules: (scheds.data ?? []) as ScheduleItem[],
    instructors: (insts.data ?? []) as Instructor[],
    testimonials: (tests.data ?? []) as Testimonial[],
    leads_count: leadsCount.count ?? 0,
  };
}

export const repository = {
  isLocalMode(): boolean {
    return !isSupabaseConfigured();
  },

  async listTenants(): Promise<TenantWithRelations[]> {
    if (!isSupabaseConfigured()) {
      return localStore.listTenants();
    }

    const supabase = createAdminSupabase() ?? (await createServerSupabase());
    if (!supabase) return localStore.listTenants();

    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return Promise.all(data.map((row) => hydrateSupabaseTenant(row)));
  },

  async getTenantByDomainOrSlug(
    identifier: string
  ): Promise<TenantWithRelations | null> {
    if (!isSupabaseConfigured()) {
      return localStore.getTenantByDomainOrSlug(identifier);
    }

    const supabase = (await createServerSupabase()) ?? createAdminSupabase();
    if (!supabase) return localStore.getTenantByDomainOrSlug(identifier);

    const clean = identifier.toLowerCase().trim();
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .or(`slug.eq.${clean},custom_domain.eq.${clean}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return hydrateSupabaseTenant(data);
  },

  async getTenantById(id: string): Promise<TenantWithRelations | null> {
    if (!isSupabaseConfigured()) {
      return localStore.getTenantById(id);
    }

    const supabase = createAdminSupabase() ?? (await createServerSupabase());
    if (!supabase) return localStore.getTenantById(id);

    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return hydrateSupabaseTenant(data);
  },

  async createTenant(
    input: Partial<TenantWithRelations>
  ): Promise<TenantWithRelations> {
    if (!isSupabaseConfigured()) {
      return localStore.createTenant(input);
    }

    const supabase = createAdminSupabase() ?? (await createServerSupabase());
    if (!supabase) return localStore.createTenant(input);

    const seed = createDemoSeedData().tenants[0];
    const baseSlug = (input.slug || input.name || "nova-academia")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const {
      modalities: inputMods,
      schedules: inputScheds,
      instructors: inputInsts,
      testimonials: inputTests,
      leads_count: _lc,
      admin_email: _ae,
      admin_password: _ap,
      id: _id,
      created_at: _ca,
      updated_at: _ua,
      ...rest
    } = { ...seed, ...input };

    let slug = baseSlug || `academia-${Date.now()}`;
    const { data: existingSlug } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existingSlug) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const { data: created, error } = await supabase
      .from("tenants")
      .insert({
        ...rest,
        slug,
        custom_domain: input.custom_domain || null,
      })
      .select("*")
      .single();

    if (error || !created) {
      throw new Error(error?.message || "Erro ao criar academia no Supabase");
    }

    const tenantId = created.id as string;

    const modsToInsert = (inputMods ?? seed.modalities).map((m, idx) => ({
      tenant_id: tenantId,
      name: m.name,
      short_desc: m.short_desc,
      image_url: m.image_url,
      target_audience: m.target_audience,
      display_order: idx + 1,
    }));

    const { data: insertedMods } = await supabase
      .from("modalities")
      .insert(modsToInsert)
      .select("*");

    const modIdMap = new Map<string, string>();
    (inputMods ?? seed.modalities).forEach((oldM, i) => {
      if (insertedMods?.[i]?.id) {
        modIdMap.set(oldM.id, insertedMods[i].id);
      }
    });

    const schedsToInsert = (inputScheds ?? seed.schedules)
      .map((s) => {
        const mapped = modIdMap.get(s.modality_id) ?? insertedMods?.[0]?.id;
        if (!mapped) return null;
        return {
          tenant_id: tenantId,
          modality_id: mapped,
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          instructor_name: s.instructor_name,
          level: s.level,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (schedsToInsert.length > 0) {
      await supabase.from("schedules").insert(schedsToInsert);
    }

    const instsToInsert = (inputInsts ?? seed.instructors).map((inst, idx) => ({
      tenant_id: tenantId,
      name: inst.name,
      rank: inst.rank,
      lineage: inst.lineage,
      experience_years: inst.experience_years,
      bio: inst.bio,
      photo_url: inst.photo_url,
      display_order: idx + 1,
    }));

    if (instsToInsert.length > 0) {
      await supabase.from("instructors").insert(instsToInsert);
    }

    const testsToInsert = (inputTests ?? seed.testimonials).map((t) => ({
      tenant_id: tenantId,
      author_name: t.author_name,
      role_or_modality: t.role_or_modality,
      rating: t.rating,
      text: t.text,
      avatar_url: t.avatar_url,
      source: t.source,
    }));

    if (testsToInsert.length > 0) {
      await supabase.from("testimonials").insert(testsToInsert);
    }

    return hydrateSupabaseTenant(created);
  },

  async updateTenant(
    id: string,
    payload: Partial<TenantWithRelations>
  ): Promise<TenantWithRelations | null> {
    if (!isSupabaseConfigured()) {
      return localStore.updateTenant(id, payload);
    }

    const supabase = createAdminSupabase() ?? (await createServerSupabase());
    if (!supabase) return localStore.updateTenant(id, payload);

    const {
      modalities,
      schedules,
      instructors,
      testimonials,
      leads_count: _lc,
      admin_email: _ae,
      admin_password: _ap,
      id: _id,
      created_at: _ca,
      updated_at: _ua,
      ...tenantFields
    } = payload;

    if (Object.keys(tenantFields).length > 0) {
      const { error } = await supabase
        .from("tenants")
        .update(tenantFields)
        .eq("id", id);
      if (error) throw new Error(error.message);
    }

    if (modalities) {
      const { error: delModErr } = await supabase
        .from("modalities")
        .delete()
        .eq("tenant_id", id);
      if (delModErr) throw new Error(delModErr.message);

      if (modalities.length > 0) {
        const { error: insModErr } = await supabase.from("modalities").insert(
          modalities.map((m, idx) => ({
            id: m.id,
            tenant_id: id,
            name: m.name,
            short_desc: m.short_desc,
            image_url: m.image_url,
            target_audience: m.target_audience,
            display_order: idx + 1,
          }))
        );
        if (insModErr) throw new Error(insModErr.message);
      }
    }

    if (schedules) {
      const { error: delSchedErr } = await supabase
        .from("schedules")
        .delete()
        .eq("tenant_id", id);
      if (delSchedErr) throw new Error(delSchedErr.message);

      const validSchedules = schedules.filter(
        (s) => s.modality_id && s.modality_id.length > 10
      );
      if (validSchedules.length > 0) {
        const { error: insSchedErr } = await supabase.from("schedules").insert(
          validSchedules.map((s) => ({
            tenant_id: id,
            modality_id: s.modality_id,
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
            instructor_name: s.instructor_name,
            level: s.level,
          }))
        );
        if (insSchedErr) throw new Error(insSchedErr.message);
      }
    }

    if (instructors) {
      await supabase.from("instructors").delete().eq("tenant_id", id);
      if (instructors.length > 0) {
        await supabase.from("instructors").insert(
          instructors.map((inst, idx) => ({
            tenant_id: id,
            name: inst.name,
            rank: inst.rank,
            lineage: inst.lineage,
            experience_years: inst.experience_years,
            bio: inst.bio,
            photo_url: inst.photo_url,
            display_order: idx + 1,
          }))
        );
      }
    }

    if (testimonials) {
      await supabase.from("testimonials").delete().eq("tenant_id", id);
      if (testimonials.length > 0) {
        await supabase.from("testimonials").insert(
          testimonials.map((t) => ({
            tenant_id: id,
            author_name: t.author_name,
            role_or_modality: t.role_or_modality,
            rating: t.rating,
            text: t.text,
            avatar_url: t.avatar_url,
            source: t.source,
          }))
        );
      }
    }

    return this.getTenantById(id);
  },

  async updateTenantStatus(
    id: string,
    status: TenantStatus
  ): Promise<TenantWithRelations | null> {
    return this.updateTenant(id, { status });
  },

  async duplicateTenant(sourceId: string): Promise<TenantWithRelations | null> {
    if (!isSupabaseConfigured()) {
      return localStore.duplicateTenant(sourceId);
    }

    const source = await this.getTenantById(sourceId);
    if (!source) return null;

    const suffix = Math.floor(100 + Math.random() * 900);
    return this.createTenant({
      ...source,
      name: `${source.name} (Demo)`,
      slug: `demo-${source.slug.replace(/^demo-/, "")}-${suffix}`,
      custom_domain: null,
      domain_status: "pending",
      cloudflare_hostname_id: null,
      status: "active",
    });
  },

  async deleteTenant(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return localStore.deleteTenant(id);
    }

    const supabase = createAdminSupabase() ?? (await createServerSupabase());
    if (!supabase) return false;

    const { error } = await supabase.from("tenants").delete().eq("id", id);
    return !error;
  },

  async listLeads(tenantId?: string): Promise<Lead[]> {
    if (!isSupabaseConfigured()) {
      return localStore.listLeads(tenantId);
    }

    const supabase = createAdminSupabase() ?? (await createServerSupabase());
    if (!supabase) return [];

    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data } = await query;
    return (data ?? []) as Lead[];
  },

  async createLead(
    input: Omit<Lead, "id" | "created_at" | "status">
  ): Promise<Lead> {
    if (!isSupabaseConfigured()) {
      return localStore.createLead(input);
    }

    const supabase = createAdminSupabase() ?? (await createServerSupabase());
    if (!supabase) return localStore.createLead(input);

    const { data, error } = await supabase
      .from("leads")
      .insert({ ...input, status: "novo" })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Erro ao registrar lead");
    }
    return data as Lead;
  },

  async updateLeadStatus(
    id: string,
    status: Lead["status"]
  ): Promise<Lead | null> {
    if (!isSupabaseConfigured()) {
      return localStore.updateLeadStatus(id, status);
    }

    const supabase = createAdminSupabase() ?? (await createServerSupabase());
    if (!supabase) return null;

    const { data } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

    return (data as Lead) ?? null;
  },

  async recordAnalyticsEvent(
    tenantId: string,
    eventType: AnalyticsEventType,
    source?: string | null
  ): Promise<void> {
    if (!isSupabaseConfigured()) {
      localStore.recordAnalyticsEvent(tenantId, eventType, source);
      return;
    }

    const supabase = createAdminSupabase() ?? (await createServerSupabase());
    if (!supabase) return;

    await supabase.from("analytics_events").insert({
      tenant_id: tenantId,
      event_type: eventType,
      source: source || null,
    });
  },

  async getWeeklyAnalytics(tenantId: string): Promise<WeeklyAnalyticsSummary> {
    if (!isSupabaseConfigured()) {
      return localStore.getWeeklyAnalytics(tenantId);
    }

    const supabase = createAdminSupabase() ?? (await createServerSupabase());
    if (!supabase) return localStore.getWeeklyAnalytics(tenantId);

    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("analytics_events")
      .select("event_type, created_at")
      .eq("tenant_id", tenantId)
      .gte("created_at", since.toISOString());

    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const dailyMap = new Map<
      string,
      { date: string; label: string; visits: number; whatsappClicks: number }
    >();

    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, {
        date: key,
        label: dayNames[d.getDay()],
        visits: 0,
        whatsappClicks: 0,
      });
    }

    let visits = 0;
    let whatsappClicks = 0;
    for (const row of data ?? []) {
      const key = String(row.created_at).slice(0, 10);
      const bucket = dailyMap.get(key);
      if (!bucket) continue;
      if (row.event_type === "page_view") {
        bucket.visits += 1;
        visits += 1;
      } else if (row.event_type === "whatsapp_click") {
        bucket.whatsappClicks += 1;
        whatsappClicks += 1;
      }
    }

    return {
      visits,
      whatsappClicks,
      conversionRate:
        visits > 0 ? Number(((whatsappClicks / visits) * 100).toFixed(1)) : 0,
      daily: Array.from(dailyMap.values()),
    };
  },
};
