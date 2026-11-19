"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";

export default function MasterLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@nocautehub.com.br");
  const [password, setPassword] = useState("nocaute123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Falha ao autenticar");
        setLoading(false);
        return;
      }

      router.push("/master");
      router.refresh();
    } catch {
      setError("Erro de conexão ao autenticar");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0C0C0C] text-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para Nocaute Hub
        </Link>

        <div className="glass-panel rounded-2xl p-7 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-xl bg-rose-600/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="font-display text-3xl uppercase text-white">
              Acesso Master
            </h1>
            <p className="text-sm text-neutral-400">
              Painel operacional interno do Nocaute Hub para gerenciar academias, demos e leads.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                E-mail Administrativo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>{loading ? "Entrando..." : "Entrar no Painel Master"}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 text-[11px] text-neutral-500 leading-relaxed">
            <strong className="text-neutral-300">Modo Local (Dev):</strong>{" "}
            Credenciais padrão pré-preenchidas (<code className="text-neutral-300">admin@nocautehub.com.br</code> / <code className="text-neutral-300">nocaute123</code>). Quando conectar o Supabase, o login usará automaticamente o Supabase Auth.
          </div>
        </div>
      </div>
    </main>
  );
}

