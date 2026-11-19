"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Dumbbell,
  ExternalLink,
  Facebook,
  Instagram,
  MapPin,
  MessageCircle,
  Sparkles,
  Youtube,
} from "lucide-react";
import type { TenantWithRelations } from "@/types/tenant";
import { hexToRgbTriplet } from "@/lib/colors";

interface LinkBioClientProps {
  tenant: TenantWithRelations;
}

export function LinkBioClient({ tenant }: LinkBioClientProps) {
  const primaryColor = tenant.theme_config?.primary || "#E11D48";
  const cssVars = {
    "--primary": primaryColor,
    "--primary-rgb": hexToRgbTriplet(primaryColor),
    "--bg": tenant.theme_config?.bg || "#0C0C0C",
    "--surface": tenant.theme_config?.surface || "#141414",
  } as React.CSSProperties;

  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: tenant.id,
        event_type: "page_view",
        source: "link-na-bio",
      }),
    }).catch(() => {});
  }, [tenant.id]);

  const cleanWa = tenant.whatsapp_number.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    `Olá! Vim pelo Link na Bio do Instagram da ${tenant.name} e quero agendar minha aula experimental gratuita.`
  )}`;

  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${tenant.name} ${tenant.address} ${tenant.neighborhood} ${tenant.city}`
  )}`;

  const trackWaClick = () => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: tenant.id,
        event_type: "whatsapp_click",
        source: "link-na-bio",
      }),
    }).catch(() => {});
  };

  return (
    <main
      style={cssVars}
      className="min-h-screen bg-[var(--bg)] text-neutral-100 flex flex-col items-center justify-between px-4 py-10 relative overflow-hidden"
    >
      {/* Brilho ambiente na cor primária do tenant */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[320px] rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{ backgroundColor: "var(--primary)" }}
      />

      <div className="w-full max-w-md space-y-7 relative z-10">
        {/* Perfil da Academia */}
        <div className="text-center space-y-3">
          {tenant.logo_url ? (
            <div className="w-24 h-24 rounded-3xl glass-panel p-3 mx-auto flex items-center justify-center border border-white/15">
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-brand-primary mx-auto flex items-center justify-center font-display font-bold text-3xl text-white shadow-xl shadow-brand-primary/30">
              {tenant.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="font-display text-3xl uppercase tracking-wide text-white">
              {tenant.name}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              {tenant.neighborhood} • {tenant.city}
            </p>
          </div>

          {tenant.modalities.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {tenant.modalities.slice(0, 4).map((m) => (
                <span
                  key={m.id}
                  className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300"
                >
                  {m.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            onClick={trackWaClick}
            className="btn-shimmer w-full py-4 px-5 rounded-2xl bg-brand-primary text-white font-bold text-sm uppercase tracking-wider shadow-xl shadow-brand-primary/30 hover:brightness-110 transition flex items-center justify-center gap-2.5"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Agendar Aula Experimental Gratuita</span>
          </a>

          <Link
            href={`/sites/${tenant.slug}#horarios`}
            className="w-full py-3.5 px-5 rounded-2xl glass-card hover:border-brand-primary/60 text-white font-semibold text-sm transition flex items-center justify-between"
          >
            <span className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-brand-primary" />
              Grade de Horários Interativa
            </span>
            <ExternalLink className="w-4 h-4 text-neutral-500" />
          </Link>

          <Link
            href={`/sites/${tenant.slug}#modalidades`}
            className="w-full py-3.5 px-5 rounded-2xl glass-card hover:border-brand-primary/60 text-white font-semibold text-sm transition flex items-center justify-between"
          >
            <span className="flex items-center gap-3">
              <Dumbbell className="w-4 h-4 text-brand-primary" />
              Conhecer Modalidades
            </span>
            <ExternalLink className="w-4 h-4 text-neutral-500" />
          </Link>

          <a
            href={mapsSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 px-5 rounded-2xl glass-card hover:border-brand-primary/60 text-white font-semibold text-sm transition flex items-center justify-between"
          >
            <span className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-brand-primary" />
              Como Chegar (Google Maps)
            </span>
            <ExternalLink className="w-4 h-4 text-neutral-500" />
          </a>

          <Link
            href={`/sites/${tenant.slug}`}
            className="w-full py-3.5 px-5 rounded-2xl glass-card hover:border-brand-primary/60 text-white font-semibold text-sm transition flex items-center justify-between"
          >
            <span className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              Site Oficial da Academia
            </span>
            <ExternalLink className="w-4 h-4 text-neutral-500" />
          </Link>
        </div>

        {/* Redes Sociais */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {tenant.social_links?.instagram && (
            <a
              href={tenant.social_links.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-11 h-11 rounded-2xl glass-card hover:bg-brand-primary flex items-center justify-center text-neutral-200 hover:text-white transition"
            >
              <Instagram className="w-5 h-5" />
            </a>
          )}
          {tenant.social_links?.facebook && (
            <a
              href={tenant.social_links.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-11 h-11 rounded-2xl glass-card hover:bg-brand-primary flex items-center justify-center text-neutral-200 hover:text-white transition"
            >
              <Facebook className="w-5 h-5" />
            </a>
          )}
          {tenant.social_links?.youtube && (
            <a
              href={tenant.social_links.youtube}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="w-11 h-11 rounded-2xl glass-card hover:bg-brand-primary flex items-center justify-center text-neutral-200 hover:text-white transition"
            >
              <Youtube className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>

      <footer className="pt-10 text-center text-[11px] text-neutral-500 relative z-10">
        {tenant.opening_hours && <p className="mb-1">{tenant.opening_hours}</p>}
        <p>
          Tecnologia <strong className="text-neutral-300">Nocaute Hub</strong>
        </p>
      </footer>
    </main>
  );
}

