import fs from "fs";
import path from "path";
import crypto from "crypto";
import type {
  TenantWithRelations,
  Lead,
  TenantStatus,
  AnalyticsEvent,
  AnalyticsEventType,
  WeeklyAnalyticsSummary,
} from "@/types/tenant";
import { createDemoSeedData, DEFAULT_DEMO_TENANT_ID } from "./defaults";

interface LocalDatabase {
  tenants: TenantWithRelations[];
  leads: Lead[];
  analytics?: AnalyticsEvent[];
}

function generateDemoAnalytics(): AnalyticsEvent[] {
  const events: AnalyticsEvent[] = [];
  const dailyVisits = [28, 34, 41, 37, 52, 46, 39];
  const dailyClicks = [5, 7, 9, 6, 12, 10, 8];

  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const idx = 6 - daysAgo;
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - daysAgo);
    baseDate.setHours(14, 0, 0, 0);

    for (let v = 0; v < dailyVisits[idx]; v++) {
      events.push({
        id: crypto.randomUUID(),
        tenant_id: DEFAULT_DEMO_TENANT_ID,
        event_type: "page_view",
        source: "instagram",
        created_at: baseDate.toISOString(),
      });
    }
    for (let c = 0; c < dailyClicks[idx]; c++) {
      events.push({
        id: crypto.randomUUID(),
        tenant_id: DEFAULT_DEMO_TENANT_ID,
        event_type: "whatsapp_click",
        source: "mini-funnel",
        created_at: baseDate.toISOString(),
      });
    }
  }
  return events;
}

const DATA_DIR = path.join(process.cwd(), ".local-data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function readDb(): LocalDatabase {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const seed = createDemoSeedData();
      writeDb(seed);
      return seed;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as LocalDatabase;
    if (!parsed.tenants || parsed.tenants.length === 0) {
      const seed = createDemoSeedData();
      writeDb(seed);
      return seed;
    }
    return parsed;
  } catch {
    return createDemoSeedData();
  }
}

function writeDb(db: LocalDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("[local-store] Erro ao gravar db.json:", err);
  }
}

export const localStore = {
  listTenants(): TenantWithRelations[] {
    const db = readDb();
    return db.tenants.map((t) => ({
      ...t,
      leads_count: db.leads.filter((l) => l.tenant_id === t.id).length,
    }));
  },

  getTenantByDomainOrSlug(identifier: string): TenantWithRelations | null {
    const db = readDb();
    const clean = identifier.toLowerCase().trim();
    const found = db.tenants.find(
      (t) =>
        t.slug.toLowerCase() === clean ||
        (t.custom_domain && t.custom_domain.toLowerCase() === clean)
    );
    return found ?? null;
  },

  getTenantById(id: string): TenantWithRelations | null {
    const db = readDb();
    const found = db.tenants.find((t) => t.id === id);
    if (!found) return null;
    return {
      ...found,
      leads_count: db.leads.filter((l) => l.tenant_id === found.id).length,
    };
  },

  createTenant(input: Partial<TenantWithRelations>): TenantWithRelations {
    const db = readDb();
    const seed = createDemoSeedData().tenants[0];
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const baseSlug = (input.slug || input.name || "nova-academia")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    let slug = baseSlug || `academia-${Date.now()}`;
    if (db.tenants.some((t) => t.slug === slug)) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const modalityIdMap = new Map<string, string>();
    const modalities = (input.modalities ?? seed.modalities).map((m, idx) => {
      const newId = crypto.randomUUID();
      modalityIdMap.set(m.id, newId);
      return { ...m, id: newId, tenant_id: id, display_order: idx + 1 };
    });

    const schedules = (input.schedules ?? seed.schedules)
      .map((s) => {
        const mappedModId = modalityIdMap.get(s.modality_id) ?? modalities[0]?.id;
        if (!mappedModId) return null;
        return {
          ...s,
          id: crypto.randomUUID(),
          tenant_id: id,
          modality_id: mappedModId,
        };
      })
      .filter((s): s is NonNullable<typeof s> => Boolean(s));

    const instructors = (input.instructors ?? seed.instructors).map((i, idx) => ({
      ...i,
      id: crypto.randomUUID(),
      tenant_id: id,
      display_order: idx + 1,
    }));

    const testimonials = (input.testimonials ?? seed.testimonials).map((t) => ({
      ...t,
      id: crypto.randomUUID(),
      tenant_id: id,
    }));

    const newTenant: TenantWithRelations = {
      ...seed,
      ...input,
      id,
      slug,
      custom_domain: input.custom_domain || null,
      name: input.name || "Nova Academia de Luta",
      status: input.status || "active",
      created_at: now,
      updated_at: now,
      modalities,
      schedules,
      instructors,
      testimonials,
    };

    db.tenants.unshift(newTenant);
    writeDb(db);
    return newTenant;
  },

  updateTenant(
    id: string,
    payload: Partial<TenantWithRelations>
  ): TenantWithRelations | null {
    const db = readDb();
    const idx = db.tenants.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const existing = db.tenants[idx];
    const updated: TenantWithRelations = {
      ...existing,
      ...payload,
      id: existing.id,
      updated_at: new Date().toISOString(),
    };

    db.tenants[idx] = updated;
    writeDb(db);
    return updated;
  },

  updateTenantStatus(id: string, status: TenantStatus): TenantWithRelations | null {
    return this.updateTenant(id, { status });
  },

  duplicateTenant(sourceId: string): TenantWithRelations | null {
    const source = this.getTenantById(sourceId);
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

  deleteTenant(id: string): boolean {
    const db = readDb();
    const before = db.tenants.length;
    db.tenants = db.tenants.filter((t) => t.id !== id);
    db.leads = db.leads.filter((l) => l.tenant_id !== id);
    if (db.tenants.length === before) return false;
    writeDb(db);
    return true;
  },

  listLeads(tenantId?: string): Lead[] {
    const db = readDb();
    const filtered = tenantId
      ? db.leads.filter((l) => l.tenant_id === tenantId)
      : db.leads;
    return filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  createLead(input: Omit<Lead, "id" | "created_at" | "status">): Lead {
    const db = readDb();
    const lead: Lead = {
      ...input,
      id: crypto.randomUUID(),
      status: "novo",
      created_at: new Date().toISOString(),
    };
    db.leads.unshift(lead);
    writeDb(db);
    return lead;
  },

  updateLeadStatus(id: string, status: Lead["status"]): Lead | null {
    const db = readDb();
    const idx = db.leads.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    db.leads[idx] = { ...db.leads[idx], status };
    writeDb(db);
    return db.leads[idx];
  },

  recordAnalyticsEvent(
    tenantId: string,
    eventType: AnalyticsEventType,
    source?: string | null
  ): void {
    const db = readDb();
    if (!db.analytics) {
      db.analytics = generateDemoAnalytics();
    }
    db.analytics.push({
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      event_type: eventType,
      source: source || null,
      created_at: new Date().toISOString(),
    });
    writeDb(db);
  },

  getWeeklyAnalytics(tenantId: string): WeeklyAnalyticsSummary {
    const db = readDb();
    if (!db.analytics) {
      db.analytics = generateDemoAnalytics();
      writeDb(db);
    }

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

    for (const ev of db.analytics) {
      if (ev.tenant_id !== tenantId) continue;
      const key = ev.created_at.slice(0, 10);
      const bucket = dailyMap.get(key);
      if (!bucket) continue;
      if (ev.event_type === "page_view") {
        bucket.visits += 1;
        visits += 1;
      } else if (ev.event_type === "whatsapp_click") {
        bucket.whatsappClicks += 1;
        whatsappClicks += 1;
      }
    }

    const conversionRate =
      visits > 0 ? Number(((whatsappClicks / visits) * 100).toFixed(1)) : 0;

    return {
      visits,
      whatsappClicks,
      conversionRate,
      daily: Array.from(dailyMap.values()),
    };
  },
};

