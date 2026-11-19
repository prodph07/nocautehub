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
  const [step, setStep] = useState<1 | 2>(1);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Por favor, digite seu nome para agilizarmos seu atendimento.");
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

    // Dispara eventos de conversão (Meta Pixel + GTM)
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
    const message = `Olá! Meu nome é ${name.trim()}. Vim pelo site da ${tenantName} e quero agendar minha aula experimental gratuita de *${selectedModality}* no turno da *${preferredShift}*.`;
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
        className="w-full sm:max-w-md bg-[#121214] border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 sm:p-7 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Indicador de etapas */}
        <div className="flex items-center gap-2 mb-5">
          <div
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ backgroundColor: "var(--primary)" }}
          />
          <div
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{
              backgroundColor:
                step === 2 ? "var(--primary)" : "rgba(255,255,255,0.12)",
            }}
          />
          <span className="text-xs font-medium text-neutral-400 ml-1">
            Passo {step} de 2
          </span>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-primary">
                Aula Experimental Gratuita
              </span>
              <h3 className="font-display text-2xl sm:text-3xl uppercase text-white mt-1">
                Qual modalidade você quer experimentar?
              </h3>
              <p className="text-sm text-neutral-400 mt-1">
                Escolha uma opção abaixo para verificarmos a disponibilidade no WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-[45vh] overflow-y-auto pr-1">
              {modalities.map((mod) => {
                const active = selectedModality === mod.name;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => handleSelectModality(mod.name)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition flex items-center justify-between group ${
                      active
                        ? "border-brand-primary bg-brand-primary/15 text-white"
                        : "border-white/10 bg-white/[0.03] hover:border-brand-primary/60 hover:bg-white/[0.06] text-neutral-200"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm sm:text-base">
                        {mod.name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {mod.target_audience}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-primary group-hover:translate-x-0.5 transition" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white mb-2 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Trocar modalidade ({selectedModality})
              </button>
              <h3 className="font-display text-2xl sm:text-3xl uppercase text-white">
                Qual o melhor turno para você?
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {SHIFTS.map((s) => {
                const Icon = s.icon;
                const active = preferredShift === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setPreferredShift(s.value)}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      active
                        ? "border-brand-primary bg-brand-primary/15 text-white"
                        : "border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/25"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        active ? "text-brand-primary" : "text-neutral-400"
                      }`}
                    />
                    <span className="text-sm font-semibold">{s.label}</span>
                    <span className="text-[11px] text-neutral-400">{s.hint}</span>
                  </button>
                );
              })}
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
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-primary text-sm"
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
              className="btn-shimmer w-full py-3.5 px-5 rounded-xl font-bold text-sm sm:text-base uppercase tracking-wide text-white bg-brand-primary hover:brightness-110 transition flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/25 disabled:opacity-60"
            >
              <MessageCircle className="w-5 h-5" />
              {submitting ? "Abrindo WhatsApp..." : "Confirmar no WhatsApp"}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>1ª aula gratuita • Emprestamos kimono/luvas sem custo</span>
            </div>
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
          <span>Resposta rápida direto com a recepção da academia</span>
        </div>
      </div>
    </div>
  );
}

