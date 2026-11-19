"use client";

import { useEffect, useState } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  CheckCircle2,
  Sun,
  Sunset,
  Moon,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import type { LeadShift, Modality } from "@/types/tenant";
import { WhatsAppInput } from "@/components/shared/WhatsAppInput";

interface WhatsAppFunnelModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  tenantName: string;
  whatsappNumber: string;
  modalities: Modality[];
  initialModality?: string;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const SHIFTS: Array<{
  value: LeadShift;
  label: string;
  hint: string;
  icon: typeof Sun;
}> = [
  { value: "Manhã", label: "Manhã", hint: "06h às 12h", icon: Sun },
  { value: "Tarde", label: "Tarde", hint: "12h às 18h", icon: Sunset },
  { value: "Noite", label: "Noite", hint: "18h às 22h", icon: Moon },
];

export function WhatsAppFunnelModal({
  open,
  onClose,
  tenantId,
  tenantName,
  whatsappNumber,
  modalities,
  initialModality,
}: WhatsAppFunnelModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedModality, setSelectedModality] = useState<string>("");
  const [preferredShift, setPreferredShift] = useState<LeadShift>("Noite");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
      setSubmitting(false);
      if (initialModality) {
        setSelectedModality(initialModality);
        setStep(2);
      } else {
        setSelectedModality(modalities[0]?.name || "Aula Experimental");
        setStep(1);
      }
    }
  }, [open, initialModality, modalities]);

  if (!open) return null;

  const handleSelectModality = (modName: string) => {
    setSelectedModality(modName);
    setStep(2);
  };

  const handleSelectShift = (shift: LeadShift) => {
    setPreferredShift(shift);
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Por favor, diga como podemos te chamar.");
      return;
    }

    setSubmitting(true);
    setError("");

    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get("utm_source");
    const utm_medium = params.get("utm_medium");
    const utm_campaign = params.get("utm_campaign");

    try {
      await Promise.all([
        fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenant_id: tenantId,
            name: name.trim(),
            phone: phone.trim(),
            chosen_modality: selectedModality,
            preferred_shift: preferredShift,
            utm_source,
            utm_medium,
            utm_campaign,
          }),
        }),
        fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenant_id: tenantId,
            event_type: "whatsapp_click",
            source: "mini-funnel",
          }),
        }),
      ]);
    } catch {
      // Não bloqueia o redirecionamento ao WhatsApp em caso de falha de rede
    }

    try {
      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead", {
          content_name: selectedModality,
          content_category: preferredShift,
        });
      }
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: "generate_lead",
          modality: selectedModality,
          shift: preferredShift,
        });
      }
    } catch {
      // ignore
    }

    const cleanPhone = whatsappNumber.replace(/\D/g, "");
    const modalityText =
      selectedModality === "Ainda não sei / Quero conhecer"
        ? "uma aula experimental gratuita (ainda estou em dúvida na modalidade)"
        : `minha aula experimental gratuita de *${selectedModality}*`;
    const message = `Olá! Meu nome é ${name.trim()}. Vim pelo site da ${tenantName} e quero agendar ${modalityText} no turno da *${preferredShift}*.`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank", "noopener,noreferrer");
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Agendar Aula Experimental Gratuita"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-[#141417] border border-white/10 border-t-white/20 rounded-t-3xl sm:rounded-2xl p-6 sm:p-7 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 active:scale-[0.95] flex items-center justify-center text-neutral-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Barra de progresso 3 passos */}
        <div className="flex items-center gap-2 mb-5 pr-10">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-1.5 flex-1 rounded-full transition-colors duration-300"
              style={{
                backgroundColor:
                  step >= n ? "var(--primary)" : "rgba(255,255,255,0.12)",
              }}
            />
          ))}
          <span className="text-xs font-medium text-neutral-400 ml-1 shrink-0">
            Passo {step} de 3
          </span>
        </div>

        {/* PASSO 1: MODALIDADE (AVANÇO AUTOMÁTICO) */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-primary">
                Leva 10 segundos para reservar sua vaga
              </span>
              <h3 className="font-display text-2xl sm:text-3xl uppercase text-white mt-1 leading-tight">
                Qual modalidade você quer conhecer?
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-[48vh] overflow-y-auto pr-1">
              {modalities.map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleSelectModality(mod.name)}
                  className="min-h-[56px] w-full text-left px-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] hover:border-brand-primary hover:bg-brand-primary/10 active:scale-[0.98] text-white transition flex items-center justify-between group"
                >
                  <div>
                    <p className="font-semibold text-base">{mod.name}</p>
                    <p className="text-xs text-neutral-400">
                      {mod.target_audience}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-brand-primary group-hover:translate-x-0.5 transition shrink-0" />
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  handleSelectModality("Ainda não sei / Quero conhecer")
                }
                className="min-h-[52px] w-full text-left px-4 py-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] hover:border-brand-primary/60 active:scale-[0.98] text-neutral-200 transition flex items-center justify-between group"
              >
                <span className="flex items-center gap-2.5 text-sm font-medium">
                  <HelpCircle className="w-4 h-4 text-brand-primary shrink-0" />
                  Ainda não sei — quero ajuda para escolher
                </span>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-brand-primary transition shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* PASSO 2: TURNO (AVANÇO AUTOMÁTICO) */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white mb-2 transition min-h-[32px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Trocar treino (
                {selectedModality})
              </button>
              <h3 className="font-display text-2xl sm:text-3xl uppercase text-white leading-tight">
                Qual melhor turno para você?
              </h3>
              <p className="text-sm text-neutral-400 mt-1">
                Toque em uma opção para continuar.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {SHIFTS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => handleSelectShift(s.value)}
                    className="min-h-[60px] px-5 py-4 rounded-xl border border-white/10 bg-white/[0.04] hover:border-brand-primary hover:bg-brand-primary/10 active:scale-[0.98] text-white transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-base">{s.label}</p>
                        <p className="text-xs text-neutral-400">{s.hint}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-brand-primary transition" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PASSO 3: NOME + SAÍDA VERDE PARA O WHATSAPP */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white mb-2 transition min-h-[32px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {selectedModality} •{" "}
                {preferredShift}
              </button>
              <h3 className="font-display text-2xl sm:text-3xl uppercase text-white leading-tight">
                Como podemos te chamar?
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Seu Nome *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-primary text-base sm:text-sm"
                />
              </div>

              <WhatsAppInput
                label="Seu WhatsApp (opcional)"
                includeCountryPrefix={false}
                value={phone}
                onChange={setPhone}
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-shimmer w-full min-h-[52px] py-3.5 px-5 rounded-xl font-bold text-sm sm:text-base uppercase tracking-wide text-white bg-[#25D366] hover:brightness-110 active:scale-[0.97] transition flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25 disabled:opacity-60"
            >
              <MessageCircle className="w-5 h-5" />
              {submitting
                ? "Abrindo WhatsApp..."
                : "Ir para o WhatsApp da Academia"}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>1ª aula gratuita • Sem compromisso</span>
            </div>
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
          <span>Atendimento rápido direto com a recepção</span>
        </div>
      </div>
    </div>
  );
}
