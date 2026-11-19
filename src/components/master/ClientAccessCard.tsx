"use client";

import { useState } from "react";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";

interface ClientAccessCardProps {
  tenantId: string;
  slug: string;
}

export function ClientAccessCard({ tenantId, slug }: ClientAccessCardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleCreateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch(`/api/tenants/${tenantId}/client-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar acesso do cliente.");
        return;
      }
      setSuccess(
        data.message ||
          `Acesso criado! O cliente pode entrar em /sites/${slug}/admin.`
      );
      setPassword("");
    } catch {
      setError("Erro de conexão ao criar acesso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 space-y-3.5">
      <div className="flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-rose-400" />
        <h2 className="font-display text-lg uppercase text-white">
          Acesso do Dono da Academia (/admin)
        </h2>
      </div>
      <p className="text-xs text-neutral-400">
        Crie ou redefina em 1 clique o login exclusivo do cliente para acessar{" "}
        <code className="text-neutral-200">/sites/{slug}/admin</code> (vinculado automaticamente no Supabase Auth).
      </p>

      <form onSubmit={handleCreateAccess} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="dono@academia.com.br"
            className="px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha (mín. 6 caracteres)"
            className="px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <KeyRound className="w-3.5 h-3.5" />
          )}
          <span>{loading ? "Criando acesso..." : "Criar / Atualizar Login do Cliente"}</span>
        </button>

        {success && (
          <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-3 py-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </p>
        )}
        {error && (
          <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/25 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

