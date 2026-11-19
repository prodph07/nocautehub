"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

interface FloatingWhatsAppProps {
  onOpenFunnel: () => void;
}

export function FloatingWhatsApp({ onOpenFunnel }: FloatingWhatsAppProps) {
  const [showBubble, setShowBubble] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
      {showBubble && !dismissed && (
        <div className="glass-panel rounded-2xl rounded-br-sm px-4 py-2.5 shadow-2xl max-w-[230px] flex items-start gap-2 animate-fade-in">
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
        className="relative group w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-soft pointer-events-none" />
        <MessageCircle className="w-7 h-7 relative z-10 fill-current" />
      </button>
    </div>
  );
}

