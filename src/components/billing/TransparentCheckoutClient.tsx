"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  Calendar,
  ExternalLink,
  Loader2,
  AlertCircle,
  Eye,
  MessageCircle,
} from "lucide-react";
import type { PlanTier } from "@/types/tenant";
import { formatBrlFromCents, PLAN_PRICING } from "@/lib/pagarme";
import { tokenizeCardInBrowser } from "@/lib/pagarme-client";
import {
  buildSalesWhatsAppUrl,
  trackPlatformConversion,
} from "@/lib/pixel-events";
import { getTenantUrl, getTenantPreviewUrl } from "@/lib/urls";

interface TransparentCheckoutClientProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
    custom_domain?: string | null;
    plan_tier: PlanTier;
    status: string;
    primaryColor: string;
  };
  trialDays: number;
}

function formatCpfCnpj(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatPhone(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCep(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatCardNumber(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExpiry(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function TransparentCheckoutClient({
  tenant,
  trialDays,
}: TransparentCheckoutClientProps) {
  const spec = PLAN_PRICING[tenant.plan_tier];
  const isPro = tenant.plan_tier === "pro";

  const firstChargeDate = new Date(
    Date.now() + trialDays * 24 * 60 * 60 * 1000
  );
  const firstChargeFormatted = firstChargeDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Dados do responsável
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");

  // Endereço de cobrança
  const [zipCode, setZipCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("SP");
  const [loadingCep, setLoadingCep] = useState(false);

  // Cartão de crédito
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<{
    subscriptionId: string;
    firstChargeDateIso: string;
  } | null>(null);

  const handleCepChange = async (raw: string) => {
    const formatted = formatCep(raw);
    setZipCode(formatted);
    const digits = formatted.replace(/\D/g, "");
    if (digits.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (!data.erro) {
          if (data.logradouro) setStreet(data.logradouro);
          if (data.bairro) setNeighborhood(data.bairro);
          if (data.localidade) setCity(data.localidade);
          if (data.uf) setState(data.uf);
        }
      } catch {
        // preenchimento manual continua liberado
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const [expMonthStr, expYearStr] = expiry.split("/");
    const expMonth = Number(expMonthStr);
    const expYear = Number(expYearStr);

    if (!expMonth || expMonth < 1 || expMonth > 12 || !expYear) {
      setErrorMsg("Informe a validade do cartão no formato MM/AA.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Tokeniza o cartão direto no navegador com a chave pública da Pagar.me (pk_...)
      const cardToken = await tokenizeCardInBrowser({
        number: cardNumber,
        holderName,
        expMonth,
        expYear,
        cvv,
      });

      const res = await fetch("/api/billing/pagarme/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: tenant.slug,
          trialDays,
          customer: {
            name,
            email,
            document,
            phone,
          },
          billingAddress: {
            zipCode,
            street,
            number,
            neighborhood,
            city,
            state,
          },
          cardToken,
          card: {
            number: cardNumber,
            holderName,
            expMonth,
            expYear,
            cvv,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(
          data.error ||
            "Não foi possível ativar a assinatura. Verifique os dados do cartão."
        );
        return;
      }

      // 2. Dispara eventos de conversão no Pixel de Tráfego Pago (Meta Pixel + Google)
      const valueBrl = Number((spec.regularCents / 100).toFixed(2));
      if (trialDays > 0) {
        trackPlatformConversion("StartTrial", {
          value: valueBrl,
          currency: "BRL",
          content_name: `${tenant.plan_tier} - ${tenant.name}`,
          predicted_ltv: valueBrl,
        });
      }
      trackPlatformConversion("Subscribe", {
        value: valueBrl,
        currency: "BRL",
        content_name: `${tenant.plan_tier} - ${tenant.name}`,
      });

      setSuccessData({
        subscriptionId: data.subscriptionId,
        firstChargeDateIso: data.firstChargeDateIso,
      });
    } catch {
      setErrorMsg("Erro de conexão ao processar pagamento. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const features = isPro
    ? [
        "Site completo de alta conversão (11 seções Dark Mode)",
        "Mini-Funil de WhatsApp Zero Digitação + CRM de Leads",
        "Subdomínio oficial + suporte a Domínio Próprio (.com.br)",
        "Link na Bio oficial + Gerador de Grade para Stories (9:16)",
        "Painel do Dono completo + Pixel Meta & Google Tag Manager",
      ]
    : [
        "Site completo de alta conversão (11 seções Dark Mode)",
        "Botão direto de agendamento para o WhatsApp da academia",
        "Subdomínio oficial gratuito (" + tenant.slug + ".nocautehub.com)",
        "Grade de horários interativa + Painel do Dono para edição",
      ];

  if (successData) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] text-neutral-100 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-lg w-full glass-card rounded-3xl p-8 text-center space-y-6 border border-emerald-500/30">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              Assinatura Ativa
            </span>
            <h1 className="font-display text-3xl uppercase text-white">
              {tenant.name} está no ar!
            </h1>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {trialDays > 0 ? (
                <>
                  Seus <strong>{trialDays} dias grátis</strong> começaram agora.
                  Nenhuma cobrança foi feita hoje e a primeira mensalidade de{" "}
                  <strong>{formatBrlFromCents(spec.regularCents)}</strong> só
                  ocorrerá em <strong>{firstChargeFormatted}</strong>.
                </>
              ) : (
                <>
                  Sua assinatura mensal de{" "}
                  <strong>{formatBrlFromCents(spec.regularCents)}</strong> foi
                  confirmada com sucesso.
                </>
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-black/50 border border-white/10 p-4 text-left text-xs space-y-1.5 text-neutral-300">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Endereço Oficial:</span>
              <code className="text-emerald-300 font-semibold">
                {tenant.slug}.nocautehub.com
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Plano:</span>
              <span className="font-semibold text-white">
                {isPro ? "Plano Pro" : "Plano Essencial"} (
                {formatBrlFromCents(spec.regularCents)}/mês)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Código da Assinatura:</span>
              <code className="text-neutral-400">
                {successData.subscriptionId}
              </code>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={getTenantUrl(tenant, "")}
              className="flex-1 py-3.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 transition"
            >
              <span>Abrir Site Oficial</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={getTenantUrl(tenant, "/admin")}
              className="flex-1 py-3.5 px-5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 transition"
            >
              <span>Painel do Dono</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-neutral-100 flex flex-col">
      {/* Header Seguro */}
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
          <div className="flex items-center gap-3">
            <a
              href={buildSalesWhatsAppUrl(
                `Olá! Estou na tela de assinatura da academia "${tenant.name}" (${tenant.slug}.nocautehub.com) e gostaria de tirar uma dúvida.`
              )}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackPlatformConversion("Lead", {
                  content_name: `Suporte Checkout - ${tenant.slug}`,
                })
              }
              className="px-3 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/35 text-xs font-semibold text-[#25D366] inline-flex items-center gap-1.5 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dúvidas? Chamar no WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ambiente Seguro SSL • Pagar.me</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Resumo Transparente e Linha do Tempo das Cobranças */}
        <div className="lg:col-span-5 space-y-6">
          {/* Identidade da Academia */}
          <div className="glass-card rounded-3xl p-6 space-y-5">
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold text-white text-lg shrink-0 border border-white/15"
                style={{ backgroundColor: tenant.primaryColor }}
              >
                {tenant.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-widest text-rose-400">
                  Ativação Oficial do Site
                </span>
                <h1 className="font-display text-2xl uppercase text-white truncate">
                  {tenant.name}
                </h1>
                <p className="text-xs text-neutral-400 truncate">
                  Domínio:{" "}
                  <code className="text-neutral-200">
                    {tenant.slug}.nocautehub.com
                  </code>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-rose-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isPro ? "Plano Pro Completo" : "Plano Essencial"}
                </span>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Assinatura mensal sem fidelidade
                </p>
              </div>
              <div className="text-right">
                <span className="font-display text-2xl font-bold text-white">
                  {formatBrlFromCents(spec.regularCents)}
                </span>
                <span className="text-xs text-neutral-400 block">por mês</span>
              </div>
            </div>

            <a
              href={getTenantPreviewUrl(tenant, "")}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 inline-flex items-center justify-center gap-2 transition"
            >
              <Eye className="w-3.5 h-3.5 text-sky-300" />
              <span>Visualizar Demonstração do Site</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
          </div>

          {/* Linha do Tempo das Cobranças (100% Clara) */}
          <div className="glass-card rounded-3xl p-6 space-y-4 border border-emerald-500/25 bg-emerald-500/[0.03]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl uppercase text-white">
                Entenda as Cobranças
              </h2>
              {trialDays > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                  {trialDays} Dias Grátis
                </span>
              )}
            </div>

            {trialDays > 0 ? (
              <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-500/30">
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-bold text-emerald-400">
                      Hoje • Ativação Imediata
                    </span>
                    <span className="font-display text-xl font-bold text-emerald-400">
                      R$ 0,00
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                    Você tem <strong>{trialDays} dias gratuitos</strong> para
                    usar. Seu site{" "}
                    <code className="text-white">
                      {tenant.slug}.nocautehub.com
                    </code>{" "}
                    é liberado imediatamente e nenhuma cobrança é feita hoje.
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#18181c] border-2 border-emerald-500/50 text-emerald-300 flex items-center justify-center">
                    <Calendar className="w-3 h-3" />
                  </span>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-bold text-white">
                      Em {firstChargeFormatted} (após {trialDays} dias)
                    </span>
                    <span className="font-display text-lg font-bold text-white">
                      {formatBrlFromCents(spec.regularCents)}/mês
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    1ª cobrança da assinatura mensal no cartão cadastrado, e
                    depois a cada 30 dias. Cancele antes se não quiser
                    continuar, sem custo.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-neutral-300">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">
                    Hoje (Ativação imediata):
                  </span>
                  <span className="font-display text-lg font-bold text-emerald-400">
                    {formatBrlFromCents(spec.regularCents)}
                  </span>
                </div>
                <p className="text-neutral-400">
                  Renovação mensal automática a cada 30 dias. Sem fidelidade.
                </p>
              </div>
            )}
          </div>

          {/* Benefícios Inclusos */}
          <div className="glass-card rounded-3xl p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              O que está incluso no seu plano
            </h3>
            <ul className="space-y-2.5">
              {features.map((feat) => (
                <li
                  key={feat}
                  className="flex items-start gap-2.5 text-xs text-neutral-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Coluna Direita: Formulário de Cartão Transparente */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="glass-card rounded-3xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display text-2xl uppercase text-white">
                  Dados para Ativação
                </h2>
                <p className="text-xs text-neutral-400">
                  {trialDays > 0
                    ? `Cadastre o cartão para iniciar seus ${trialDays} dias grátis (R$ 0,00 hoje)`
                    : "Preencha os dados abaixo para ativar sua assinatura mensal"}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-neutral-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                <CreditCard className="w-4 h-4 text-rose-400" />
                <span>Cartão de Crédito Recorrente</span>
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-2xl bg-rose-500/15 border border-rose-500/30 p-4 flex items-start gap-3 text-xs sm:text-sm text-rose-200">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Dados do Responsável */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                1. Responsável pela Academia
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-neutral-300 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Silva"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@academia.com.br"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">
                    CPF ou CNPJ *
                  </label>
                  <input
                    type="text"
                    required
                    value={document}
                    onChange={(e) => setDocument(formatCpfCnpj(e.target.value))}
                    placeholder="000.000.000-00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-neutral-300 mb-1">
                    Celular / WhatsApp com DDD *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Endereço da Fatura */}
            <div className="space-y-4 pt-2 border-t border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                2. Endereço de Cobrança do Cartão
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-neutral-300 mb-1">
                    CEP * {loadingCep && "(Buscando...)"}
                  </label>
                  <input
                    type="text"
                    required
                    value={zipCode}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs text-neutral-300 mb-1">
                    Rua / Avenida *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Av. Paulista"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs text-neutral-300 mb-1">
                    Número *
                  </label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="1000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-neutral-300 mb-1">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    required
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Centro"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs text-neutral-300 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="São Paulo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs text-neutral-300 mb-1">
                    UF *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="SP"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white uppercase focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Dados do Cartão */}
            <div className="space-y-4 pt-2 border-t border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                3. Cartão de Crédito
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3.5">
                <div className="sm:col-span-6">
                  <label className="block text-xs text-neutral-300 mb-1">
                    Número do Cartão *
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white font-mono tracking-wider focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs text-neutral-300 mb-1">
                    Nome Impresso no Cartão *
                  </label>
                  <input
                    type="text"
                    required
                    value={holderName}
                    onChange={(e) =>
                      setHolderName(e.target.value.toUpperCase())
                    }
                    placeholder="COMO ESTÁ NO CARTÃO"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white uppercase focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-neutral-300 mb-1">
                    Validade (MM/AA) *
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="12/29"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs text-neutral-300 mb-1">
                    CVV *
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="123"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Resumo Final + Botão Submit */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-emerald-200">
                  {trialDays > 0
                    ? `Valor cobrado hoje (${trialDays} dias grátis):`
                    : "Valor cobrado hoje:"}
                </span>
                <span className="font-display text-xl font-bold text-emerald-400">
                  {trialDays > 0
                    ? "R$ 0,00"
                    : formatBrlFromCents(spec.regularCents)}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-[0.99] text-white font-bold text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2.5 transition shadow-xl shadow-rose-600/25 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Ativando Assinatura e Liberando Site...</span>
                  </>
                ) : trialDays > 0 ? (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>
                      Iniciar {trialDays} Dias Grátis e Liberar Site (R$ 0,00
                      Hoje)
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>
                      Ativar Assinatura Agora (
                      {formatBrlFromCents(spec.regularCents)}/mês)
                    </span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-neutral-400 text-center flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  Processamento criptografado via Pagar.me Instituição de
                  Pagamento S.A.
                </span>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

