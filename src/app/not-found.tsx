import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0C0C0C] text-neutral-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel rounded-2xl p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-rose-600/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="font-display text-3xl uppercase text-white">
          Página não encontrada
        </h1>
        <p className="text-sm text-neutral-400">
          O endereço ou academia que você tentou acessar não existe ou foi removido.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Nocaute Hub
        </Link>
      </div>
    </main>
  );
}

