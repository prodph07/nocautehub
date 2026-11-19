"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Globe,
  Link2,
  Loader2,
  Lock,
  LogOut,
  Megaphone,
  MessageCircle,
  Palette,
  Plus,
  Save,
  Sparkles,
  TrendingUp,
  Trash2,
  Users,
  Eye,
} from "lucide-react";
import {
  DAYS_ORDER,
  DAY_LABELS,
  type DayOfWeek,
  type Lead,
  type LeadStatus,
  type TenantWithRelations,
  type WeeklyAnalyticsSummary,
} from "@/types/tenant";
import { hexToRgbTriplet } from "@/lib/colors";
import { getPlanCapabilities } from "@/lib/plans";
import { DomainManagerCard } from "@/components/shared/DomainManagerCard";
import { StoriesScheduleGenerator } from "@/components/shared/StoriesScheduleGenerator";
import { WhatsAppInput } from "@/components/shared/WhatsAppInput";
import { TenantEditorClient } from "@/components/master/TenantEditorClient";

interface ClientAdminDashboardProps {
  initialTenant: TenantWithRelations;
  initialLeads: Lead[];
  analytics: WeeklyAnalyticsSummary;
}

type ClientTab = "overview" | "editor" | "crm" | "horarios" | "dominio";

export function ClientAdminDashboard({
  initialTenant,
  initialLeads,
  analytics,
}: ClientAdminDashboardProps) {
  const router = useRouter();
  const [tenant, setTenant] = useState<TenantWithRelations>(initialTenant);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [tab, setTab] = useState<ClientTab>("overview");
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);

  const handleCopyBioLink = () => {
    const url = tenant.custom_domain
      ? `https://${tenant.custom_domain}/links`
      : `${window.location.origin}/sites/${tenant.slug}/links`;
    navigator.clipboard.writeText(url);
    setCopiedBio(true);
    setTimeout(() => setCopiedBio(false), 2500);
  };

  const primaryColor = tenant.theme_config?.primary || "#E11D48";
  const caps = getPlanCapabilities(tenant.plan_tier);
  const cssVars = {
    "--primary": primaryColor,
    "--primary-rgb": hexToRgbTriplet(primaryColor),
  } as React.CSSProperties;

  // Métricas do Mini-CRM (Prova de ROI)
  const totalLeads = leads.length;
  const scheduledLeads = leads.filter((l) => l.status === "agendado").length;
  const enrolledLeads = leads.filter((l) => l.status === "matriculado").length;

  const maxDailyVisits = Math.max(
    1,
    ...analytics.daily.map((d) => d.visits)
  );

  const handleSave = async () => {
    setSaving(true);
    setSavedToast(false);
    try {
      const res = await fetch(`/api/client-admin/${tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp_number: tenant.whatsapp_number,
          top_bar_config: tenant.top_bar_config,
          schedules: tenant.schedules,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.tenant) setTenant(data.tenant);
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLeadStatus = async (leadId: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
    await fetch(`/api/client-admin/${tenant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_lead_status", leadId, status }),
    });
  };

  const handleLogout = async () => {
    await fetch("/api/client-auth/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <div style={cssVars} className="min-h-screen bg-[#0C0C0C] text-neutral-100 pb-28 sm:pb-16">
      {/* Header do Painel do Cliente */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#101012]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center font-display font-bold text-white shrink-0">
              {tenant.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg uppercase text-white truncate leading-none">
                  {tenant.name}
                </h1>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    tenant.plan_tier === "pro"
                      ? "bg-brand-primary/15 text-brand-primary border-brand-primary/30"
                      : "bg-white/5 text-neutral-300 border-white/10"
                  }`}
                >
                  Plano {tenant.plan_tier}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400">
                Painel do Dono • Nocaute Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {caps.linkBio && (
              <Link
                href={`/sites/${tenant.slug}/links`}
                target="_blank"
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 inline-flex items-center gap-1.5"
              >
                <Link2 className="w-3.5 h-3.5 text-brand-primary" />
                <span className="hidden md:inline">Link na Bio</span>
              </Link>
            )}

            <Link
              href={`/sites/${tenant.slug}`}
              target="_blank"
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Meu Site</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 inline-flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Navegação Desktop (no mobile usamos Bottom Tab Bar fixa no rodapé) */}
        <div className="hidden sm:block max-w-6xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <div className="flex gap-1 border-t border-white/5 py-2 min-w-max">
            {[
              { key: "overview" as const, label: "Início (Resumo)", icon: BarChart3 },
              { key: "editor" as const, label: "Editar Meu Site", icon: Palette },
              { key: "crm" as const, label: `Pessoas Interessadas (${totalLeads})`, icon: Users },
              { key: "horarios" as const, label: "Horários e Aulas", icon: Calendar },
              { key: "dominio" as const, label: "Meu Domínio (.com.br)", icon: Globe },
            ].map((item) => {
              const Icon = item.icon;
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition ${
                    active
                      ? "bg-brand-primary text-white"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main
        className={`mx-auto px-4 sm:px-6 py-8 space-y-8 ${
          tab === "editor" ? "max-w-[1600px]" : "max-w-6xl"
        }`}
      >
        {/* ===================================================================
            ABA EDITOR COMPLETO DO SITE (SPLIT-SCREEN LIVE PREVIEW)
           =================================================================== */}
        {tab === "editor" && (
          <TenantEditorClient
            mode="client"
            embedded
            initialTenant={tenant}
            initialLeads={leads}
            onTenantSaved={(updated) => setTenant(updated)}
          />
        )}

        {/* ===================================================================
            ABA 1: ANALYTICS DESCOMPLICADO + FAIXA DE AVISOS + WHATSAPP
           =================================================================== */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl uppercase text-white">
                  Desempenho dos Últimos 7 Dias
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Apenas os 3 indicadores que importam para encher seu tatame.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyBioLink}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white inline-flex items-center justify-center gap-2 active:scale-[0.97] transition"
              >
                {copiedBio ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Link copiado para o Instagram!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 text-brand-primary" />
                    <span>Copiar link para o Instagram</span>
                  </>
                )}
              </button>
            </div>

            {/* 3 Indicadores Essenciais da Semana */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Visitas na Semana</span>
                  <Eye className="w-4 h-4 text-neutral-300" />
                </div>
                <p className="font-display text-4xl font-bold text-white mt-2">
                  {analytics.visits.toLocaleString("pt-BR")}
                </p>
                <span className="text-[11px] text-neutral-500">
                  Acessos únicos ao seu site
                </span>
              </div>

              <div className="glass-card rounded-2xl p-5 border-emerald-500/25">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Cliques no WhatsApp</span>
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="font-display text-4xl font-bold text-emerald-400 mt-2">
                  {analytics.whatsappClicks.toLocaleString("pt-BR")}
                </p>
                <span className="text-[11px] text-neutral-500">
                  Interessados em aula experimental
                </span>
              </div>

              <div className="glass-card rounded-2xl p-5 border-brand-primary/30">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Taxa de Conversão</span>
                  <TrendingUp className="w-4 h-4 text-brand-primary" />
                </div>
                <p className="font-display text-4xl font-bold text-brand-primary mt-2">
                  {analytics.conversionRate.toFixed(1).replace(".", ",")}%
                </p>
                <span className="text-[11px] text-neutral-500">
                  Visitantes que chamaram no WhatsApp
                </span>
              </div>
            </div>

            {/* Mini Gráfico 7 dias */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  Evolução Diária (Visitas vs. Cliques no WhatsApp)
                </span>
                <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-white/20" />
                    Visitas
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-brand-primary" />
                    WhatsApp
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4">
                {analytics.daily.map((day) => {
                  const visitHeight = Math.max(
                    8,
                    Math.round((day.visits / maxDailyVisits) * 100)
                  );
                  const clickHeight = Math.max(
                    day.whatsappClicks > 0 ? 10 : 0,
                    Math.round((day.whatsappClicks / maxDailyVisits) * 100)
                  );
                  return (
                    <div
                      key={day.date}
                      className="flex flex-col items-center gap-2 h-full justify-end"
                    >
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        <div
                          title={`${day.visits} visitas`}
                          style={{ height: `${visitHeight}%` }}
                          className="w-3 sm:w-5 rounded-t bg-white/20 transition-all"
                        />
                        <div
                          title={`${day.whatsappClicks} cliques no WhatsApp`}
                          style={{ height: `${clickHeight}%` }}
                          className="w-3 sm:w-5 rounded-t bg-brand-primary transition-all"
                        />
                      </div>
                      <span className="text-[11px] text-neutral-400 font-medium">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ações Rápidas: Faixa de Avisos & WhatsApp */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-brand-primary" />
                    <h3 className="font-display text-lg uppercase text-white">
                      Faixa de Avisos Rápidos
                    </h3>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(tenant.top_bar_config?.enabled)}
                      onChange={(e) =>
                        setTenant({
                          ...tenant,
                          top_bar_config: {
                            ...tenant.top_bar_config,
                            enabled: e.target.checked,
                          },
                        })
                      }
                    />
                    <span>{tenant.top_bar_config?.enabled ? "Ligada" : "Desligada"}</span>
                  </label>
                </div>
                <p className="text-xs text-neutral-400">
                  Ideal para avisar sobre feriados, seminários, graduações ou promoções no topo do site.
                </p>
                <input
                  type="text"
                  value={tenant.top_bar_config?.text || ""}
                  onChange={(e) =>
                    setTenant({
                      ...tenant,
                      top_bar_config: {
                        ...tenant.top_bar_config,
                        text: e.target.value,
                      },
                    })
                  }
                  placeholder="Ex: Sábado teremos Seminário de Jiu-Jitsu às 10h!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white"
                />
              </div>

              <div className="glass-card rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-display text-lg uppercase text-white">
                    WhatsApp da Recepção
                  </h3>
                </div>
                <p className="text-xs text-neutral-400">
                  Todos os botões de agendamento do seu site direcionam automaticamente para este número.
                </p>
                <WhatsAppInput
                  value={tenant.whatsapp_number}
                  onChange={(val) =>
                    setTenant({
                      ...tenant,
                      whatsapp_number: val,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="px-6 py-3 rounded-xl bg-brand-primary hover:brightness-110 text-white text-sm font-bold inline-flex items-center gap-2 transition disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : savedToast ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>
                  {saving
                    ? "Salvando..."
                    : savedToast
                    ? "Alterações salvas!"
                    : "Salvar Aviso e WhatsApp"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 2: MINI-CRM DE LEADS (PROVA DE ROI - PLANO PRO)
           =================================================================== */}
        {tab === "crm" && !caps.crm && (
          <div className="glass-card rounded-3xl p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-4 border border-brand-primary/30">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/15 border border-brand-primary/30 text-brand-primary flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl uppercase text-white">
              Gestão de Pessoas Interessadas (Plano Pro)
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              No <strong>Plano Pro</strong>, o Mini-Funil de WhatsApp salva automaticamente cada interessado com modalidade e turno aqui, permitindo acompanhar quem veio treinar e quem matriculou.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
              <Lock className="w-3.5 h-3.5 text-brand-primary" />
              Fale com o suporte do Nocaute Hub para liberar o Plano Pro
            </span>
          </div>
        )}

        {tab === "crm" && caps.crm && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl uppercase text-white">
                Pessoas Interessadas
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Acompanhe cada pessoa que pediu aula experimental pelo site e atualize o status em 1 clique.
              </p>
            </div>

            {/* Resumo Consolidado */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="glass-card rounded-2xl p-4 sm:p-5">
                <span className="text-xs text-neutral-400">Total de Leads</span>
                <p className="font-display text-3xl font-bold text-white mt-1">
                  {totalLeads}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-4 sm:p-5">
                <span className="text-xs text-neutral-400">Aulas Agendadas</span>
                <p className="font-display text-3xl font-bold text-amber-400 mt-1">
                  {scheduledLeads}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-4 sm:p-5">
                <span className="text-xs text-neutral-400">Matriculados</span>
                <p className="font-display text-3xl font-bold text-emerald-400 mt-1">
                  {enrolledLeads}
                </p>
              </div>
            </div>

            {/* Lista de Leads com botões rápidos de funil */}
            {leads.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center text-sm text-neutral-400">
                Ainda não há leads registrados. Assim que um visitante preencher o mini-funil no seu site, ele aparecerá aqui!
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => {
                  const cleanLeadPhone = lead.phone.replace(/\D/g, "");
                  const waReplyUrl = cleanLeadPhone
                    ? `https://wa.me/${
                        cleanLeadPhone.startsWith("55")
                          ? cleanLeadPhone
                          : `55${cleanLeadPhone}`
                      }?text=${encodeURIComponent(
                        `Olá ${lead.name}! Aqui é da ${tenant.name}. Vamos confirmar sua aula experimental gratuita de ${lead.chosen_modality} no turno da ${lead.preferred_shift}?`
                      )}`
                    : null;

                  return (
                    <div
                      key={lead.id}
                      className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-base text-white">
                            {lead.name}
                          </h3>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-300">
                            {lead.chosen_modality}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-400">
                            Turno: {lead.preferred_shift}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400">
                          {lead.phone || "Contato iniciado no WhatsApp"} •{" "}
                          Origem: {lead.utm_source || "Orgânico/Direto"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {(
                          [
                            { key: "novo", label: "Novo" },
                            { key: "agendado", label: "Veio treinar" },
                            { key: "matriculado", label: "Matriculou" },
                          ] as const
                        ).map((step) => {
                          const active = lead.status === step.key;
                          return (
                            <button
                              key={step.key}
                              type="button"
                              onClick={() => handleLeadStatus(lead.id, step.key)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                active
                                  ? step.key === "matriculado"
                                    ? "bg-emerald-600 border-emerald-500 text-white"
                                    : step.key === "agendado"
                                    ? "bg-amber-600 border-amber-500 text-white"
                                    : "bg-brand-primary border-brand-primary text-white"
                                  : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                              }`}
                            >
                              {step.label}
                            </button>
                          );
                        })}

                        {waReplyUrl && (
                          <a
                            href={waReplyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366] border border-[#25D366]/40 text-[#25D366] hover:text-white text-xs font-semibold inline-flex items-center gap-1 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Chamar</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            ABA 3: GRADE DE HORÁRIOS (AUTONOMIA DO DONO)
           =================================================================== */}
        {tab === "horarios" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl uppercase text-white">
                  Grade de Horários
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Edite ou adicione horários e clique em salvar para atualizar o site na hora.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {caps.storiesGenerator && (
                  <StoriesScheduleGenerator tenant={tenant} />
                )}
                <button
                  type="button"
                  onClick={() =>
                    setTenant({
                      ...tenant,
                      schedules: [
                        {
                          id: crypto.randomUUID(),
                          tenant_id: tenant.id,
                          modality_id: tenant.modalities[0]?.id || "",
                          day_of_week: "seg",
                          start_time: "19:00",
                          end_time: "20:00",
                          instructor_name:
                            tenant.instructors[0]?.name || "Professor",
                          level: "Todos os níveis",
                        },
                        ...tenant.schedules,
                      ],
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Horário</span>
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-brand-primary hover:brightness-110 text-xs font-bold text-white inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : savedToast ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{savedToast ? "Salvo!" : "Salvar Grade"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {tenant.schedules.map((item, idx) => (
                <div
                  key={item.id}
                  className="glass-card rounded-xl p-4 grid grid-cols-1 sm:grid-cols-6 gap-2.5 items-center"
                >
                  <select
                    value={item.day_of_week}
                    onChange={(e) => {
                      const next = [...tenant.schedules];
                      next[idx] = {
                        ...item,
                        day_of_week: e.target.value as DayOfWeek,
                      };
                      setTenant({ ...tenant, schedules: next });
                    }}
                    className="px-2.5 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                  >
                    {DAYS_ORDER.map((d) => (
                      <option key={d} value={d}>
                        {DAY_LABELS[d]}
                      </option>
                    ))}
                  </select>

                  <select
                    value={item.modality_id}
                    onChange={(e) => {
                      const next = [...tenant.schedules];
                      next[idx] = { ...item, modality_id: e.target.value };
                      setTenant({ ...tenant, schedules: next });
                    }}
                    className="px-2.5 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                  >
                    {tenant.modalities.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="time"
                    value={item.start_time}
                    onChange={(e) => {
                      const next = [...tenant.schedules];
                      next[idx] = { ...item, start_time: e.target.value };
                      setTenant({ ...tenant, schedules: next });
                    }}
                    className="px-2.5 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                  />

                  <input
                    type="time"
                    value={item.end_time}
                    onChange={(e) => {
                      const next = [...tenant.schedules];
                      next[idx] = { ...item, end_time: e.target.value };
                      setTenant({ ...tenant, schedules: next });
                    }}
                    className="px-2.5 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                  />

                  <input
                    type="text"
                    value={item.instructor_name}
                    onChange={(e) => {
                      const next = [...tenant.schedules];
                      next[idx] = { ...item, instructor_name: e.target.value };
                      setTenant({ ...tenant, schedules: next });
                    }}
                    placeholder="Professor"
                    className="px-2.5 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.level}
                      onChange={(e) => {
                        const next = [...tenant.schedules];
                        next[idx] = { ...item, level: e.target.value };
                        setTenant({ ...tenant, schedules: next });
                      }}
                      placeholder="Nível"
                      className="flex-1 min-w-0 px-2.5 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setTenant({
                          ...tenant,
                          schedules: tenant.schedules.filter(
                            (s) => s.id !== item.id
                          ),
                        })
                      }
                      className="p-2 rounded-lg bg-white/5 hover:bg-rose-600/30 text-neutral-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 4: DOMÍNIO PRÓPRIO VIA API (PLANO PRO)
           =================================================================== */}
        {tab === "dominio" && !caps.customDomain && (
          <div className="glass-card rounded-3xl p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-4 border border-brand-primary/30">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/15 border border-brand-primary/30 text-brand-primary flex items-center justify-center mx-auto">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl uppercase text-white">
              Domínio Próprio .com.br + SSL (Plano Pro)
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Seu plano atual (<strong>Essencial</strong>) usa o subdomínio gratuito{" "}
              <code className="text-white">{tenant.slug}.nocautehub.com</code>. Faça upgrade para o{" "}
              <strong>Plano Pro</strong> para conectar seu domínio próprio com HTTPS automático.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
              <Lock className="w-3.5 h-3.5 text-brand-primary" />
              Fale com o suporte do Nocaute Hub para liberar o Plano Pro
            </span>
          </div>
        )}

        {tab === "dominio" && caps.customDomain && (
          <div className="max-w-3xl">
            <DomainManagerCard
              tenantId={tenant.id}
              slug={tenant.slug}
              initialDomain={tenant.custom_domain}
              initialStatus={tenant.domain_status}
              onDomainChange={(custom_domain, domain_status) =>
                setTenant({ ...tenant, custom_domain, domain_status })
              }
            />
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM TAB BAR (Uso na beira do tatame com o polegar + Safe Area iOS) */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#101012]/95 backdrop-blur-md border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16">
          {[
            { key: "overview" as const, label: "Início", icon: BarChart3 },
            { key: "editor" as const, label: "Site", icon: Palette },
            { key: "crm" as const, label: "Leads", icon: Users },
            { key: "horarios" as const, label: "Horários", icon: Calendar },
            { key: "dominio" as const, label: "Domínio", icon: Globe },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold active:scale-[0.94] transition ${
                  active ? "text-brand-primary" : "text-neutral-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

