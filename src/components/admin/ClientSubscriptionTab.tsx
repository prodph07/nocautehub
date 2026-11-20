"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Handshake,
  Loader2,
  Lock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Calendar,
  AlertCircle,
} from "lucide-react";
import type { TenantWithRelations } from "@/types/tenant";
import { formatBrlFromCents, PLAN_PRICING } from "@/lib/pagarme";
import { tokenizeCardInBrowser } from "@/lib/pagarme-client";
import { buildSalesWhatsAppUrl } from "@/lib/pixel-events";

interface SubscriptionSnapshot {
  id: string;
  status: string;
  nextBillingAt: string | null;
  createdAt: string | null;
  cardBrand: string | null;
  cardLastFour: string | null;
  holderName: string | null;
  priceCents: number | null;
}

interface ClientSubscriptionTabProps {
  tenant: TenantWithRelations;
  onTenantUpdated: (updated: TenantWithRelations) => void;
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

export function ClientSubscriptionTab({
  tenant,
  onTenantUpdated,
}: ClientSubscriptionTabProps) {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<SubscriptionSnapshot | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);

  // Form troca de cartão
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [savingCard, setSavingCard] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isPro = tenant.plan_tier === "pro";
  const isPartner =
    tenant.status === "active" && tenant.billing_mode === "partner";
  const isPreview = tenant.status === "preview";
  const hasPaidSubscription = Boolean(tenant.pagarme_subscription_id);
  const spec = PLAN_PRICING[tenant.plan_tier];

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/client-admin/${tenant.id}/subscription`
        );
        const data = await res.json();
        if (active && res.ok) {
          setSnapshot(data.subscription || null);
        }
      } catch {
        // fallback silencioso
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [tenant.id, tenant.pagarme_subscription_id]);

  const handleUpgradeToPro = async () => {
    // Se ainda não assinou e não é parceiro, leva direto para o checkout no plano Pro
    if (!hasPaidSubscription && !isPartner) {
      setUpgrading(true);
      try {
        const res = await fetch(
          `/api/client-admin/${tenant.id}/subscription`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "upgrade_pro" }),
          }
        );
        const data = await res.json();
        if (res.ok && data.tenant) {
          onTenantUpdated(data.tenant);
        }
        window.location.href = `/assinar/${tenant.slug}?trial=15`;
      } finally {
        setUpgrading(false);
      }
      return;
    }

    if (
      !confirm(
        "Confirmar upgrade imediato para o Plano Pro (R$ 97,00/mês) liberando Mini-Funil WhatsApp, CRM de Leads, Link na Bio, Stories e Domínio Próprio?"
      )
    ) {
      return;
    }

    setUpgrading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/client-admin/${tenant.id}/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upgrade_pro" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error || "Não foi possível realizar o upgrade.",
        });
        return;
      }
      if (data.tenant) onTenantUpdated(data.tenant);
      if (data.subscription) setSnapshot(data.subscription);
      setFeedback({
        type: "success",
        text: "Parabéns! Sua academia agora está no Plano Pro Completo com todos os recursos liberados!",
      });
    } catch {
      setFeedback({
        type: "error",
        text: "Erro de conexão ao processar upgrade.",
      });
    } finally {
      setUpgrading(false);
    }
  };

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const [expMonthStr, expYearStr] = expiry.split("/");
    const expMonth = Number(expMonthStr);
    const expYear = Number(expYearStr);
    if (!expMonth || expMonth < 1 || expMonth > 12 || !expYear) {
      setFeedback({
        type: "error",
        text: "Informe a validade do cartão no formato MM/AA.",
      });
      return;
    }

    setSavingCard(true);
    try {
      const cardToken = await tokenizeCardInBrowser({
        number: cardNumber,
        holderName,
        expMonth,
        expYear,
        cvv,
      });

      const res = await fetch(`/api/client-admin/${tenant.id}/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_card",
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
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error || "Não foi possível atualizar o cartão.",
        });
        return;
      }
      if (data.subscription) setSnapshot(data.subscription);
      setCardModalOpen(false);
      setCardNumber("");
      setHolderName("");
      setExpiry("");
      setCvv("");
      setFeedback({
        type: "success",
        text: "Cartão de crédito atualizado com sucesso!",
      });
    } catch {
      setFeedback({
        type: "error",
        text: "Erro de conexão ao atualizar cartão.",
      });
    } finally {
      setSavingCard(false);
    }
  };

  const nextBillingFormatted = snapshot?.nextBillingAt
    ? new Date(snapshot.nextBillingAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl uppercase text-white">
          Minha Assinatura &amp; Plano
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Gerencie seu plano, forma de pagamento e recursos liberados na sua
          academia.
        </p>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl p-4 border flex items-start gap-3 text-xs sm:text-sm ${
            feedback.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-200"
              : "bg-rose-500/15 border-rose-500/30 text-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Card Principal do Plano Atual */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-2xl sm:text-3xl uppercase text-white">
                {isPro ? "Plano Pro Completo" : "Plano Essencial"}
              </span>
              {isPreview ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Modo Demonstração (Aguardando Ativação)
                </span>
              ) : isPartner ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-violet-500/15 text-violet-300 border border-violet-500/30 inline-flex items-center gap-1">
                  <Handshake className="w-3 h-3" />
                  Parceiro Oficial • Ativo
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Assinatura Ativa
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400">
              Subdomínio oficial:{" "}
              <code className="text-neutral-200">
                {tenant.slug}.nocautehub.com
              </code>
              {tenant.custom_domain && (
                <>
                  {" "}
                  • Domínio próprio:{" "}
                  <code className="text-emerald-300">
                    {tenant.custom_domain}
                  </code>
                </>
              )}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="font-display text-3xl font-bold text-white">
              {isPartner
                ? "Isento"
                : formatBrlFromCents(spec.regularCents)}
            </span>
            <span className="block text-xs text-neutral-400">
              {isPartner ? "Parceria Oficial Nocaute Hub" : "por mês"}
            </span>
          </div>
        </div>

        {/* Estado 1: Academia em Preview ou sem assinatura ativa (e não é parceira) */}
        {(isPreview || (!hasPaidSubscription && !isPartner)) && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-200">
                Ative seus 15 Dias Grátis para liberar o endereço oficial
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Seu site está pronto! Cadastre seu cartão de crédito com{" "}
                <strong>R$ 0,00 hoje</strong> para colocar{" "}
                <code className="text-white">
                  {tenant.slug}.nocautehub.com
                </code>{" "}
                no ar imediatamente.
              </p>
            </div>
            <a
              href={`/assinar/${tenant.slug}?trial=15`}
              className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition shrink-0 shadow-lg shadow-rose-600/20"
            >
              <CreditCard className="w-4 h-4" />
              <span>Ativar 15 Dias Grátis</span>
            </a>
          </div>
        )}

        {/* Estado 2: Dados do Cartão e Próxima Cobrança (Pagar.me) */}
        {loading ? (
          <div className="py-6 flex items-center gap-2 text-xs text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Carregando informações da assinatura...</span>
          </div>
        ) : (
          hasPaidSubscription && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-black/40 border border-white/10 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Cartão Cadastrado</span>
                  <CreditCard className="w-4 h-4 text-brand-primary" />
                </div>
                {snapshot?.cardLastFour ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white uppercase">
                        {snapshot.cardBrand || "Cartão"} ••••{" "}
                        {snapshot.cardLastFour}
                      </p>
                      {snapshot.holderName && (
                        <p className="text-[11px] text-neutral-400">
                          {snapshot.holderName}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCardModalOpen((prev) => !prev)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
                    >
                      {cardModalOpen ? "Cancelar" : "Trocar Cartão"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-300">
                      Cartão de crédito ativo na Pagar.me
                    </span>
                    <button
                      type="button"
                      onClick={() => setCardModalOpen((prev) => !prev)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
                    >
                      {cardModalOpen ? "Cancelar" : "Atualizar Cartão"}
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-black/40 border border-white/10 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Próxima Renovação</span>
                  <Calendar className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-white">
                  {nextBillingFormatted || "Renovação mensal automática"}
                </p>
                <p className="text-[11px] text-neutral-400">
                  Código:{" "}
                  <code className="text-neutral-300">
                    {tenant.pagarme_subscription_id}
                  </code>
                </p>
              </div>
            </div>
          )
        )}

        {/* Formulário de Troca de Cartão (Tokenizado com Chave Pública pk_...) */}
        {cardModalOpen && (
          <form
            onSubmit={handleUpdateCard}
            className="rounded-2xl bg-black/60 border border-white/15 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-primary" />
                <span>Atualizar Cartão de Crédito</span>
              </h3>
              <span className="text-[11px] text-emerald-400 inline-flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Tokenizado via Pagar.me
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-xs text-neutral-300 mb-1">
                  Número do Novo Cartão *
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white font-mono"
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
                  onChange={(e) => setHolderName(e.target.value.toUpperCase())}
                  placeholder="COMO ESTÁ NO CARTÃO"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white uppercase"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white font-mono"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCardModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={savingCard}
                className="px-5 py-2 rounded-xl bg-brand-primary hover:brightness-110 text-xs font-bold text-white inline-flex items-center gap-2 disabled:opacity-60"
              >
                {savingCard && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{savingCard ? "Salvando..." : "Salvar Novo Cartão"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Card de Upgrade 1-Clique (Se estiver no Plano Essencial) */}
      {!isPro && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-brand-primary/40 bg-brand-primary/[0.04] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-primary">
                <Sparkles className="w-4 h-4" />
                Upgrade Disponível
              </span>
              <h3 className="font-display text-2xl sm:text-3xl uppercase text-white">
                Desbloqueie o Plano Pro Completo
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300">
                Transforme seu site em uma máquina completa de captação e
                gestão de alunos por{" "}
                <strong>{formatBrlFromCents(PLAN_PRICING.pro.regularCents)}/mês</strong>.
              </p>
            </div>

            <button
              type="button"
              disabled={upgrading}
              onClick={handleUpgradeToPro}
              className="px-6 py-3.5 rounded-2xl bg-brand-primary hover:brightness-110 text-white text-xs sm:text-sm font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition shrink-0 shadow-lg"
            >
              {upgrading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>
                {upgrading ? "Ativando Pro..." : "Fazer Upgrade para o Pro"}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs text-neutral-200">
            {[
              "Mini-Funil de WhatsApp Zero Digitação (Modalidade + Turno)",
              "Mini-CRM de Pessoas Interessadas (Novo → Veio treinar → Matriculou)",
              "Conexão de Domínio Próprio (.com.br) com SSL Cloudflare",
              "Página Link na Bio oficial para o Instagram da academia",
              "Gerador de Grade de Horários em Imagem 9:16 para Stories",
              "Instalação de Meta Pixel e Google Tag Manager para anúncios",
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suporte Direto via WhatsApp */}
      <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Precisa de ajuda com sua assinatura ou domínio?
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Fale diretamente com nossa equipe pelo WhatsApp para ajustes,
              cancelamento ou dúvidas financeiras.
            </p>
          </div>
        </div>

        <a
          href={buildSalesWhatsAppUrl(
            `Olá! Sou dono da academia "${tenant.name}" (${tenant.slug}.nocautehub.com) e preciso de ajuda com minha assinatura no Nocaute Hub.`
          )}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] border border-[#25D366]/40 text-[#25D366] hover:text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Falar com Suporte no WhatsApp</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
