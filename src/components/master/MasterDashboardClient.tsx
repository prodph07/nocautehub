"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  ExternalLink,
  Copy,
  Pencil,
  Power,
  Trash2,
  LogOut,
  Users,
  Building2,
  CheckCircle2,
  PauseCircle,
  Database,
  Loader2,
  X,
} from "lucide-react";
import type { TenantWithRelations } from "@/types/tenant";
import { BRAND_COLOR_PRESETS } from "@/lib/colors";
import { WhatsAppInput } from "@/components/shared/WhatsAppInput";
import {
  CepAddressFields,
  buildGoogleMapsEmbedUrl,
} from "@/components/shared/CepAddressFields";

interface MasterDashboardClientProps {
  initialTenants: TenantWithRelations[];
  localMode: boolean;
}

export function MasterDashboardClient({
  initialTenants,
  localMode,
}: MasterDashboardClientProps) {
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantWithRelations[]>(initialTenants);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Form Nova Academia
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newNeighborhood, setNewNeighborhood] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newColor, setNewColor] = useState("#E11D48");
  const [newPlanTier, setNewPlanTier] = useState<"essencial" | "pro">("pro");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPassword, setNewClientPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const activeCount = tenants.filter((t) => t.status === "active").length;
  const suspendedCount = tenants.filter((t) => t.status === "suspended").length;
  const totalLeads = tenants.reduce((acc, t) => acc + (t.leads_count || 0), 0);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/master/login");
    router.refresh();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const cleanWa = newWhatsapp.replace(/\D/g, "");
    if (cleanWa.length < 12) {
      setCreateError("Informe um WhatsApp válido com DDD (ex: (11) 99999-9999).");
      return;
    }

    setCreating(true);
    setCreateError("");

    try {
      const addrObj = {
        address: newAddress.trim() || "Endereço a definir",
        neighborhood: newNeighborhood.trim() || "Centro",
        city: newCity.trim() || "São Paulo - SP",
      };

      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          slug: newSlug.trim() || undefined,
          whatsapp_number: cleanWa,
          address: addrObj.address,
          neighborhood: addrObj.neighborhood,
          city: addrObj.city,
          google_maps_embed: buildGoogleMapsEmbedUrl(addrObj),
          plan_tier: newPlanTier,
          client_email: newClientEmail.trim() || undefined,
          client_password: newClientPassword || undefined,
          theme_config: {
            primary: newColor,
            secondary: "#F59E0B",
            bg: "#0C0C0C",
            surface: "#141414",
            font_preset: "condensada",
            hero_preset: "full",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Não foi possível criar a academia.");
        return;
      }
      if (data.tenant) {
        setTenants((prev) => [{ ...data.tenant, leads_count: 0 }, ...prev]);
        setCreateOpen(false);
        setNewName("");
        setNewSlug("");
        setNewWhatsapp("");
        setNewAddress("");
        setNewNeighborhood("");
        setNewCity("");
        setNewClientEmail("");
        setNewClientPassword("");
      }
    } catch {
      setCreateError("Erro de conexão ao criar academia. Tente novamente.");
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/tenants/${id}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.tenant) {
        setTenants((prev) => [{ ...data.tenant, leads_count: 0 }, ...prev]);
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleStatus = async (tenant: TenantWithRelations) => {
    const nextStatus = tenant.status === "active" ? "suspended" : "active";
    setBusyId(tenant.id);
    try {
      const res = await fetch(`/api/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setTenants((prev) =>
          prev.map((t) => (t.id === tenant.id ? { ...t, status: nextStatus } : t))
        );
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleChangePlan = async (
    tenant: TenantWithRelations,
    nextPlan: "essencial" | "pro"
  ) => {
    if (tenant.plan_tier === nextPlan) return;
    setBusyId(tenant.id);
    try {
      const res = await fetch(`/api/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_tier: nextPlan }),
      });
      if (res.ok) {
        setTenants((prev) =>
          prev.map((t) =>
            t.id === tenant.id ? { ...t, plan_tier: nextPlan } : t
          )
        );
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (tenant: TenantWithRelations) => {
    if (!confirm(`Tem certeza que deseja excluir "${tenant.name}" e todos os seus dados?`)) {
      return;
    }
    setBusyId(tenant.id);
    try {
      const res = await fetch(`/api/tenants/${tenant.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTenants((prev) => prev.filter((t) => t.id !== tenant.id));
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-neutral-100">
      {/* Topbar Master */}
      <header className="border-b border-white/10 bg-[#101012] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center font-display font-bold text-white"
            >
              NH
            </Link>
            <div>
              <h1 className="font-display text-lg uppercase tracking-wider text-white leading-none">
                Nocaute Hub • Painel Master
              </h1>
              <span className="text-[11px] text-neutral-400">
                Gestão Multi-Tenant (Fase 1 — MVP 1.0)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Academia</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Aviso de Modo Local */}
        {localMode && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/25 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-100">
                <strong>Modo Local Ativo:</strong> Todas as edições, demos e leads estão sendo salvos localmente em{" "}
                <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-300">.local-data/db.json</code>. Quando criar seu projeto no Supabase, basta rodar{" "}
                <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-300">supabase/migrations/001_initial_schema.sql</code> e preencher o <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-300">.env.local</code>.
              </div>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total de Academias", value: tenants.length, icon: Building2, color: "text-white" },
            { label: "Sites Ativos", value: activeCount, icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Sites Suspensos", value: suspendedCount, icon: PauseCircle, color: "text-amber-400" },
            { label: "Leads Capturados", value: totalLeads, icon: Users, color: "text-rose-400" },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">{kpi.label}</span>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
                <p className={`font-display text-3xl font-bold mt-2 ${kpi.color}`}>
                  {kpi.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Lista de Academias */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl uppercase text-white">
              Academias Cadastradas
            </h2>
            <span className="text-xs text-neutral-400">
              Clique em <strong>Duplicar Demo</strong> para gerar um link de prospecção em 2 segundos
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {tenants.map((tenant) => {
              const isBusy = busyId === tenant.id;
              const isActive = tenant.status === "active";
              return (
                <div
                  key={tenant.id}
                  className="glass-card rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-white text-lg shrink-0 border border-white/15"
                      style={{ backgroundColor: tenant.theme_config?.primary || "#E11D48" }}
                    >
                      {tenant.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-xl uppercase text-white truncate">
                          {tenant.name}
                        </h3>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isActive
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {isActive ? "Ativo" : "Suspenso"}
                        </span>
                        <div className="inline-flex items-center rounded-full bg-black/50 border border-white/10 p-0.5">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleChangePlan(tenant, "essencial")}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                              tenant.plan_tier === "essencial"
                                ? "bg-white text-black"
                                : "text-neutral-400 hover:text-white"
                            }`}
                          >
                            Essencial
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleChangePlan(tenant, "pro")}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                              tenant.plan_tier === "pro"
                                ? "bg-rose-600 text-white"
                                : "text-neutral-400 hover:text-white"
                            }`}
                          >
                            Pro
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 mt-1">
                        <span>
                          Slug: <code className="text-neutral-200">{tenant.slug}</code>
                        </span>
                        {tenant.custom_domain && (
                          <span>
                            Domínio:{" "}
                            <code className="text-emerald-300">{tenant.custom_domain}</code>
                          </span>
                        )}
                        <span>
                          {tenant.modalities?.length || 0} modalidades •{" "}
                          {tenant.leads_count || 0} leads
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto">
                    <Link
                      href={`/sites/${tenant.slug}`}
                      target="_blank"
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.97] border border-white/10 text-xs font-semibold text-white inline-flex items-center justify-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ver Site</span>
                    </Link>

                    <Link
                      href={`/sites/${tenant.slug}/links`}
                      target="_blank"
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.97] border border-white/10 text-xs font-semibold text-neutral-200 inline-flex items-center justify-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Link Bio</span>
                    </Link>

                    <Link
                      href={`/sites/${tenant.slug}/admin`}
                      target="_blank"
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.97] border border-white/10 text-xs font-semibold text-neutral-200 inline-flex items-center justify-center gap-1.5 transition"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Painel Cliente</span>
                    </Link>

                    <Link
                      href={`/master/tenants/${tenant.id}`}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 active:scale-[0.97] border border-rose-500/40 text-xs font-semibold text-white inline-flex items-center justify-center gap-1.5 transition"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </Link>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDuplicate(tenant.id)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.97] border border-white/10 text-xs font-semibold text-neutral-200 inline-flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                    >
                      {isBusy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Duplicar Demo</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleToggleStatus(tenant)}
                        title={isActive ? "Suspender site" : "Reativar site"}
                        className={`flex-1 sm:flex-none min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 active:scale-[0.97] transition disabled:opacity-50 ${
                          isActive
                            ? "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{isActive ? "Suspender" : "Ativar"}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDelete(tenant)}
                        aria-label="Excluir academia"
                        className="min-w-[44px] min-h-[44px] p-2 rounded-xl bg-white/5 hover:bg-rose-600/30 active:scale-[0.95] border border-white/10 hover:border-rose-500/40 text-neutral-400 hover:text-rose-300 inline-flex items-center justify-center transition disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Modal Nova Academia (Bottom Sheet no Mobile com Safe Area iOS) */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="w-full sm:max-w-md max-h-[88dvh] overflow-y-auto bg-[#141417] border border-white/10 border-t-white/20 rounded-t-3xl sm:rounded-2xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:p-6 space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-display text-2xl uppercase text-white">
                Cadastrar Nova Academia
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                As 11 seções já nascem preenchidas com textos modelo prontos para personalizar.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Nome da Academia *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: CT Guerreiros do Tatame"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Slug / Subdomínio (opcional)
                </label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) =>
                    setNewSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "")
                    )
                  }
                  placeholder="ct-guerreiros"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <WhatsAppInput
                label="WhatsApp da Academia"
                required
                value={newWhatsapp}
                onChange={setNewWhatsapp}
              />

              <CepAddressFields
                value={{
                  address: newAddress,
                  neighborhood: newNeighborhood,
                  city: newCity,
                }}
                onChange={(next) => {
                  setNewAddress(next.address);
                  setNewNeighborhood(next.neighborhood);
                  setNewCity(next.city);
                }}
              />

              <div className="pt-2 border-t border-white/10 space-y-2.5">
                <p className="text-xs font-semibold text-neutral-200">
                  Acesso do Dono da Academia (opcional — já libera o login)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="dono@academia.com.br"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                  <input
                    type="password"
                    minLength={6}
                    value={newClientPassword}
                    onChange={(e) => setNewClientPassword(e.target.value)}
                    placeholder="Senha (mín. 6 dígitos)"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {createError && (
                <p className="text-xs text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-xl px-3 py-2">
                  {createError}
                </p>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Plano da Academia
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewPlanTier("essencial")}
                    className={`p-3 rounded-xl border text-left transition ${
                      newPlanTier === "essencial"
                        ? "border-white bg-white/10 text-white"
                        : "border-white/10 bg-black/40 text-neutral-400 hover:border-white/25"
                    }`}
                  >
                    <span className="block text-xs font-bold uppercase">
                      Essencial
                    </span>
                    <span className="block text-[11px] text-neutral-400 mt-0.5">
                      Site + WhatsApp + Subdomínio
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPlanTier("pro")}
                    className={`p-3 rounded-xl border text-left transition ${
                      newPlanTier === "pro"
                        ? "border-rose-500 bg-rose-600/15 text-white"
                        : "border-white/10 bg-black/40 text-neutral-400 hover:border-white/25"
                    }`}
                  >
                    <span className="block text-xs font-bold uppercase text-rose-400">
                      Pro (Completo)
                    </span>
                    <span className="block text-[11px] text-neutral-300 mt-0.5">
                      Funil, CRM, Domínio, Stories
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Cor Primária da Academia
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {BRAND_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setNewColor(preset.hex)}
                      title={preset.name}
                      className={`w-7 h-7 rounded-full border-2 transition ${
                        newColor === preset.hex
                          ? "border-white scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: preset.hex }}
                    />
                  ))}
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm uppercase tracking-wider transition disabled:opacity-60"
              >
                {creating ? "Criando..." : "Criar Academia"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
