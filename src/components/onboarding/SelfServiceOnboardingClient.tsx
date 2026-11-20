"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Eye,
  Loader2,
  MessageCircle,
  Sparkles,
  Users,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { BRAND_COLOR_PRESETS } from "@/lib/colors";
import { WhatsAppInput } from "@/components/shared/WhatsAppInput";
import { CepAddressFields } from "@/components/shared/CepAddressFields";
import {
  buildSalesWhatsAppUrl,
  trackPlatformConversion,
} from "@/lib/pixel-events";
import { formatBrlFromCents, PLAN_PRICING } from "@/lib/pagarme";

export function SelfServiceOnboardingClient({
  trialDays,
}: {
  trialDays: number;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#E11D48");
  const [planTier, setPlanTier] = useState<"essencial" | "pro">("pro");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPassword, setClientPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdResult, setCreatedResult] = useState<{
    name: string;
    slug: string;
    planTier: "essencial" | "pro";
    previewUrl: string;
    adminUrl: string;
    checkoutUrl: string;
  } | null>(null);

  const handleDirectWhatsAppClick = () => {
    trackPlatformConversion("Lead", {
      content_name: "Criar Junto via WhatsApp (/criar)",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanWa = whatsapp.replace(/\D/g, "");
    if (cleanWa.length < 12) {
      setErrorMsg("Informe um WhatsApp válido com DDD (ex: (21) 99999-9999).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/public/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug || undefined,
          whatsapp_number: cleanWa,
          address,
          neighborhood,
          city,
          primary_color: primaryColor,
          plan_tier: planTier,
          client_email: clientEmail,
          client_password: clientPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(
          data.error || "Não foi possível gerar o site. Tente novamente."
        );
        return;
      }

      // Dispara conversão de cadastro concluído / lead no Pixel de Tráfego Pago
      trackPlatformConversion("CompleteRegistration", {
        content_name: `Demo Criada - ${data.tenant.name}`,
        status: "preview",
      });
      trackPlatformConversion("Lead", {
        content_name: `Self-Service Demo - ${data.tenant.slug}`,
      });

      setCreatedResult({
        name: data.tenant.name,
        slug: data.tenant.slug,
        planTier: data.tenant.plan_tier,
        previewUrl: data.previewUrl,
        adminUrl: data.adminUrl,
        checkoutUrl: data.checkoutUrl,
      });
    } catch {
      setErrorMsg("Erro de conexão ao criar sua demonstração. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const waBuildTogetherUrl = buildSalesWhatsAppUrl(
    name.trim()
      ? `Olá! Quero criar o site da minha academia "${name.trim()}" junto com você no Nocaute Hub.`
      : "Olá! Vim do site do Nocaute Hub e quero criar o site da minha academia de luta junto com você."
  );

  if (createdResult) {
    const waAfterCreatedUrl = buildSalesWhatsAppUrl(
      `Olá! Acabei de gerar a demonstração da minha academia "${createdResult.name}" (${createdResult.slug}.nocautehub.com) e quero personalizar/ativar junto com você!`
    );

    return (
      <div className="min-h-screen bg-[#0C0C0C] text-neutral-100 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-xl w-full glass-card rounded-3xl p-7 sm:p-9 space-y-6 border border-emerald-500/30">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              Site Gerado em Modo Demonstração
            </span>
            <h1 className="font-display text-3xl sm:text-4xl uppercase text-white">
              {createdResult.name} está pronta!
            </h1>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Seu site com 11 seções de alta conversão já foi montado e seu
              subdomínio oficial{" "}
              <code className="text-emerald-300 font-semibold">
                {createdResult.slug}.nocautehub.com
              </code>{" "}
              está reservado.
            </p>
          </div>

          {/* Passo 1 Principal: Ver Demo ou Ativar 15 dias grátis */}
          <div className="space-y-3">
            <a
              href={createdResult.checkoutUrl}
              className="w-full py-4 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 transition shadow-xl shadow-rose-600/25"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                Liberar {createdResult.slug}.nocautehub.com ({trialDays} Dias
                Grátis • R$ 0 Hoje)
              </span>
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={createdResult.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white inline-flex items-center justify-center gap-2 transition"
              >
                <Eye className="w-4 h-4 text-sky-300" />
                <span>Ver Meu Site Pronto</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={createdResult.adminUrl}
                target="_blank"
                rel="noreferrer"
                className="py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white inline-flex items-center justify-center gap-2 transition"
              >
                <Users className="w-4 h-4 text-rose-400" />
                <span>Editar no Painel do Dono</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Opção de finalizar/personalizar junto pelo WhatsApp (21 96019-4354) */}
          <div className="pt-4 border-t border-white/10">
            <a
              href={waAfterCreatedUrl}
              target="_blank"
              rel="noreferrer"
              onClick={handleDirectWhatsAppClick}
              className="w-full py-3.5 px-4 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] border border-[#25D366]/40 text-[#25D366] hover:text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                Prefere que eu personalize fotos e horários com você? Chamar no
                WhatsApp
              </span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-neutral-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#101012]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-display font-bold text-white text-sm">
              NH
            </div>
            <span className="font-display text-lg uppercase tracking-wider text-white">
              Nocaute Hub
            </span>
          </Link>

          <a
            href={waBuildTogetherUrl}
            target="_blank"
            rel="noreferrer"
            onClick={handleDirectWhatsAppClick}
            className="px-3.5 py-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] border border-[#25D366]/40 text-[#25D366] hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Criar Junto pelo WhatsApp</span>
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Explicação + Opção Criar Junto no WhatsApp */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/15 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Pronto em 10 Segundos • {trialDays} Dias Grátis
            </span>
            <h1 className="font-display text-3xl sm:text-5xl uppercase text-white leading-[0.95]">
              Veja o site da sua academia pronto agora
            </h1>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Preencha os dados básicos ao lado para gerar seu site completo em{" "}
              <strong>Modo Demonstração</strong> ou chame diretamente no
              WhatsApp para montarmos tudo junto com você.
            </p>
          </div>

          {/* Card Destaque: Criar Junto pelo WhatsApp (21 96019-4354) */}
          <div className="glass-card rounded-3xl p-6 border border-[#25D366]/35 bg-[#25D366]/[0.04] space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#25D366]">
                  Atendimento Direto 1-a-1
                </span>
                <h2 className="font-display text-xl uppercase text-white">
                  Prefere criar junto comigo no WhatsApp?
                </h2>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Você me manda sua logo, fotos do tatame e grade de horários
                  pelo WhatsApp e eu mesmo deixo tudo configurado para você!
                </p>
              </div>
            </div>

            <a
              href={waBuildTogetherUrl}
              target="_blank"
              rel="noreferrer"
              onClick={handleDirectWhatsAppClick}
              className="w-full py-3.5 px-5 rounded-xl bg-[#25D366] hover:brightness-110 text-black font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 transition shadow-lg shadow-[#25D366]/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chamar no WhatsApp e Criar Junto</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Como funciona */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Como funciona o teste de {trialDays} dias grátis
            </h3>
            <ul className="space-y-3 text-xs text-neutral-200">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>1. Gere sua Demo Grátis:</strong> você vê o site
                  funcionando com o nome, cor e WhatsApp da sua academia na
                  hora.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>2. Personalize no Painel do Dono:</strong> altere
                  modalidades, horários, fotos e professores quando quiser.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>3. Ative os {trialDays} Dias Grátis:</strong> libere
                  seu endereço oficial{" "}
                  <code className="text-white">
                    suaacademia.nocautehub.com
                  </code>{" "}
                  com R$ 0,00 hoje.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Coluna Direita: Formulário Self-Service */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="glass-card rounded-3xl p-6 sm:p-8 space-y-5"
          >
            <div className="border-b border-white/10 pb-4">
              <h2 className="font-display text-2xl uppercase text-white">
                Gerar Meu Site Automaticamente
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Leva menos de 1 minuto. As 11 seções já nascem prontas para
                artes marciais.
              </p>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-xl px-4 py-3">
                {errorMsg}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Nome da Academia / CT *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Franco Team Muay Thai"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Subdomínio Desejado (opcional)
                </label>
                <div className="flex items-center rounded-xl bg-black/50 border border-white/15 overflow-hidden focus-within:border-rose-500">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) =>
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "")
                      )
                    }
                    placeholder="francoteam"
                    className="w-full px-3 py-2.5 bg-transparent text-sm text-white focus:outline-none"
                  />
                  <span className="px-2.5 text-[11px] text-neutral-400 shrink-0 border-l border-white/10">
                    .nocautehub.com
                  </span>
                </div>
              </div>
            </div>

            <WhatsAppInput
              label="WhatsApp da Academia (para receber agendamentos)"
              required
              value={whatsapp}
              onChange={setWhatsapp}
            />

            <CepAddressFields
              value={{
                address,
                neighborhood,
                city,
              }}
              onChange={(next) => {
                setAddress(next.address);
                setNeighborhood(next.neighborhood);
                setCity(next.city);
              }}
            />

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-2">
                Escolha o Plano ({trialDays} dias grátis em ambos)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlanTier("essencial")}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    planTier === "essencial"
                      ? "border-white bg-white/10 text-white"
                      : "border-white/10 bg-black/40 text-neutral-400 hover:border-white/25"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase">
                      Plano Essencial
                    </span>
                    <span className="font-display text-lg font-bold text-white">
                      {formatBrlFromCents(PLAN_PRICING.essencial.regularCents)}
                      /mês
                    </span>
                  </div>
                  <span className="block text-[11px] text-emerald-400 font-semibold mt-0.5">
                    {trialDays} dias grátis • Site + WhatsApp + Subdomínio
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanTier("pro")}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    planTier === "pro"
                      ? "border-rose-500 bg-rose-600/15 text-white"
                      : "border-white/10 bg-black/40 text-neutral-400 hover:border-white/25"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-rose-400">
                      Plano Pro (Recomendado)
                    </span>
                    <span className="font-display text-lg font-bold text-white">
                      {formatBrlFromCents(PLAN_PRICING.pro.regularCents)}/mês
                    </span>
                  </div>
                  <span className="block text-[11px] text-emerald-300 font-semibold mt-0.5">
                    {trialDays} dias grátis • Funil, CRM, Domínio, Stories
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-2">
                Cor Principal da Academia
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {BRAND_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setPrimaryColor(preset.hex)}
                    title={preset.name}
                    className={`w-8 h-8 rounded-full border-2 transition ${
                      primaryColor === preset.hex
                        ? "border-white scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: preset.hex }}
                  />
                ))}
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2.5">
              <p className="text-xs font-semibold text-neutral-200">
                Seu Login do Painel do Dono (para você editar seu site)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="seuemail@academia.com.br"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={clientPassword}
                  onChange={(e) => setClientPassword(e.target.value)}
                  placeholder="Crie uma senha (mín. 6 dígitos)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 transition shadow-xl shadow-rose-600/25 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Montando seu site de demonstração...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Gerar Meu Site de Demonstração Agora</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
