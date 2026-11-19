"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

interface FloatingWhatsAppProps {
  onOpenFunnel: () => void;
  ctaLabel?: string;
}

export function FloatingWhatsApp({
  onOpenFunnel,
  ctaLabel = "Agendar Aula Experimental Grátis",
}: FloatingWhatsAppProps) {
  const [showBubble, setShowBubble] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(true);
    }, 10000);

    const onScroll = () => {
      setPastHero(window.scrollY > 420);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      {/* MOBILE: Barra Inferior Fixa na Zona do Polegar (aparece após rolar o Hero) */}
      <div
        className={`sm:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-[#0C0C0C]/90 backdrop-blur-md border-t border-white/10 transition-transform duration-300 ${
          pastHero ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={onOpenFunnel}
          className="btn-shimmer w-full min-h-[48px] px-5 py-3 rounded-xl bg-brand-primary text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-brand-primary/30 active:scale-[0.97] transition flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5 shrink-0" />
          <span>{ctaLabel}</span>
        </button>
      </div>

      {/* DESKTOP: Botão Flutuante Inteligente com balão contextual */}
      <div className="hidden sm:flex fixed bottom-5 right-5 z-40 flex-col items-end gap-2.5">
        {showBubble && !dismissed && (
          <div className="glass-panel rounded-2xl rounded-br-sm px-4 py-2.5 shadow-2xl max-w-[240px] flex items-start gap-2">
            <button
              type="button"
              onClick={onOpenFunnel}
              className="text-left text-xs text-neutral-100 leading-snug hover:text-white"
            >
              <span className="font-semibold block text-emerald-400 mb-0.5">
                Dúvidas sobre horários?
              </span>
              Chame aqui e agende sua 1ª aula gratuita.
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Fechar aviso"
              className="text-neutral-500 hover:text-white transition p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenFunnel}
          aria-label="Agendar aula pelo WhatsApp"
          className="relative group w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 flex items-center justify-center hover:scale-105 active:scale-[0.95] transition-transform"
        >
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-soft pointer-events-none" />
          <MessageCircle className="w-7 h-7 relative z-10 fill-current" />
        </button>
      </div>
    </>
  );
}
