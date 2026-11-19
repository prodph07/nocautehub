"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import { hexToRgbTriplet } from "@/lib/colors";

interface ClientAdminLoginProps {
  tenantId: string;
  tenantName: string;
  slug: string;
  primaryColor: string;
  defaultHintEmail: string;
  localMode: boolean;
}

export function ClientAdminLogin({
  tenantId,
  tenantName,
  slug,
  primaryColor,
  defaultHintEmail,
  localMode,
}: ClientAdminLoginProps) {
  const router = useRouter();
  const [email, setEmail] = useState(localMode ? defaultHintEmail : "");
  const [password, setPassword] = useState(localMode ? "academia123" : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cssVars = {
    "--primary": primaryColor,
    "--primary-rgb": hexToRgbTriplet(primaryColor),
  } as React.CSSProperties;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/client-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Credenciais inválidas");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Erro de conexão ao autenticar");
      setLoading(false);
    }
  };

  return (
    <main
      style={cssVars}
      className="min-h-screen bg-[#0C0C0C] text-neutral-100 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md space-y-5">
        <Link
          href={`/sites/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao site da academia
        </Link>

        <div className="glass-panel rounded-2xl p-7 space-y-6">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-xl bg-brand-primary flex items-center justify-center font-display font-bold text-lg text-white">
              {tenantName.slice(0, 2).toUpperCase()}
            </div>
            <h1 className="font-display text-3xl uppercase text-white">
              Painel da Academia
            </h1>
            <p className="text-sm text-neutral-400">
              Acesse o painel exclusivo de <strong className="text-white">{tenantName}</strong> para acompanhar leads, visitas e horários.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                E-mail da Academia
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-brand-primary"
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
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-brand-primary"
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
              className="w-full py-3.5 rounded-xl bg-brand-primary hover:brightness-110 text-white font-bold text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>{loading ? "Entrando..." : "Entrar no Painel"}</span>
            </button>
          </form>

          {localMode && (
            <div className="pt-4 border-t border-white/10 text-[11px] text-neutral-500">
              <strong className="text-neutral-300">Acesso Demo Local:</strong>{" "}
              <code className="text-neutral-300">{defaultHintEmail}</code> /{" "}
              <code className="text-neutral-300">academia123</code>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

