"use client";

import { useState } from "react";
import {
  Award,
  Baby,
  Bus,
  Car,
  CheckCircle2,
  Clock,
  Droplets,
  Eye,
  Flame,
  Layers,
  MapPin,
  MessageCircle,
  Monitor,
  Shield,
  ShowerHead,
  Smartphone,
  Star,
  Trophy,
  Wifi,
  Wind,
  ArrowRight,
  Lock,
} from "lucide-react";
import type {
  AmenityItem,
  TargetAudienceItem,
  TenantWithRelations,
} from "@/types/tenant";
import { hexToRgbTriplet } from "@/lib/colors";
import { InteractiveSchedule } from "@/components/site/InteractiveSchedule";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { TenantSiteClient } from "@/components/site/TenantSiteClient";

export type EditorSectionKey =
  | "hero"
  | "autoridade"
  | "modalidades"
  | "para-quem"
  | "equipe"
  | "estrutura"
  | "horarios"
  | "depoimentos"
  | "localizacao"
  | "faq"
  | "config"
  | "leads";

interface SectionLivePreviewProps {
  tenant: TenantWithRelations;
  activeSection: EditorSectionKey;
}

const SECTION_TITLES: Record<EditorSectionKey, string> = {
  hero: "1. Capa (Hero), Topo & Visual",
  autoridade: "2. Barra de Autoridade",
  modalidades: "3. Modalidades",
  "para-quem": "4. Para Quem É (Quebra de Medo)",
  equipe: "5. Mestre e Equipe",
  estrutura: "6. Estrutura e Tatame",
  horarios: "7. Grade de Horários Interativa",
  depoimentos: "8. Depoimentos Reais",
  localizacao: "9. Localização e Facilidades",
  faq: "10. FAQ & CTA Final",
  config: "Configurações, Domínio & Rodapé",
  leads: "Leads",
};

const AUDIENCE_ICONS: Record<TargetAudienceItem["icon"], typeof Shield> = {
  shield: Shield,
  flame: Flame,
  baby: Baby,
  trophy: Trophy,
};

const AMENITY_ICONS: Record<AmenityItem["icon"], typeof Car> = {
  car: Car,
  wind: Wind,
  shower: ShowerHead,
  droplets: Droplets,
  bus: Bus,
  wifi: Wifi,
  baby: Baby,
  shield: Shield,
};

export function SectionLivePreview({
  tenant,
  activeSection,
}: SectionLivePreviewProps) {
  const [device, setDevice] = useState<"mobile" | "desktop">("desktop");
  const [viewMode, setViewMode] = useState<"section" | "full">("section");

  const primaryRgb = hexToRgbTriplet(tenant.theme_config?.primary || "#E11D48");
  const fontPreset = tenant.theme_config?.font_preset || "condensada";
  const heroPreset = tenant.theme_config?.hero_preset || "full";
  const displayFontFamily =
    fontPreset === "geometrica"
      ? '"Space Grotesk", ui-sans-serif, system-ui, sans-serif'
      : fontPreset === "marcial"
      ? '"Cinzel", Georgia, serif'
      : '"Oswald", ui-sans-serif, system-ui, sans-serif';

  const cssVars = {
    "--font-display": displayFontFamily,
    "--primary": tenant.theme_config?.primary || "#E11D48",
    "--primary-rgb": primaryRgb,
    "--secondary": tenant.theme_config?.secondary || "#F59E0B",
    "--bg": tenant.theme_config?.bg || "#0C0C0C",
    "--surface": tenant.theme_config?.surface || "#141414",
  } as React.CSSProperties;

  const previewUrl =
    tenant.custom_domain || `${tenant.slug || "sua-academia"}.nocautehub.com.br`;

  const renderFocusedSection = () => {
    switch (activeSection) {
      case "hero":
        return (
          <div>
            {/* Top bar */}
            {tenant.top_bar_config?.enabled && tenant.top_bar_config.text && (
              <div className="bg-brand-primary text-white text-[11px] py-1.5 px-3 text-center font-medium">
                {tenant.top_bar_config.text}{" "}
                {tenant.top_bar_config.cta_text && (
                  <span className="underline font-bold ml-1">
                    {tenant.top_bar_config.cta_text} →
                  </span>
                )}
              </div>
            )}

            {/* Navbar preview */}
            <div className="px-4 py-3 border-b border-white/10 bg-[#101012]/90 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {tenant.logo_url ? (
                  <img
                    src={tenant.logo_url}
                    alt={tenant.name}
                    className="h-7 w-auto object-contain"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-brand-primary flex items-center justify-center font-display font-bold text-xs text-white shrink-0">
                    {tenant.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-display text-sm uppercase text-white truncate leading-none">
                    {tenant.name}
                  </p>
                  <p className="text-[10px] text-neutral-400 truncate">
                    {tenant.neighborhood} • {tenant.city}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1.5 rounded-lg bg-brand-primary text-white text-[10px] font-bold uppercase shrink-0">
                Aula Gratuita
              </span>
            </div>

            {/* Hero (respeitando preset full / split / minimal) */}
            {heroPreset === "split" ? (
              <div className="p-5 sm:p-7 grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-semibold uppercase tracking-widest text-neutral-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                    {tenant.hero_config?.eyebrow || "Bairro • Cidade"}
                  </span>
                  <h2 className="font-display font-bold uppercase text-white leading-[0.98] text-2xl sm:text-3xl">
                    {tenant.hero_config?.headline || "SUA MANCHETE AQUI"}
                  </h2>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {tenant.hero_config?.subheadline}
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs uppercase tracking-wider">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{tenant.hero_config?.cta_text || "Agendar Aula"}</span>
                  </div>
                </div>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/15">
                  <img
                    src={
                      tenant.hero_config?.media_url ||
                      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=900&q=80"
                    }
                    alt="Hero split"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : heroPreset === "minimal" ? (
              <div className="relative p-7 sm:p-10 text-center space-y-4 overflow-hidden">
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-44 rounded-full blur-[90px] opacity-25 pointer-events-none"
                  style={{ backgroundColor: "var(--primary)" }}
                />
                <span className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-semibold uppercase tracking-widest text-neutral-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                  {tenant.hero_config?.eyebrow || "Bairro • Cidade"}
                </span>
                <h2 className="relative z-10 font-display font-bold uppercase text-white leading-[0.98] text-3xl sm:text-4xl">
                  {tenant.hero_config?.headline || "SUA MANCHETE AQUI"}
                </h2>
                <p className="relative z-10 text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
                  {tenant.hero_config?.subheadline}
                </p>
                <div className="relative z-10 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-primary text-white font-bold text-xs uppercase tracking-wider">
                  <MessageCircle className="w-4 h-4" />
                  <span>{tenant.hero_config?.cta_text || "Agendar Aula"}</span>
                </div>
              </div>
            ) : (
              <div className="relative min-h-[380px] flex items-center overflow-hidden p-5 sm:p-8">
                <img
                  src={
                    tenant.hero_config?.media_url ||
                    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80"
                  }
                  alt="Hero preview"
                  className="absolute inset-0 w-full h-full object-cover opacity-45"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0C0C0C] via-[#0C0C0C]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-transparent" />

                <div className="relative z-10 max-w-lg space-y-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-semibold uppercase tracking-widest text-neutral-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                    {tenant.hero_config?.eyebrow || "Bairro • Cidade"}
                  </span>

                  <h2
                    className={`font-display font-bold uppercase text-white leading-[0.98] ${
                      device === "mobile" ? "text-3xl" : "text-4xl"
                    }`}
                  >
                    {tenant.hero_config?.headline || "SUA MANCHETE AQUI"}
                  </h2>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {tenant.hero_config?.subheadline}
                  </p>

                  <div className="space-y-2 pt-1">
                    <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-primary text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-primary/30">
                      <MessageCircle className="w-4 h-4" />
                      <span>
                        {tenant.hero_config?.cta_text ||
                          "Agendar Aula Experimental Gratuita"}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{tenant.hero_config?.objection_breaker}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Marquee */}
            <div className="overflow-hidden border-y border-white/10 bg-[#0A0A0B] py-2.5">
              <div className="flex whitespace-nowrap animate-marquee w-max">
                {[0, 1].map((loop) => (
                  <div key={loop} className="flex items-center">
                    {(tenant.hero_config?.marquee_items?.length
                      ? tenant.hero_config.marquee_items
                      : ["JIU-JITSU", "MUAY THAI", "BOXE"]
                    ).map((word, idx) => (
                      <span
                        key={`${loop}-${idx}`}
                        className="inline-flex items-center font-display text-xs uppercase tracking-[0.2em] text-neutral-400"
                      >
                        <span className="px-4">{word}</span>
                        <span className="w-1 h-1 rounded-full bg-brand-primary" />
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "autoridade":
        return (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                Barra de Autoridade (Logo abaixo do Hero)
              </span>
              <p className="text-xs text-neutral-400">
                No site público, esses números animam de 0 até o valor final ao rolar.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#111113] p-6">
              <div
                className={`grid gap-6 ${
                  device === "mobile" ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
                }`}
              >
                {(tenant.authority_stats || []).map((stat, idx) => (
                  <div key={idx} className="text-center sm:text-left">
                    <div className="font-display text-3xl font-bold text-brand-primary">
                      {stat.prefix || ""}
                      {stat.decimals
                        ? Number(stat.value).toFixed(stat.decimals).replace(".", ",")
                        : Number(stat.value).toLocaleString("pt-BR")}
                      {stat.suffix}
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "modalidades":
        return (
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                Modalidades
              </span>
              <h3 className="font-display text-2xl uppercase text-white mt-1">
                Escolha sua arte marcial e comece hoje
              </h3>
            </div>

            <div
              className={`grid gap-4 ${
                device === "mobile" ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {tenant.modalities.map((mod) => (
                <div
                  key={mod.id}
                  className="group rounded-xl overflow-hidden bg-[var(--surface)] border border-white/10 hover:border-brand-primary transition flex flex-col"
                >
                  <div className="relative aspect-[16/10] bg-neutral-900 overflow-hidden">
                    {mod.image_url && (
                      <img
                        src={mod.image_url}
                        alt={mod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/20 to-transparent" />
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-black/75 text-white border border-white/10">
                      {mod.target_audience}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="font-display text-lg uppercase text-white">
                        {mod.name}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                        {mod.short_desc}
                      </p>
                    </div>
                    <div className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5">
                      <span>Agendar {mod.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-brand-primary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "para-quem":
        return (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                Para Quem É
              </span>
              <h3 className="font-display text-2xl uppercase text-white mt-1">
                Você não precisa estar em forma para começar
              </h3>
            </div>

            <div
              className={`grid gap-3.5 ${
                device === "mobile" ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {(tenant.target_audience || []).map((item, idx) => {
                const Icon = AUDIENCE_ICONS[item.icon] || Shield;
                return (
                  <div
                    key={item.id || idx}
                    className="glass-card rounded-xl p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-lg bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 px-2 py-0.5 rounded-full bg-white/5">
                        {item.badge}
                      </span>
                    </div>
                    <h4 className="font-display text-lg uppercase text-white">
                      {item.title}
                    </h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "equipe":
        return (
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                Mestre e Equipe Técnica
              </span>
              <h3 className="font-display text-2xl uppercase text-white mt-1">
                Aprenda com quem vive o tatame
              </h3>
            </div>
            <div
              className={`grid gap-4 ${
                device === "mobile" ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {tenant.instructors.map((inst) => (
                <div
                  key={inst.id}
                  className="rounded-xl overflow-hidden bg-[var(--surface)] border border-white/10"
                >
                  <div className="relative aspect-[4/3] bg-neutral-900">
                    {inst.photo_url && (
                      <img
                        src={inst.photo_url}
                        alt={inst.name}
                        className="w-full h-full object-cover object-top"
                      />
                    )}
                    <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-primary text-white text-[10px] font-bold">
                      <Award className="w-3 h-3" />
                      {inst.experience_years} anos
                    </span>
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="font-display text-lg uppercase text-white">
                      {inst.name}
                    </h4>
                    <p className="text-[11px] font-semibold uppercase text-brand-primary">
                      {inst.rank}
                    </p>
                    {inst.lineage && (
                      <p className="text-[11px] text-neutral-500">{inst.lineage}</p>
                    )}
                    <p className="text-xs text-neutral-300 pt-1 line-clamp-3">
                      {inst.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "estrutura":
        return (
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                Estrutura e Higiene
              </span>
              <h3 className="font-display text-2xl uppercase text-white mt-1">
                Tatame limpo, climatizado e pronto
              </h3>
            </div>
            <div
              className={`grid gap-3 ${
                device === "mobile" ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {(tenant.gallery_images || []).map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-[#141414]"
                >
                  {img.url && (
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <span className="inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-brand-primary text-white mb-1">
                      {img.category}
                    </span>
                    <p className="text-xs text-white leading-snug">
                      {img.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "horarios":
        return (
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                Grade de Horários Interativa
              </span>
              <h3 className="font-display text-2xl uppercase text-white mt-1">
                Encontre o horário ideal
              </h3>
            </div>
            <InteractiveSchedule
              modalities={tenant.modalities}
              schedules={tenant.schedules}
              onBookModality={() => {}}
            />
          </div>
        );

      case "depoimentos":
        return (
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                Avaliações Reais
              </span>
              <h3 className="font-display text-2xl uppercase text-white mt-1">
                O que nossos alunos dizem
              </h3>
            </div>
            <div className="space-y-3">
              {tenant.testimonials.map((t) => (
                <div key={t.id} className="glass-card rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400 gap-0.5">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] text-neutral-500">
                      {t.source || "Google"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-200 leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-2.5 pt-2 border-t border-white/5">
                    <div className="w-7 h-7 rounded-full bg-brand-primary/20 text-brand-primary font-bold text-[10px] flex items-center justify-center">
                      {t.author_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {t.author_name}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {t.role_or_modality}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "localizacao":
        return (
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                Localização e Facilidades
              </span>
              <h3 className="font-display text-2xl uppercase text-white mt-1">
                Venha conhecer nosso tatame
              </h3>
            </div>

            <div className="space-y-2 text-xs text-neutral-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block">{tenant.address}</strong>
                  {tenant.neighborhood} — {tenant.city}
                </span>
              </p>
              {tenant.reference_point && (
                <p className="text-[11px] text-neutral-400 pl-6">
                  Referência: {tenant.reference_point}
                </p>
              )}
              {tenant.opening_hours && (
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                  <span>{tenant.opening_hours}</span>
                </p>
              )}
            </div>

            {tenant.amenities?.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {tenant.amenities.map((a, idx) => {
                  const Icon = AMENITY_ICONS[a.icon] || CheckCircle2;
                  return (
                    <div
                      key={idx}
                      className="glass-card rounded-lg px-3 py-2 flex items-center gap-2 text-xs text-neutral-200"
                    >
                      <Icon className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      <span className="truncate">{a.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="h-52 rounded-xl overflow-hidden border border-white/10 bg-[#141414]">
              {tenant.google_maps_embed ? (
                <iframe
                  src={tenant.google_maps_embed}
                  title="Mapa Preview"
                  className="w-full h-full grayscale-[25%]"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                  Cole o link embed do Google Maps ao lado
                </div>
              )}
            </div>
          </div>
        );

      case "faq":
        return (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                Perguntas Frequentes
              </span>
              <h3 className="font-display text-2xl uppercase text-white mt-1">
                Tire suas dúvidas antes da 1ª aula
              </h3>
            </div>
            <FaqAccordion items={tenant.faqs || []} />
          </div>
        );

      default:
        return (
          <div className="p-6 space-y-5">
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                Cartão de Pré-visualização (WhatsApp / OpenGraph)
              </span>
              <div className="rounded-xl overflow-hidden border border-white/10 bg-[#111113]">
                {tenant.hero_config?.media_url && (
                  <img
                    src={tenant.hero_config.media_url}
                    alt="OG Preview"
                    className="w-full h-36 object-cover"
                  />
                )}
                <div className="p-3.5 space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                    {previewUrl}
                  </p>
                  <p className="font-semibold text-sm text-white">
                    {tenant.name} — {tenant.hero_config?.eyebrow || tenant.city}
                  </p>
                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {tenant.hero_config?.subheadline}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-2 text-xs text-neutral-300">
              <p className="font-semibold text-white">Resumo de Status</p>
              <p>
                Status:{" "}
                <strong
                  className={
                    tenant.status === "active"
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }
                >
                  {tenant.status === "active" ? "Ativo (Online)" : "Suspenso (Manutenção)"}
                </strong>
              </p>
              <p>
                WhatsApp configurado:{" "}
                <code className="text-neutral-200">{tenant.whatsapp_number}</code>
              </p>
              <p>
                Meta Pixel:{" "}
                <code className="text-neutral-200">
                  {tenant.pixel_id || "Não configurado"}
                </code>
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Barra de controles do Preview */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-xs font-semibold text-neutral-200 truncate">
            Preview Ao Vivo •{" "}
            <span className="text-neutral-400 font-normal">
              {viewMode === "full"
                ? "Site Completo"
                : SECTION_TITLES[activeSection]}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle Foco vs Site Completo */}
          <div className="inline-flex rounded-lg bg-white/5 border border-white/10 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("section")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 transition ${
                viewMode === "section"
                  ? "bg-white/15 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Seção</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("full")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 transition ${
                viewMode === "full"
                  ? "bg-white/15 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Site Todo</span>
            </button>
          </div>

          {/* Toggle Celular vs Desktop */}
          <div className="inline-flex rounded-lg bg-white/5 border border-white/10 p-0.5">
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              title="Visualização Mobile (Celular)"
              className={`p-1.5 rounded-md transition ${
                device === "mobile"
                  ? "bg-rose-600 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              title="Visualização Desktop"
              className={`p-1.5 rounded-md transition ${
                device === "desktop"
                  ? "bg-rose-600 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Palco do Preview */}
      <div className="flex-1 flex justify-center items-start overflow-hidden">
        <div
          style={cssVars}
          className={`transition-all duration-300 bg-[var(--bg)] text-neutral-100 overflow-hidden flex flex-col ${
            device === "mobile"
              ? "w-[390px] max-w-full rounded-[2.2rem] border-[6px] border-neutral-800 shadow-2xl max-h-[calc(100vh-190px)]"
              : "w-full rounded-2xl border border-white/10 shadow-2xl max-h-[calc(100vh-190px)]"
          }`}
        >
          {/* Barra de endereço fake do navegador/celular */}
          <div className="px-3.5 py-2 bg-[#161618] border-b border-white/10 flex items-center gap-2 shrink-0">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            </div>
            <div className="flex-1 mx-2 px-2.5 py-1 rounded-md bg-black/50 border border-white/5 text-[10px] text-neutral-400 flex items-center justify-center gap-1.5 truncate">
              <Lock className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <span className="truncate">{previewUrl}</span>
            </div>
          </div>

          {/* Conteúdo rolável do Preview */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {viewMode === "full" ? (
              <div className="pointer-events-auto">
                <TenantSiteClient tenant={tenant} isPreview />
              </div>
            ) : (
              renderFocusedSection()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

