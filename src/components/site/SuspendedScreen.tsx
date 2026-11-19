import { Wrench } from "lucide-react";

interface SuspendedScreenProps {
  academyName: string;
}

export function SuspendedScreen({ academyName }: SuspendedScreenProps) {
  return (
    <main className="min-h-screen bg-[#0C0C0C] text-neutral-200 flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-400">
          <Wrench className="w-6 h-6" />
        </div>
        <h1 className="font-display text-2xl uppercase tracking-wide text-white">
          Site em Manutenção
        </h1>
        <p className="text-sm text-neutral-400 leading-relaxed">
          O site de <strong className="text-neutral-200">{academyName}</strong>{" "}
          está temporariamente indisponível para atualização. Voltaremos em breve.
        </p>
      </div>
    </main>
  );
}

