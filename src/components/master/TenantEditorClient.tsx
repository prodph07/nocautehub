"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Settings,
  Palette,
  Dumbbell,
  Calendar,
  Users,
  MessageSquareQuote,
  UserCheck,
  Award,
  Shield,
  Image as ImageIcon,
  MapPin,
  HelpCircle,
} from "lucide-react";
import {
  DAYS_ORDER,
  DAY_LABELS,
  type AmenityItem,
  type DayOfWeek,
  type Lead,
  type LeadStatus,
  type TargetAudienceItem,
  type TenantWithRelations,
} from "@/types/tenant";
import { BRAND_COLOR_PRESETS } from "@/lib/colors";
import { ImageUploadField } from "./ImageUploadField";
import { DomainManagerCard } from "@/components/shared/DomainManagerCard";
import { StoriesScheduleGenerator } from "@/components/shared/StoriesScheduleGenerator";
import { WhatsAppInput } from "@/components/shared/WhatsAppInput";
import { CepAddressFields } from "@/components/shared/CepAddressFields";
import {
  SectionLivePreview,
  type EditorSectionKey,
} from "./SectionLivePreview";

interface TenantEditorClientProps {
  initialTenant: TenantWithRelations;
  initialLeads: Lead[];
  mode?: "master" | "client";
  embedded?: boolean;
  onTenantSaved?: (tenant: TenantWithRelations) => void;
}

const SECTIONS: Array<{
  key: EditorSectionKey;
  label: string;
  shortLabel: string;
  icon: typeof Settings;
}> = [
  { key: "hero", label: "1. Capa & Visual", shortLabel: "1. Capa", icon: Palette },
  { key: "autoridade", label: "2. Autoridade", shortLabel: "2. Números", icon: Award },
  { key: "modalidades", label: "3. Modalidades", shortLabel: "3. Modalidades", icon: Dumbbell },
  { key: "para-quem", label: "4. Para Quem É", shortLabel: "4. Para Quem", icon: Shield },
  { key: "equipe", label: "5. Equipe", shortLabel: "5. Equipe", icon: Users },
  { key: "estrutura", label: "6. Estrutura", shortLabel: "6. Estrutura", icon: ImageIcon },
  { key: "horarios", label: "7. Horários", shortLabel: "7. Horários", icon: Calendar },
  { key: "depoimentos", label: "8. Depoimentos", shortLabel: "8. Depoimentos", icon: MessageSquareQuote },
  { key: "localizacao", label: "9. Localização", shortLabel: "9. Localização", icon: MapPin },
  { key: "faq", label: "10. FAQ", shortLabel: "10. FAQ", icon: HelpCircle },
  { key: "config", label: "Config & Domínio", shortLabel: "Config", icon: Settings },
  { key: "leads", label: "Leads", shortLabel: "Leads", icon: UserCheck },
];

export function TenantEditorClient({
  initialTenant,
  initialLeads,
  mode = "master",
  embedded = false,
  onTenantSaved,
}: TenantEditorClientProps) {
  const [tenant, setTenant] = useState<TenantWithRelations>(initialTenant);
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() =>
    JSON.stringify(initialTenant)
  );
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activeSection, setActiveSection] = useState<EditorSectionKey>("hero");
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTenant(initialTenant);
    setSavedSnapshot(JSON.stringify(initialTenant));
  }, [initialTenant]);

  const isClientMode = mode === "client";
  const visibleSections = isClientMode
    ? SECTIONS.filter((s) => s.key !== "leads")
    : SECTIONS;

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(tenant) !== savedSnapshot,
    [tenant, savedSnapshot]
  );

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSavedToast(false);

    try {
      const endpoint = isClientMode
        ? `/api/client-admin/${tenant.id}`
        : `/api/tenants/${tenant.id}`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tenant),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar alterações");
      }
      const nextTenant = data.tenant || tenant;
      setTenant(nextTenant);
      setSavedSnapshot(JSON.stringify(nextTenant));
      onTenantSaved?.(nextTenant);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleLeadStatus = async (leadId: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: leadId, status }),
    });
  };

  const isLeadsTab = activeSection === "leads";

  return (
    <div
      className={
        embedded
          ? "text-neutral-100 flex flex-col"
          : "min-h-screen bg-[#0C0C0C] text-neutral-100 flex flex-col"
      }
    >
      {/* Header Fixo do Editor */}
      <header
        className={
          embedded
            ? "rounded-2xl border border-white/10 bg-[#101012]/95 mb-5"
            : "sticky top-0 z-30 border-b border-white/10 bg-[#101012]/95 backdrop-blur-md"
        }
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {!embedded && (
              <Link
                href="/master"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg sm:text-xl uppercase text-white truncate leading-none">
                  {embedded ? "Editor Visual do Meu Site" : tenant.name}
                </h1>
                {hasUnsavedChanges && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Alterações não salvas
                  </span>
                )}
              </div>
              <span className="text-xs text-neutral-400">
                Edite cada seção à esquerda e veja o resultado ao vivo à direita
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {!embedded && (
              <Link
                href={`/sites/${tenant.slug}`}
                target="_blank"
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Abrir Site</span>
              </Link>
            )}

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className={`px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition disabled:opacity-60 ${
                hasUnsavedChanges
                  ? "bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/25"
                  : "bg-white/10 hover:bg-white/15"
              }`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : savedToast ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>
                {saving
                  ? "Salvando..."
                  : savedToast
                  ? "Salvo!"
                  : "Salvar Alterações"}
              </span>
            </button>
          </div>
        </div>

        {/* Barra de Seções na ordem real do site */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 overflow-x-auto">
          <div className="flex gap-1 border-t border-white/5 py-2 min-w-max">
            {visibleSections.map((sec) => {
              const Icon = sec.icon;
              const active = activeSection === sec.key;
              return (
                <button
                  key={sec.key}
                  type="button"
                  onClick={() => setActiveSection(sec.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition ${
                    active
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.shortLabel}</span>
                  {sec.key === "leads" && (
                    <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-black/30 text-[10px]">
                      {leads.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Corpo Split-Screen */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div
          className={
            isLeadsTab
              ? "max-w-5xl mx-auto"
              : "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          }
        >
          {/* ===============================================================
              COLUNA ESQUERDA: FORMULÁRIO DA SEÇÃO ATIVA
             =============================================================== */}
          <div className={isLeadsTab ? "" : "lg:col-span-5 space-y-5 pb-16"}>
            {/* 1. CAPA (HERO), TOPO & VISUAL */}
            {activeSection === "hero" && (
              <div className="space-y-5">
                <div className="glass-card rounded-2xl p-5 space-y-4">
                  <h2 className="font-display text-lg uppercase text-white">
                    Identidade Visual & Cor Primária
                  </h2>

                  <div>
                    <label className="block text-xs text-neutral-300 mb-2">
                      Cor Primária da Academia (atualiza o preview na hora)
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {BRAND_COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() =>
                            setTenant({
                              ...tenant,
                              theme_config: {
                                ...tenant.theme_config,
                                primary: preset.hex,
                              },
                            })
                          }
                          title={preset.name}
                          className={`w-7 h-7 rounded-full border-2 transition ${
                            tenant.theme_config?.primary === preset.hex
                              ? "border-white scale-110"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: preset.hex }}
                        />
                      ))}
                      <input
                        type="color"
                        value={tenant.theme_config?.primary || "#E11D48"}
                        onChange={(e) =>
                          setTenant({
                            ...tenant,
                            theme_config: {
                              ...tenant.theme_config,
                              primary: e.target.value,
                            },
                          })
                        }
                        className="w-8 h-8 rounded cursor-pointer bg-transparent"
                      />
                    </div>
                  </div>

                  <ImageUploadField
                    label="Logotipo da Academia"
                    value={tenant.logo_url || ""}
                    onChange={(url) =>
                      setTenant({ ...tenant, logo_url: url || null })
                    }
                    folder={`${tenant.slug}-logo`}
                  />

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-xs text-neutral-300 mb-1">
                        Tipografia dos Títulos
                      </label>
                      <select
                        value={tenant.theme_config?.font_preset || "condensada"}
                        onChange={(e) =>
                          setTenant({
                            ...tenant,
                            theme_config: {
                              ...tenant.theme_config,
                              font_preset: e.target.value as
                                | "condensada"
                                | "geometrica"
                                | "marcial",
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white"
                      >
                        <option value="condensada">Agressiva / Condensada (Oswald)</option>
                        <option value="geometrica">Moderna / Geométrica (Space)</option>
                        <option value="marcial">Clássica / Marcial (Cinzel)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-300 mb-1">
                        Layout da Capa (Hero)
                      </label>
                      <select
                        value={tenant.theme_config?.hero_preset || "full"}
                        onChange={(e) =>
                          setTenant({
                            ...tenant,
                            theme_config: {
                              ...tenant.theme_config,
                              hero_preset: e.target.value as
                                | "full"
                                | "split"
                                | "minimal",
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white"
                      >
                        <option value="full">Banner Full (Foto/Vídeo)</option>
                        <option value="split">Split (Texto + Foto Lateral)</option>
                        <option value="minimal">Minimalista Centralizado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Top Bar */}
                <div className="glass-card rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg uppercase text-white">
                      Faixa de Aviso no Topo
                    </h2>
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
                      <span>Ativar</span>
                    </label>
                  </div>
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
                    placeholder="Ex: Vagas abertas para turmas de iniciantes!"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={tenant.top_bar_config?.cta_text || ""}
                    onChange={(e) =>
                      setTenant({
                        ...tenant,
                        top_bar_config: {
                          ...tenant.top_bar_config,
                          cta_text: e.target.value,
                        },
                      })
                    }
                    placeholder="Texto do link (ex: Garantir vaga)"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white"
                  />
                </div>

                {/* Hero */}
                <div className="glass-card rounded-2xl p-5 space-y-3.5">
                  <h2 className="font-display text-lg uppercase text-white">
                    Hero (Primeira Dobra)
                  </h2>

                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">
                      Badge Superior (Bairro / Cidade)
                    </label>
                    <input
                      type="text"
                      value={tenant.hero_config?.eyebrow || ""}
                      onChange={(e) =>
                        setTenant({
                          ...tenant,
                          hero_config: {
                            ...tenant.hero_config,
                            eyebrow: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">
                      Manchete Principal
                    </label>
                    <textarea
                      rows={2}
                      value={tenant.hero_config?.headline || ""}
                      onChange={(e) =>
                        setTenant({
                          ...tenant,
                          hero_config: {
                            ...tenant.hero_config,
                            headline: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">
                      Subtítulo Contextual
                    </label>
                    <textarea
                      rows={3}
                      value={tenant.hero_config?.subheadline || ""}
                      onChange={(e) =>
                        setTenant({
                          ...tenant,
                          hero_config: {
                            ...tenant.hero_config,
                            subheadline: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">
                      Texto do Botão Principal (CTA)
                    </label>
                    <input
                      type="text"
                      value={tenant.hero_config?.cta_text || ""}
                      onChange={(e) =>
                        setTenant({
                          ...tenant,
                          hero_config: {
                            ...tenant.hero_config,
                            cta_text: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">
                      Quebra de Objeção (micro-copy abaixo do botão)
                    </label>
                    <input
                      type="text"
                      value={tenant.hero_config?.objection_breaker || ""}
                      onChange={(e) =>
                        setTenant({
                          ...tenant,
                          hero_config: {
                            ...tenant.hero_config,
                            objection_breaker: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white"
                    />
                  </div>

                  <ImageUploadField
                    label="Foto de Fundo do Hero (ou URL de vídeo .mp4)"
                    value={tenant.hero_config?.media_url || ""}
                    onChange={(url) =>
                      setTenant({
                        ...tenant,
                        hero_config: {
                          ...tenant.hero_config,
                          media_type: url.endsWith(".mp4") ? "video" : "image",
                          media_url: url,
                        },
                      })
                    }
                    folder={`${tenant.slug}-hero`}
                  />

                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">
                      Faixa Marquee (palavras separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      value={(tenant.hero_config?.marquee_items || []).join(", ")}
                      onChange={(e) =>
                        setTenant({
                          ...tenant,
                          hero_config: {
                            ...tenant.hero_config,
                            marquee_items: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. BARRA DE AUTORIDADE */}
            {activeSection === "autoridade" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl uppercase text-white">
                    Barra de Autoridade (Provas Sociais)
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      setTenant({
                        ...tenant,
                        authority_stats: [
                          ...(tenant.authority_stats || []),
                          { value: 100, suffix: "+", label: "Nova Métrica" },
                        ],
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar
                  </button>
                </div>

                {(tenant.authority_stats || []).map((stat, idx) => (
                  <div key={idx} className="glass-card rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-rose-400">
                        Indicador #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setTenant({
                            ...tenant,
                            authority_stats: tenant.authority_stats.filter(
                              (_, i) => i !== idx
                            ),
                          })
                        }
                        className="text-neutral-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">
                          Número
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={stat.value}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const next = [...tenant.authority_stats];
                            next[idx] = {
                              ...stat,
                              value: val,
                              decimals: Number.isInteger(val) ? 0 : 1,
                            };
                            setTenant({ ...tenant, authority_stats: next });
                          }}
                          className="w-full px-2.5 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">
                          Sufixo (+, ★, %)
                        </label>
                        <input
                          type="text"
                          value={stat.suffix}
                          onChange={(e) => {
                            const next = [...tenant.authority_stats];
                            next[idx] = { ...stat, suffix: e.target.value };
                            setTenant({ ...tenant, authority_stats: next });
                          }}
                          className="w-full px-2.5 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">
                          Prefixo (opc.)
                        </label>
                        <input
                          type="text"
                          value={stat.prefix || ""}
                          onChange={(e) => {
                            const next = [...tenant.authority_stats];
                            next[idx] = { ...stat, prefix: e.target.value };
                            setTenant({ ...tenant, authority_stats: next });
                          }}
                          className="w-full px-2.5 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        Legenda
                      </label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => {
                          const next = [...tenant.authority_stats];
                          next[idx] = { ...stat, label: e.target.value };
                          setTenant({ ...tenant, authority_stats: next });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. MODALIDADES */}
            {activeSection === "modalidades" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl uppercase text-white">
                    Modalidades ({tenant.modalities.length})
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      setTenant({
                        ...tenant,
                        modalities: [
                          ...tenant.modalities,
                          {
                            id: crypto.randomUUID(),
                            tenant_id: tenant.id,
                            name: "Nova Modalidade",
                            short_desc:
                              "Descreva em até 2 linhas o benefício principal desta aula.",
                            image_url:
                              "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=900&q=80",
                            target_audience: "Todos os níveis",
                            display_order: tenant.modalities.length + 1,
                          },
                        ],
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar
                  </button>
                </div>

                {tenant.modalities.map((mod, idx) => (
                  <div key={mod.id} className="glass-card rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-rose-400">
                        Modalidade #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setTenant({
                            ...tenant,
                            modalities: tenant.modalities.filter(
                              (m) => m.id !== mod.id
                            ),
                          })
                        }
                        className="text-neutral-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={mod.name}
                        onChange={(e) => {
                          const next = [...tenant.modalities];
                          next[idx] = { ...mod, name: e.target.value };
                          setTenant({ ...tenant, modalities: next });
                        }}
                        placeholder="Nome"
                        className="px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={mod.target_audience}
                        onChange={(e) => {
                          const next = [...tenant.modalities];
                          next[idx] = { ...mod, target_audience: e.target.value };
                          setTenant({ ...tenant, modalities: next });
                        }}
                        placeholder="Badge (ex: Iniciante)"
                        className="px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={mod.short_desc}
                      onChange={(e) => {
                        const next = [...tenant.modalities];
                        next[idx] = { ...mod, short_desc: e.target.value };
                        setTenant({ ...tenant, modalities: next });
                      }}
                      placeholder="Resumo de benefício"
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                    />
                    <ImageUploadField
                      label="Foto da Modalidade"
                      value={mod.image_url}
                      onChange={(url) => {
                        const next = [...tenant.modalities];
                        next[idx] = { ...mod, image_url: url };
                        setTenant({ ...tenant, modalities: next });
                      }}
                      folder={`${tenant.slug}-modalities`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 4. PARA QUEM É (QUEBRA DE MEDO) */}
            {activeSection === "para-quem" && (
              <div className="space-y-4">
                <h2 className="font-display text-xl uppercase text-white">
                  Para Quem É (Blocos de Quebra de Medo)
                </h2>
                {(tenant.target_audience || []).map((item, idx) => (
                  <div key={item.id || idx} className="glass-card rounded-2xl p-4 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const next = [...tenant.target_audience];
                          next[idx] = { ...item, title: e.target.value };
                          setTenant({ ...tenant, target_audience: next });
                        }}
                        placeholder="Título do bloco"
                        className="px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs font-semibold text-white"
                      />
                      <input
                        type="text"
                        value={item.badge}
                        onChange={(e) => {
                          const next = [...tenant.target_audience];
                          next[idx] = { ...item, badge: e.target.value };
                          setTenant({ ...tenant, target_audience: next });
                        }}
                        placeholder="Badge superior"
                        className="px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                      />
                    </div>
                    <select
                      value={item.icon}
                      onChange={(e) => {
                        const next = [...tenant.target_audience];
                        next[idx] = {
                          ...item,
                          icon: e.target.value as TargetAudienceItem["icon"],
                        };
                        setTenant({ ...tenant, target_audience: next });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                    >
                      <option value="shield">Ícone: Escudo (Iniciantes)</option>
                      <option value="flame">Ícone: Chama (Fitness)</option>
                      <option value="baby">Ícone: Kids (Infantil)</option>
                      <option value="trophy">Ícone: Troféu (Atletas)</option>
                    </select>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => {
                        const next = [...tenant.target_audience];
                        next[idx] = { ...item, description: e.target.value };
                        setTenant({ ...tenant, target_audience: next });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 5. EQUIPE */}
            {activeSection === "equipe" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl uppercase text-white">
                    Mestre e Professores
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      setTenant({
                        ...tenant,
                        instructors: [
                          ...tenant.instructors,
                          {
                            id: crypto.randomUUID(),
                            tenant_id: tenant.id,
                            name: "Novo Professor",
                            rank: "Faixa Preta",
                            lineage: "",
                            experience_years: 8,
                            bio: "",
                            photo_url: "",
                            display_order: tenant.instructors.length + 1,
                          },
                        ],
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar
                  </button>
                </div>

                {tenant.instructors.map((inst, idx) => (
                  <div key={inst.id} className="glass-card rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-rose-400">
                        Professor #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setTenant({
                            ...tenant,
                            instructors: tenant.instructors.filter(
                              (i) => i.id !== inst.id
                            ),
                          })
                        }
                        className="text-neutral-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={inst.name}
                      onChange={(e) => {
                        const next = [...tenant.instructors];
                        next[idx] = { ...inst, name: e.target.value };
                        setTenant({ ...tenant, instructors: next });
                      }}
                      placeholder="Nome"
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={inst.rank}
                        onChange={(e) => {
                          const next = [...tenant.instructors];
                          next[idx] = { ...inst, rank: e.target.value };
                          setTenant({ ...tenant, instructors: next });
                        }}
                        placeholder="Faixa / Graduação"
                        className="col-span-2 px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                      />
                      <input
                        type="number"
                        value={inst.experience_years}
                        onChange={(e) => {
                          const next = [...tenant.instructors];
                          next[idx] = {
                            ...inst,
                            experience_years: Number(e.target.value) || 0,
                          };
                          setTenant({ ...tenant, instructors: next });
                        }}
                        placeholder="Anos"
                        className="px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                      />
                    </div>
                    <input
                      type="text"
                      value={inst.lineage}
                      onChange={(e) => {
                        const next = [...tenant.instructors];
                        next[idx] = { ...inst, lineage: e.target.value };
                        setTenant({ ...tenant, instructors: next });
                      }}
                      placeholder="Linhagem / Federação"
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                    />
                    <textarea
                      rows={2}
                      value={inst.bio}
                      onChange={(e) => {
                        const next = [...tenant.instructors];
                        next[idx] = { ...inst, bio: e.target.value };
                        setTenant({ ...tenant, instructors: next });
                      }}
                      placeholder="Mini-biografia"
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                    />
                    <ImageUploadField
                      label="Foto Profissional"
                      value={inst.photo_url}
                      onChange={(url) => {
                        const next = [...tenant.instructors];
                        next[idx] = { ...inst, photo_url: url };
                        setTenant({ ...tenant, instructors: next });
                      }}
                      folder={`${tenant.slug}-team`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 6. ESTRUTURA & TATAME */}
            {activeSection === "estrutura" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl uppercase text-white">
                    Galeria da Estrutura
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      setTenant({
                        ...tenant,
                        gallery_images: [
                          ...(tenant.gallery_images || []),
                          {
                            url: "",
                            caption: "Tatame higienizado e climatizado",
                            category: "Estrutura",
                          },
                        ],
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Foto
                  </button>
                </div>

                {(tenant.gallery_images || []).map((img, idx) => (
                  <div key={idx} className="glass-card rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-rose-400 font-bold">
                        Foto #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setTenant({
                            ...tenant,
                            gallery_images: tenant.gallery_images.filter(
                              (_, i) => i !== idx
                            ),
                          })
                        }
                        className="text-neutral-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={img.category}
                        onChange={(e) => {
                          const next = [...tenant.gallery_images];
                          next[idx] = { ...img, category: e.target.value };
                          setTenant({ ...tenant, gallery_images: next });
                        }}
                        placeholder="Tag"
                        className="px-2.5 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={img.caption}
                        onChange={(e) => {
                          const next = [...tenant.gallery_images];
                          next[idx] = { ...img, caption: e.target.value };
                          setTenant({ ...tenant, gallery_images: next });
                        }}
                        placeholder="Legenda"
                        className="col-span-2 px-2.5 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                      />
                    </div>
                    <ImageUploadField
                      label="Imagem"
                      value={img.url}
                      onChange={(url) => {
                        const next = [...tenant.gallery_images];
                        next[idx] = { ...img, url };
                        setTenant({ ...tenant, gallery_images: next });
                      }}
                      folder={`${tenant.slug}-gallery`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 7. GRADE DE HORÁRIOS */}
            {activeSection === "horarios" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-xl uppercase text-white">
                    Horários ({tenant.schedules.length})
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <StoriesScheduleGenerator tenant={tenant} />
                    <button
                      type="button"
                      disabled={tenant.modalities.length === 0}
                      onClick={() => {
                        const firstModId = tenant.modalities[0]?.id;
                        if (!firstModId) return;
                        setTenant({
                          ...tenant,
                          schedules: [
                            {
                              id: crypto.randomUUID(),
                              tenant_id: tenant.id,
                              modality_id: firstModId,
                              day_of_week: "seg",
                              start_time: "19:00",
                              end_time: "20:00",
                              instructor_name:
                                tenant.instructors[0]?.name || "Professor",
                              level: "Todos os níveis",
                            },
                            ...tenant.schedules,
                          ],
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Nova Aula
                    </button>
                  </div>
                </div>

                {tenant.modalities.length === 0 && (
                  <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 p-4 text-xs text-amber-200">
                    Cadastre pelo menos 1 modalidade na aba{" "}
                    <button
                      type="button"
                      onClick={() => setActiveSection("modalidades")}
                      className="underline font-bold"
                    >
                      3. Modalidades
                    </button>{" "}
                    antes de criar horários.
                  </div>
                )}

                <div className="space-y-2.5">
                  {tenant.schedules.map((item, idx) => (
                    <div key={item.id} className="glass-card rounded-xl p-3.5 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
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
                          className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
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
                          className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                        >
                          {tenant.modalities.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-3 gap-2 items-center">
                        <input
                          type="time"
                          value={item.start_time}
                          onChange={(e) => {
                            const next = [...tenant.schedules];
                            next[idx] = { ...item, start_time: e.target.value };
                            setTenant({ ...tenant, schedules: next });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                        />
                        <input
                          type="time"
                          value={item.end_time}
                          onChange={(e) => {
                            const next = [...tenant.schedules];
                            next[idx] = { ...item, end_time: e.target.value };
                            setTenant({ ...tenant, schedules: next });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                        />
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={item.level}
                            onChange={(e) => {
                              const next = [...tenant.schedules];
                              next[idx] = { ...item, level: e.target.value };
                              setTenant({ ...tenant, schedules: next });
                            }}
                            placeholder="Nível"
                            className="flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
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
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600/30 text-neutral-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={item.instructor_name}
                        onChange={(e) => {
                          const next = [...tenant.schedules];
                          next[idx] = { ...item, instructor_name: e.target.value };
                          setTenant({ ...tenant, schedules: next });
                        }}
                        placeholder="Professor responsável"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. DEPOIMENTOS */}
            {activeSection === "depoimentos" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl uppercase text-white">
                    Depoimentos Reais
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      setTenant({
                        ...tenant,
                        testimonials: [
                          ...tenant.testimonials,
                          {
                            id: crypto.randomUUID(),
                            tenant_id: tenant.id,
                            author_name: "Nome do Aluno",
                            role_or_modality: "Aluno(a)",
                            rating: 5,
                            text: "",
                            avatar_url: "",
                            source: "Google",
                          },
                        ],
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar
                  </button>
                </div>

                {tenant.testimonials.map((t, idx) => (
                  <div key={t.id} className="glass-card rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-rose-400 font-bold">
                        Depoimento #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setTenant({
                            ...tenant,
                            testimonials: tenant.testimonials.filter(
                              (x) => x.id !== t.id
                            ),
                          })
                        }
                        className="text-neutral-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={t.author_name}
                        onChange={(e) => {
                          const next = [...tenant.testimonials];
                          next[idx] = { ...t, author_name: e.target.value };
                          setTenant({ ...tenant, testimonials: next });
                        }}
                        placeholder="Nome do aluno"
                        className="px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={t.role_or_modality}
                        onChange={(e) => {
                          const next = [...tenant.testimonials];
                          next[idx] = { ...t, role_or_modality: e.target.value };
                          setTenant({ ...tenant, testimonials: next });
                        }}
                        placeholder="Modalidade"
                        className="px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                      />
                    </div>
                    <textarea
                      rows={3}
                      value={t.text}
                      onChange={(e) => {
                        const next = [...tenant.testimonials];
                        next[idx] = { ...t, text: e.target.value };
                        setTenant({ ...tenant, testimonials: next });
                      }}
                      placeholder="Texto do depoimento"
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 9. LOCALIZAÇÃO & COMODIDADES */}
            {activeSection === "localizacao" && (
              <div className="space-y-5">
                <div className="glass-card rounded-2xl p-5 space-y-3">
                  <h2 className="font-display text-lg uppercase text-white">
                    Endereço & Mapa (Busca por CEP)
                  </h2>
                  <CepAddressFields
                    compact
                    showMapsHelper
                    value={{
                      address: tenant.address,
                      neighborhood: tenant.neighborhood,
                      city: tenant.city,
                      google_maps_embed: tenant.google_maps_embed,
                    }}
                    onChange={(next) =>
                      setTenant({
                        ...tenant,
                        address: next.address,
                        neighborhood: next.neighborhood,
                        city: next.city,
                        google_maps_embed:
                          next.google_maps_embed ?? tenant.google_maps_embed,
                      })
                    }
                  />
                  <input
                    type="text"
                    value={tenant.reference_point}
                    onChange={(e) =>
                      setTenant({ ...tenant, reference_point: e.target.value })
                    }
                    placeholder="Ponto de referência"
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={tenant.opening_hours}
                    onChange={(e) =>
                      setTenant({ ...tenant, opening_hours: e.target.value })
                    }
                    placeholder="Horário de funcionamento"
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                  />
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      URL Embed do Google Maps (src do iframe)
                    </label>
                    <input
                      type="text"
                      value={tenant.google_maps_embed}
                      onChange={(e) =>
                        setTenant({
                          ...tenant,
                          google_maps_embed: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg uppercase text-white">
                      Facilidades / Comodidades
                    </h2>
                    <button
                      type="button"
                      onClick={() =>
                        setTenant({
                          ...tenant,
                          amenities: [
                            ...(tenant.amenities || []),
                            { icon: "shield", label: "Nova Facilidade" },
                          ],
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar
                    </button>
                  </div>
                  {(tenant.amenities || []).map((a, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={a.icon}
                        onChange={(e) => {
                          const next = [...tenant.amenities];
                          next[idx] = {
                            ...a,
                            icon: e.target.value as AmenityItem["icon"],
                          };
                          setTenant({ ...tenant, amenities: next });
                        }}
                        className="px-2 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                      >
                        <option value="car">Estacionamento</option>
                        <option value="bus">Transporte</option>
                        <option value="wind">Climatização</option>
                        <option value="shower">Chuveiro</option>
                        <option value="droplets">Bebedouro</option>
                        <option value="baby">Área Pais/Kids</option>
                        <option value="wifi">Wi-Fi</option>
                        <option value="shield">Segurança</option>
                      </select>
                      <input
                        type="text"
                        value={a.label}
                        onChange={(e) => {
                          const next = [...tenant.amenities];
                          next[idx] = { ...a, label: e.target.value };
                          setTenant({ ...tenant, amenities: next });
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setTenant({
                            ...tenant,
                            amenities: tenant.amenities.filter(
                              (_, i) => i !== idx
                            ),
                          })
                        }
                        className="text-neutral-500 hover:text-rose-400 p-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 10. FAQ */}
            {activeSection === "faq" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl uppercase text-white">
                    FAQ (Quebra de Objeções)
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      setTenant({
                        ...tenant,
                        faqs: [
                          ...(tenant.faqs || []),
                          { question: "Nova pergunta?", answer: "" },
                        ],
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar
                  </button>
                </div>

                {(tenant.faqs || []).map((faq, idx) => (
                  <div key={idx} className="glass-card rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const next = [...tenant.faqs];
                          next[idx] = { ...faq, question: e.target.value };
                          setTenant({ ...tenant, faqs: next });
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs font-semibold text-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setTenant({
                            ...tenant,
                            faqs: tenant.faqs.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-neutral-500 hover:text-rose-400 p-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={faq.answer}
                      onChange={(e) => {
                        const next = [...tenant.faqs];
                        next[idx] = { ...faq, answer: e.target.value };
                        setTenant({ ...tenant, faqs: next });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* CONFIGURAÇÕES & DOMÍNIO */}
            {activeSection === "config" && (
              <div className="space-y-5">
                <DomainManagerCard
                  tenantId={tenant.id}
                  slug={tenant.slug}
                  initialDomain={tenant.custom_domain}
                  initialStatus={tenant.domain_status}
                  onDomainChange={(custom_domain, domain_status) =>
                    setTenant({ ...tenant, custom_domain, domain_status })
                  }
                />

                <div className="glass-card rounded-2xl p-5 space-y-3.5">
                  <h2 className="font-display text-lg uppercase text-white">
                    Dados da Conta, Domínio & WhatsApp
                  </h2>
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">
                      Nome da Academia
                    </label>
                    <input
                      type="text"
                      value={tenant.name}
                      onChange={(e) =>
                        setTenant({ ...tenant, name: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-sm text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {!isClientMode && (
                      <div>
                        <label className="block text-xs text-neutral-300 mb-1">
                          Slug (subdomínio)
                        </label>
                        <input
                          type="text"
                          value={tenant.slug}
                          onChange={(e) =>
                            setTenant({ ...tenant, slug: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                        />
                      </div>
                    )}
                    <div className={isClientMode ? "col-span-2" : ""}>
                      <WhatsAppInput
                        label="WhatsApp"
                        value={tenant.whatsapp_number}
                        onChange={(val) =>
                          setTenant({ ...tenant, whatsapp_number: val })
                        }
                      />
                    </div>
                  </div>
                  {!isClientMode && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs text-neutral-300 mb-1">
                          Status
                        </label>
                        <select
                          value={tenant.status}
                          onChange={(e) =>
                            setTenant({
                              ...tenant,
                              status: e.target.value as "active" | "suspended",
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                        >
                          <option value="active">Ativo (Online)</option>
                          <option value="suspended">Suspenso (Manutenção)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-300 mb-1">
                          Plano
                        </label>
                        <select
                          value={tenant.plan_tier}
                          onChange={(e) =>
                            setTenant({
                              ...tenant,
                              plan_tier: e.target.value as "essencial" | "pro",
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                        >
                          <option value="essencial">Essencial</option>
                          <option value="pro">Pro</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="glass-card rounded-2xl p-5 space-y-3">
                  <h2 className="font-display text-lg uppercase text-white">
                    Rastreamento & Redes Sociais
                  </h2>
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={tenant.pixel_id || ""}
                      onChange={(e) =>
                        setTenant({
                          ...tenant,
                          pixel_id: e.target.value.trim() || null,
                        })
                      }
                      placeholder="Meta Pixel ID"
                      className="px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={tenant.gtm_id || ""}
                      onChange={(e) =>
                        setTenant({
                          ...tenant,
                          gtm_id: e.target.value.trim() || null,
                        })
                      }
                      placeholder="GTM ID (GTM-XXXX)"
                      className="px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                    />
                  </div>
                  <input
                    type="text"
                    value={tenant.social_links?.instagram || ""}
                    onChange={(e) =>
                      setTenant({
                        ...tenant,
                        social_links: {
                          ...tenant.social_links,
                          instagram: e.target.value,
                        },
                      })
                    }
                    placeholder="Instagram URL"
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={tenant.social_links?.facebook || ""}
                    onChange={(e) =>
                      setTenant({
                        ...tenant,
                        social_links: {
                          ...tenant.social_links,
                          facebook: e.target.value,
                        },
                      })
                    }
                    placeholder="Facebook URL"
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={tenant.social_links?.youtube || ""}
                    onChange={(e) =>
                      setTenant({
                        ...tenant,
                        social_links: {
                          ...tenant.social_links,
                          youtube: e.target.value,
                        },
                      })
                    }
                    placeholder="YouTube URL"
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {/* LEADS (MINI-CRM) */}
            {activeSection === "leads" && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl uppercase text-white">
                  Leads do Mini-Funil ({leads.length})
                </h2>

                {leads.length === 0 ? (
                  <div className="glass-card rounded-2xl p-10 text-center text-sm text-neutral-400">
                    Nenhum lead capturado ainda. Teste o botão &ldquo;Agendar Aula Experimental&rdquo; no site público!
                  </div>
                ) : (
                  <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-white/5 text-neutral-400 uppercase text-[11px]">
                          <tr>
                            <th className="px-4 py-3">Nome / Contato</th>
                            <th className="px-4 py-3">Modalidade</th>
                            <th className="px-4 py-3">Turno</th>
                            <th className="px-4 py-3">Origem (UTM)</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-white/[0.02]">
                              <td className="px-4 py-3">
                                <p className="font-semibold text-white">
                                  {lead.name}
                                </p>
                                <p className="text-xs text-neutral-400">
                                  {lead.phone || "Via WhatsApp direto"}
                                </p>
                              </td>
                              <td className="px-4 py-3 text-neutral-200">
                                {lead.chosen_modality}
                              </td>
                              <td className="px-4 py-3 text-neutral-300">
                                {lead.preferred_shift}
                              </td>
                              <td className="px-4 py-3 text-xs text-neutral-400">
                                {lead.utm_source || "Direto"}
                                {lead.utm_campaign
                                  ? ` / ${lead.utm_campaign}`
                                  : ""}
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  value={lead.status}
                                  onChange={(e) =>
                                    handleLeadStatus(
                                      lead.id,
                                      e.target.value as LeadStatus
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                                >
                                  <option value="novo">Novo</option>
                                  <option value="agendado">Aula Agendada</option>
                                  <option value="matriculado">Matriculado</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===============================================================
              COLUNA DIREITA: PREVIEW AO VIVO (STICKY)
             =============================================================== */}
          {!isLeadsTab && (
            <div className="lg:col-span-7 lg:sticky lg:top-[128px]">
              <SectionLivePreview
                tenant={tenant}
                activeSection={activeSection}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
