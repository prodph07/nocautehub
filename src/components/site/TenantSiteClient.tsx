"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  Baby,
  Bus,
  Car,
  CheckCircle2,
  Clock,
  Droplets,
  Flame,
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Shield,
  ShowerHead,
  Star,
  Trophy,
  Wifi,
  Wind,
  X,
  Youtube,
  Facebook,
} from "lucide-react";
import type { AmenityItem, TargetAudienceItem, TenantWithRelations } from "@/types/tenant";
import { hexToRgbTriplet } from "@/lib/colors";
import { ScrollReveal } from "./ScrollReveal";
import { AnimatedCounter } from "./AnimatedCounter";
import { InteractiveSchedule } from "./InteractiveSchedule";
import { FaqAccordion } from "./FaqAccordion";
import { GallerySection } from "./GallerySection";
import { WhatsAppFunnelModal } from "./WhatsAppFunnelModal";
import { FloatingWhatsApp } from "./FloatingWhatsApp";

interface TenantSiteClientProps {
  tenant: TenantWithRelations;
  isPreview?: boolean;
}

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

export function TenantSiteClient({
  tenant,
  isPreview = false,
}: TenantSiteClientProps) {
  const [funnelOpen, setFunnelOpen] = useState(false);
  const [funnelModality, setFunnelModality] = useState<string | undefined>(
    undefined
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (isPreview) return;
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: tenant.id,
        event_type: "page_view",
        source: document.referrer || "direct",
      }),
    }).catch(() => {});
  }, [tenant.id, isPreview]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onScroll = () => setScrollY(Math.min(window.scrollY, 600));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openFunnel = (modalityName?: string) => {
    setFunnelModality(modalityName);
    setFunnelOpen(true);
    setMobileMenuOpen(false);
  };

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

  const navLinks = [
    { href: "#modalidades", label: "Modalidades" },
    { href: "#para-quem", label: "Para Quem É" },
    { href: "#equipe", label: "Equipe" },
    { href: "#estrutura", label: "Estrutura" },
    { href: "#horarios", label: "Horários" },
    { href: "#localizacao", label: "Localização" },
    { href: "#faq", label: "Dúvidas" },
  ];

  const marqueeItems =
    tenant.hero_config?.marquee_items?.length > 0
      ? tenant.hero_config.marquee_items
      : ["JIU-JITSU", "MUAY THAI", "BOXE", "DISCIPLINA", "DEFESA PESSOAL"];

  const directWaUrl = `https://wa.me/${tenant.whatsapp_number.replace(
    /\D/g,
    ""
  )}?text=${encodeURIComponent(
    `Olá! Vim pelo site da ${tenant.name} e gostaria de informações sobre a aula experimental gratuita.`
  )}`;

  return (
    <div style={cssVars} className="min-h-screen bg-[var(--bg)] text-neutral-100">
      {/* Faixa de Avisos Rápidos (Top Bar Dinâmica) */}
      {tenant.top_bar_config?.enabled && tenant.top_bar_config.text && (
        <div className="bg-brand-primary text-white text-xs sm:text-sm py-2 px-4 text-center font-medium">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2">
            <span>{tenant.top_bar_config.text}</span>
            {tenant.top_bar_config.cta_text && (
              <button
                type="button"
                onClick={() => openFunnel()}
                className="underline font-bold hover:opacity-90"
              >
                {tenant.top_bar_config.cta_text} →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navbar Fixa Glassmorphism */}
      <header className="sticky top-0 z-40 glass-panel border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-3 min-w-0">
            {tenant.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                className="h-9 sm:h-11 w-auto object-contain"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-primary flex items-center justify-center font-display font-bold text-lg text-white shrink-0">
                {tenant.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <span className="font-display text-lg sm:text-xl uppercase tracking-wider text-white block truncate leading-none">
                {tenant.name}
              </span>
              {tenant.neighborhood && (
                <span className="text-[11px] text-neutral-400 block truncate mt-0.5">
                  {tenant.neighborhood} • {tenant.city}
                </span>
              )}
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-6 text-sm text-neutral-300">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-white transition"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openFunnel()}
              className="btn-shimmer inline-flex items-center gap-1.5 min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl bg-brand-primary text-white font-bold text-xs sm:text-sm uppercase tracking-wide hover:brightness-110 active:scale-[0.97] transition shadow-lg shadow-brand-primary/25"
            >
              <span>Aula Grátis</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Abrir menu"
              className="lg:hidden w-11 h-11 rounded-xl bg-white/5 border border-white/10 active:scale-[0.95] flex items-center justify-center text-white transition"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#0E0E10] px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-200 hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => openFunnel()}
              className="w-full mt-2 py-3 rounded-xl bg-brand-primary text-white font-bold text-sm uppercase tracking-wide"
            >
              Agendar Aula Experimental Gratuita
            </button>
          </div>
        )}
      </header>

      {/* =====================================================================
          SEÇÃO 1: HERO SECTION (PRIMEIRA DOBRA - SUPORTA PRESETS FULL/SPLIT/MINIMAL)
         ===================================================================== */}
      {heroPreset === "split" ? (
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-xs font-semibold uppercase tracking-widest text-neutral-200">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span>
                  {tenant.hero_config?.eyebrow ||
                    `${tenant.neighborhood} • ${tenant.city}`}
                </span>
              </div>
              <h1 className="font-display text-4xl sm:text-6xl font-bold uppercase tracking-tight text-white leading-[0.98]">
                {tenant.hero_config?.headline ||
                  "TRANSFORME SEU CORPO E SUA MENTE NO TATAME"}
              </h1>
              <p className="text-base sm:text-lg text-neutral-300 leading-relaxed">
                {tenant.hero_config?.subheadline}
              </p>
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => openFunnel()}
                    className="btn-shimmer px-7 py-4 rounded-xl bg-brand-primary text-white font-bold text-sm sm:text-base uppercase tracking-wider hover:brightness-110 transition flex items-center justify-center gap-2.5 shadow-xl shadow-brand-primary/30"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>
                      {tenant.hero_config?.cta_text ||
                        "Agendar Aula Experimental Gratuita"}
                    </span>
                  </button>
                  <a
                    href="#horarios"
                    className="px-6 py-4 rounded-xl glass-card hover:bg-white/10 text-white font-semibold text-sm sm:text-base transition flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-brand-primary" />
                    <span>Ver Horários</span>
                  </a>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {tenant.hero_config?.objection_breaker ||
                      "Não precisa ter equipamento • Emprestamos luvas/kimono na 1ª aula"}
                  </span>
                </p>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/15 shadow-2xl">
                {tenant.hero_config?.media_type === "video" &&
                tenant.hero_config.media_url ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    src={tenant.hero_config.media_url}
                  />
                ) : (
                  <img
                    src={
                      tenant.hero_config?.media_url ||
                      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1400&q=85"
                    }
                    alt={tenant.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>
      ) : heroPreset === "minimal" ? (
        <section className="relative py-20 sm:py-28 overflow-hidden text-center">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] rounded-full blur-[130px] opacity-25 pointer-events-none"
            style={{ backgroundColor: "var(--primary)" }}
          />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-xs font-semibold uppercase tracking-widest text-neutral-200">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span>
                {tenant.hero_config?.eyebrow ||
                  `${tenant.neighborhood} • ${tenant.city}`}
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-white leading-[0.98]">
              {tenant.hero_config?.headline ||
                "TRANSFORME SEU CORPO E SUA MENTE NO TATAME"}
            </h1>
            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mx-auto">
              {tenant.hero_config?.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => openFunnel()}
                className="btn-shimmer w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-primary text-white font-bold text-sm sm:text-base uppercase tracking-wider hover:brightness-110 transition flex items-center justify-center gap-2.5 shadow-xl shadow-brand-primary/30"
              >
                <MessageCircle className="w-5 h-5" />
                <span>
                  {tenant.hero_config?.cta_text ||
                    "Agendar Aula Experimental Gratuita"}
                </span>
              </button>
              <a
                href="#horarios"
                className="w-full sm:w-auto px-6 py-4 rounded-xl glass-card hover:bg-white/10 text-white font-semibold text-sm sm:text-base transition flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4 text-brand-primary" />
                <span>Ver Horários</span>
              </a>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {tenant.hero_config?.objection_breaker ||
                  "Não precisa ter equipamento • Emprestamos luvas/kimono na 1ª aula"}
              </span>
            </p>
          </div>
        </section>
      ) : (
        <section className="relative min-h-[86vh] sm:min-h-[88vh] flex items-center overflow-hidden">
        {/* Background Media com Parallax Sutil e Vinheta */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate3d(0, ${scrollY * 0.14}px, 0) scale(1.06)`,
            willChange: "transform",
          }}
        >
          {tenant.hero_config?.media_type === "video" &&
          tenant.hero_config.media_url ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-55"
              src={tenant.hero_config.media_url}
            />
          ) : (
            <img
              src={
                tenant.hero_config?.media_url ||
                "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1800&q=85"
              }
              alt={tenant.name}
              className="w-full h-full object-cover opacity-50"
            />
          )}
        </div>

        {/* Gradientes escuros + Glow radial controlado (12%) */}
        <div
          className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full blur-[120px] opacity-15 pointer-events-none"
          style={{ backgroundColor: "var(--primary)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/80 to-transparent" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #09090B 10%, rgba(9,9,11,0.6) 55%, transparent 100%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-xs font-semibold uppercase tracking-widest text-neutral-200">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span>
                {tenant.hero_config?.eyebrow ||
                  `${tenant.neighborhood} • ${tenant.city}`}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-white leading-[0.98]">
              {tenant.hero_config?.headline ||
                "TRANSFORME SEU CORPO E SUA MENTE NO TATAME"}
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-xl">
              {tenant.hero_config?.subheadline}
            </p>

            <div className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => openFunnel()}
                  className="btn-shimmer px-7 py-4 rounded-xl bg-brand-primary text-white font-bold text-sm sm:text-base uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2.5 shadow-xl shadow-brand-primary/30"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>
                    {tenant.hero_config?.cta_text ||
                      "Agendar Aula Experimental Gratuita"}
                  </span>
                </button>

                <a
                  href="#horarios"
                  className="px-6 py-4 rounded-xl glass-card hover:bg-white/10 text-white font-semibold text-sm sm:text-base transition flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4 text-brand-primary" />
                  <span>Ver Horários</span>
                </a>
              </div>

              {/* Quebra de Objeção no CTA */}
              <p className="text-xs sm:text-sm text-neutral-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {tenant.hero_config?.objection_breaker ||
                    "Não precisa ter equipamento • Emprestamos luvas/kimono na 1ª aula"}
                </span>
              </p>
            </div>
          </div>
        </div>
        </section>
      )}

      {/* =====================================================================
          SEÇÃO 2: BARRA DE AUTORIDADE (CONTADORES ANIMADOS)
         ===================================================================== */}
      {tenant.authority_stats?.length > 0 && (
        <section className="border-y border-white/10 bg-[#111113]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {tenant.authority_stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="text-center sm:text-left sm:border-l sm:first:border-l-0 border-white/10 sm:pl-6 sm:first:pl-0"
                >
                  <div className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    <span className="text-brand-primary">
                      <AnimatedCounter
                        value={stat.value}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                        decimals={stat.decimals}
                      />
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MARQUEE INFINITO */}
      <div className="overflow-hidden border-b border-white/10 bg-[#0A0A0B] py-3.5 select-none">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[0, 1].map((loop) => (
            <div key={loop} className="flex items-center">
              {marqueeItems.map((word, idx) => (
                <span
                  key={`${loop}-${idx}`}
                  className="inline-flex items-center font-display text-sm sm:text-base uppercase tracking-[0.22em] text-neutral-400"
                >
                  <span className="px-6">{word}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================================
          SEÇÃO 3: MODALIDADES
         ===================================================================== */}
      <section id="modalidades" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="max-w-2xl mb-10 sm:mb-14">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                Escolha seu treino
              </span>
              <h2 className="font-display text-3xl sm:text-5xl uppercase text-white mt-2">
                Modalidades para todos os objetivos
              </h2>
              <p className="text-neutral-400 mt-3 text-sm sm:text-base">
                Aulas estruturadas por nível para você evoluir com técnica, segurança e condicionamento real.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {tenant.modalities.map((mod, idx) => (
              <ScrollReveal key={mod.id} delayMs={idx * 60}>
                <article className="group h-full flex flex-col rounded-2xl overflow-hidden bg-[var(--surface)] border border-white/10 hover:border-brand-primary transition-all duration-300 shadow-lg hover:shadow-brand-primary/10">
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900">
                    <img
                      src={mod.image_url}
                      alt={mod.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/20 to-transparent" />
                    <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-neutral-100 border border-white/10">
                      {mod.target_audience}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl uppercase text-white group-hover:text-brand-primary transition-colors">
                        {mod.name}
                      </h3>
                      <p className="text-sm text-neutral-400 mt-2 leading-relaxed line-clamp-2">
                        {mod.short_desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openFunnel(mod.name)}
                      className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-brand-primary border border-white/10 hover:border-brand-primary text-white font-semibold text-sm transition flex items-center justify-center gap-2"
                    >
                      <span>Agendar {mod.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>

          {/* CTA Estratégico após Modalidades */}
          <ScrollReveal className="mt-10">
            <div className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-5 border border-brand-primary/25">
              <div>
                <h3 className="font-display text-2xl uppercase text-white">
                  Em dúvida sobre qual modalidade escolher?
                </h3>
                <p className="text-sm text-neutral-300 mt-1">
                  Converse com nossa equipe no WhatsApp e descubra qual turma combina melhor com seu objetivo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openFunnel()}
                className="btn-shimmer shrink-0 w-full md:w-auto px-6 py-3.5 rounded-xl bg-brand-primary text-white font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Falar no WhatsApp</span>
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* =====================================================================
          SEÇÃO 4: PARA QUEM É (QUEBRA DE MEDO)
         ===================================================================== */}
      {tenant.target_audience?.length > 0 && (
        <section
          id="para-quem"
          className="py-16 sm:py-24 bg-[#101012] border-y border-white/5"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                  Para Quem É
                </span>
                <h2 className="font-display text-3xl sm:text-5xl uppercase text-white mt-2">
                  Você não precisa estar em forma para começar
                </h2>
                <p className="text-neutral-400 mt-3 text-sm sm:text-base">
                  Nosso tatame foi feito para acolher quem nunca lutou e desafiar quem busca alto rendimento.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {tenant.target_audience.map((item, idx) => {
                const Icon = AUDIENCE_ICONS[item.icon] || Shield;
                return (
                  <ScrollReveal key={item.id || idx} delayMs={idx * 70}>
                    <div className="glass-card rounded-2xl p-6 h-full flex flex-col gap-4 hover:border-brand-primary/50 transition">
                      <div className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-xl bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2.5 py-1 rounded-full bg-white/5">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="font-display text-xl uppercase text-white">
                        {item.title}
                      </h3>
                      <p className="text-sm text-neutral-400 leading-relaxed flex-1">
                        {item.description}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          SEÇÃO 5: MESTRE E EQUIPE
         ===================================================================== */}
      {tenant.instructors?.length > 0 && (
        <section id="equipe" className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="max-w-2xl mb-12">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                  Mestre e Equipe Técnica
                </span>
                <h2 className="font-display text-3xl sm:text-5xl uppercase text-white mt-2">
                  Aprenda com quem vive o tatame há décadas
                </h2>
                <p className="text-neutral-400 mt-3 text-sm sm:text-base">
                  Professores graduados, didática acessível e acompanhamento próximo em cada treino.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tenant.instructors.map((inst, idx) => (
                <ScrollReveal key={inst.id} delayMs={idx * 80}>
                  <div className="rounded-2xl overflow-hidden bg-[var(--surface)] border border-white/10 h-full flex flex-col">
                    <div className="relative aspect-[4/4] overflow-hidden bg-neutral-900">
                      <img
                        src={inst.photo_url}
                        alt={inst.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-primary text-white text-xs font-bold">
                          <Award className="w-3.5 h-3.5" />
                          {inst.experience_years} anos de tatame
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col gap-2">
                      <h3 className="font-display text-2xl uppercase text-white">
                        {inst.name}
                      </h3>
                      <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
                        {inst.rank}
                      </p>
                      {inst.lineage && (
                        <p className="text-xs text-neutral-500">{inst.lineage}</p>
                      )}
                      <p className="text-sm text-neutral-300 leading-relaxed mt-2">
                        {inst.bio}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          SEÇÃO 6: ESTRUTURA E TATAME
         ===================================================================== */}
      {tenant.gallery_images?.length > 0 && (
        <section
          id="estrutura"
          className="py-16 sm:py-24 bg-[#101012] border-y border-white/5"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="max-w-2xl mb-10 sm:mb-12">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                  Estrutura e Higiene
                </span>
                <h2 className="font-display text-3xl sm:text-5xl uppercase text-white mt-2">
                  Tatame limpo, climatizado e pronto para você
                </h2>
                <p className="text-neutral-400 mt-3 text-sm sm:text-base">
                  Higienização rigorosa entre turnos, vestiários completos e espaço confortável para pais e acompanhantes.
                </p>
              </div>
            </ScrollReveal>

            <GallerySection images={tenant.gallery_images} />
          </div>
        </section>
      )}

      {/* =====================================================================
          SEÇÃO 7: GRADE DE HORÁRIOS INTERATIVA
         ===================================================================== */}
      <section id="horarios" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="max-w-2xl mb-10">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                Horários dos Treinos
              </span>
              <h2 className="font-display text-3xl sm:text-5xl uppercase text-white mt-2">
                Encontre o horário ideal na sua rotina
              </h2>
              <p className="text-neutral-400 mt-3 text-sm sm:text-base">
                Filtre por dia ou modalidade e clique em qualquer aula para agendar sua experimental gratuita.
              </p>
            </div>
          </ScrollReveal>

          <InteractiveSchedule
            modalities={tenant.modalities}
            schedules={tenant.schedules}
            onBookModality={(mod) => openFunnel(mod)}
          />

          {/* CTA Estratégico após Grade de Horários */}
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => openFunnel()}
              className="btn-shimmer inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-brand-primary text-white font-bold text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-brand-primary/25 hover:brightness-110 transition"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Reservar Minha Aula Experimental</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SEÇÃO 8: DEPOIMENTOS REAIS
         ===================================================================== */}
      {tenant.testimonials?.length > 0 && (
        <section className="py-16 sm:py-24 bg-[#101012] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
                <div className="max-w-xl">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                    Avaliações Reais
                  </span>
                  <h2 className="font-display text-3xl sm:text-5xl uppercase text-white mt-2">
                    O que nossos alunos dizem
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-sm">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-white">4.9</span>
                  <span className="text-neutral-400 text-xs">no Google</span>
                </div>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tenant.testimonials.map((t, idx) => (
                <ScrollReveal key={t.id} delayMs={idx * 70}>
                  <div className="glass-card rounded-2xl p-6 h-full flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex text-amber-400 gap-0.5">
                          {Array.from({ length: t.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        <span className="text-[11px] text-neutral-500 font-medium">
                          {t.source || "Google"}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-200 leading-relaxed">
                        &ldquo;{t.text}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                      {t.avatar_url ? (
                        <img
                          src={t.avatar_url}
                          alt={t.author_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-primary/20 border border-brand-primary/30 text-brand-primary font-bold text-sm flex items-center justify-center">
                          {t.author_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm text-white">
                          {t.author_name}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {t.role_or_modality}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          SEÇÃO 9: LOCALIZAÇÃO E FACILIDADES
         ===================================================================== */}
      <section id="localizacao" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                    Localização e Facilidades
                  </span>
                  <h2 className="font-display text-3xl sm:text-5xl uppercase text-white mt-2">
                    Venha conhecer nosso tatame
                  </h2>
                  <div className="mt-5 space-y-2.5 text-sm text-neutral-300">
                    <p className="flex items-start gap-2.5">
                      <MapPin className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white block">
                          {tenant.address}
                        </strong>
                        {tenant.neighborhood} — {tenant.city}
                      </span>
                    </p>
                    {tenant.reference_point && (
                      <p className="text-xs text-neutral-400 pl-7">
                        Ponto de referência: {tenant.reference_point}
                      </p>
                    )}
                    {tenant.opening_hours && (
                      <p className="flex items-center gap-2.5 pt-1">
                        <Clock className="w-4 h-4 text-brand-primary shrink-0" />
                        <span>{tenant.opening_hours}</span>
                      </p>
                    )}
                  </div>
                </div>

                {tenant.amenities?.length > 0 && (
                  <div className="grid grid-cols-2 gap-2.5">
                    {tenant.amenities.map((a, idx) => {
                      const Icon = AMENITY_ICONS[a.icon] || CheckCircle2;
                      return (
                        <div
                          key={idx}
                          className="glass-card rounded-xl px-3.5 py-3 flex items-center gap-2.5 text-xs sm:text-sm text-neutral-200"
                        >
                          <Icon className="w-4 h-4 text-brand-primary shrink-0" />
                          <span>{a.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="lg:col-span-7 min-h-[320px] sm:min-h-[400px] rounded-2xl overflow-hidden border border-white/10 bg-[#141414]">
                {tenant.google_maps_embed ? (
                  <iframe
                    src={tenant.google_maps_embed}
                    title={`Mapa de ${tenant.name}`}
                    className="w-full h-full min-h-[320px] sm:min-h-[400px] grayscale-[25%] contrast-[1.05]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm p-6 text-center">
                    Mapa interativo não configurado ainda.
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* =====================================================================
          SEÇÃO 10: FAQ (ACORDEÃO) + CTA FINAL DE ENCERRAMENTO
         ===================================================================== */}
      <section
        id="faq"
        className="py-16 sm:py-24 bg-[#101012] border-t border-white/5"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-10 sm:mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
                Perguntas Frequentes
              </span>
              <h2 className="font-display text-3xl sm:text-5xl uppercase text-white mt-2">
                Tire suas dúvidas antes da 1ª aula
              </h2>
            </div>
          </ScrollReveal>

          {tenant.faqs?.length > 0 && <FaqAccordion items={tenant.faqs} />}

          {/* CTA de Encerramento da Página */}
          <ScrollReveal className="mt-14">
            <div className="relative rounded-3xl overflow-hidden border border-brand-primary/40 border-t-white/20 bg-gradient-to-br from-brand-primary/20 via-[#141417] to-[#09090B] p-8 sm:p-12 text-center space-y-5">
              <div
                className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[260px] rounded-full blur-[120px] opacity-20 pointer-events-none"
                style={{ backgroundColor: "var(--primary)" }}
              />
              <span className="inline-block text-xs font-bold uppercase tracking-[0.22em] text-brand-primary">
                Dê o primeiro passo hoje
              </span>
              <h2 className="font-display text-3xl sm:text-5xl uppercase text-white">
                Sua primeira aula experimental é por nossa conta
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto">
                Agende em menos de 30 segundos pelo WhatsApp. Venha conhecer a equipe, o tatame e sentir na prática a energia do treino.
              </p>
              <div className="pt-2 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => openFunnel()}
                  className="btn-shimmer px-8 py-4 rounded-xl bg-brand-primary text-white font-bold text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-brand-primary/30 hover:brightness-110 transition inline-flex items-center gap-2.5"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Agendar Aula Experimental Gratuita</span>
                </button>
                <span className="text-xs text-neutral-400">
                  {tenant.hero_config?.objection_breaker ||
                    "Não precisa ter equipamento • Emprestamos luvas/kimono na 1ª aula"}
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* =====================================================================
          SEÇÃO 11: FOOTER (RODAPÉ)
         ===================================================================== */}
      <footer className="bg-[#080809] border-t border-white/10 pt-14 pb-24 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-white/10">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                {tenant.logo_url ? (
                  <img
                    src={tenant.logo_url}
                    alt={tenant.name}
                    className="h-9 w-auto object-contain"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center font-display font-bold text-white">
                    {tenant.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="font-display text-2xl uppercase text-white">
                  {tenant.name}
                </span>
              </div>
              <p className="text-sm text-neutral-400 max-w-md">
                {tenant.address} — {tenant.neighborhood}, {tenant.city}
              </p>
              {tenant.opening_hours && (
                <p className="text-xs text-neutral-500">{tenant.opening_hours}</p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-display text-sm uppercase tracking-widest text-neutral-300">
                Navegação
              </h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="hover:text-white transition"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-display text-sm uppercase tracking-widest text-neutral-300">
                Contato & Redes
              </h4>
              <div className="flex items-center gap-2.5">
                {tenant.social_links?.instagram && (
                  <a
                    href={tenant.social_links.instagram}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-brand-primary border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {tenant.social_links?.facebook && (
                  <a
                    href={tenant.social_links.facebook}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-brand-primary border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {tenant.social_links?.youtube && (
                  <a
                    href={tenant.social_links.youtube}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-brand-primary border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>

              <a
                href={directWaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-[#25D366] border border-white/10 text-xs font-semibold text-white transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chamar no WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
            <p>
              © {new Date().getFullYear()} {tenant.name}. Todos os direitos reservados.
            </p>
            <p>
              Tecnologia{" "}
              <span className="text-neutral-300 font-semibold">Nocaute Hub</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Mini-Funil de WhatsApp (2 Etapas) */}
      <WhatsAppFunnelModal
        open={funnelOpen}
        onClose={() => setFunnelOpen(false)}
        tenantId={tenant.id}
        tenantName={tenant.name}
        whatsappNumber={tenant.whatsapp_number}
        modalities={tenant.modalities}
        initialModality={funnelModality}
      />

      {/* Botão Flutuante Inteligente */}
      <FloatingWhatsApp onOpenFunnel={() => openFunnel()} />
    </div>
  );
}

