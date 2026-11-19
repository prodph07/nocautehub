"use client";

import { useState } from "react";
import {
  Globe,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import type { DomainStatus } from "@/types/tenant";

interface DomainManagerCardProps {
  tenantId: string;
  slug: string;
  initialDomain: string | null;
  initialStatus: DomainStatus;
  onDomainChange?: (domain: string | null, status: DomainStatus) => void;
}

export function DomainManagerCard({
  tenantId,
  slug,
  initialDomain,
  initialStatus,
  onDomainChange,
}: DomainManagerCardProps) {
  const [domainInput, setDomainInput] = useState(initialDomain || "");
  const [connectedDomain, setConnectedDomain] = useState<string | null>(
    initialDomain
  );
  const [status, setStatus] = useState<DomainStatus>(initialStatus || "pending");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState<"add" | "verify" | "remove" | null>(
    null
  );
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const cnameTarget =
    process.env.NEXT_PUBLIC_CLOUDFLARE_CNAME_TARGET ||
    "cname.nocautehub.com.br";

  const handleCopyCname = () => {
    navigator.clipboard.writeText(cnameTarget);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;
    setLoading("add");
    setError("");
    setFeedback("");

    try {
      const res = await fetch("/api/domains/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, domain: domainInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao registrar domínio");

      const nextDomain = data.tenant?.custom_domain || domainInput.trim();
      setConnectedDomain(nextDomain);
      setStatus("pending");
      setFeedback(
        "Domínio registrado! Agora adicione o registro CNAME abaixo no seu provedor e clique em Verificar Conexão."
      );
      onDomainChange?.(nextDomain, "pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao conectar domínio");
    } finally {
      setLoading(null);
    }
  };

  const handleVerify = async () => {
    setLoading("verify");
    setError("");
    setFeedback("");

    try {
      const res = await fetch(
        `/api/domains/verify?tenantId=${encodeURIComponent(tenantId)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao verificar DNS");

      const nextStatus: DomainStatus = data.domain_status || "active";
      setStatus(nextStatus);
      setFeedback(data.detail || "Verificação concluída!");
      onDomainChange?.(connectedDomain, nextStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao verificar DNS");
    } finally {
      setLoading(null);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Deseja desconectar este domínio próprio?")) return;
    setLoading("remove");
    setError("");
    setFeedback("");

    try {
      const res = await fetch(
        `/api/domains/remove?tenantId=${encodeURIComponent(tenantId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao remover domínio");

      setConnectedDomain(null);
      setDomainInput("");
      setStatus("pending");
      setFeedback("Domínio removido. Seu site continua ativo no subdomínio.");
      onDomainChange?.(null, "pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover domínio");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-600/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-lg uppercase text-white leading-none">
              Domínio Próprio & SSL Automático
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Subdomínio gratuito ativo:{" "}
              <code className="text-neutral-200">{slug}.nocautehub.com.br</code>
            </p>
          </div>
        </div>

        {connectedDomain && (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
              status === "active"
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : status === "error"
                ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                : "bg-amber-500/15 text-amber-300 border-amber-500/30"
            }`}
          >
            {status === "active" ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                Conectado e Seguro (SSL)
              </>
            ) : status === "error" ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                Erro no DNS
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" />
                Aguardando DNS
              </>
            )}
          </span>
        )}
      </div>

      {/* Passo 1: Digitar domínio */}
      <form onSubmit={handleAdd} className="space-y-2">
        <label className="block text-xs font-semibold text-neutral-300">
          Passo 1 — Digite seu domínio próprio (Registro.br, Hostinger, GoDaddy)
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="ex: academiaalfa.com.br"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={loading !== null}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {loading === "add" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{connectedDomain ? "Atualizar Domínio" : "Conectar Domínio"}</span>
          </button>
        </div>
      </form>

      {/* Passo 2 & 3: CNAME + Verificar Conexão */}
      {connectedDomain && (
        <div className="rounded-xl bg-black/40 border border-white/10 p-4 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-neutral-200">
              Passo 2 — Crie este registro DNS no painel do seu domínio:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <span className="text-[10px] uppercase text-neutral-500 block">
                  Tipo
                </span>
                <strong className="text-white">CNAME</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <span className="text-[10px] uppercase text-neutral-500 block">
                  Nome / Host
                </span>
                <strong className="text-white">@ ou www</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase text-neutral-500 block">
                    Destino (Aponta para)
                  </span>
                  <code className="text-emerald-300 font-semibold truncate block">
                    {cnameTarget}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCname}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white shrink-0"
                  title="Copiar CNAME"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              disabled={loading !== null}
              onClick={handleVerify}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition disabled:opacity-60"
            >
              {loading === "verify" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>Passo 3 — Verificar Conexão</span>
            </button>

            <button
              type="button"
              disabled={loading !== null}
              onClick={handleRemove}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-600/20 border border-white/10 text-xs text-neutral-400 hover:text-rose-300 inline-flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remover Domínio</span>
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3.5 py-2.5">
          {feedback}
        </p>
      )}
      {error && (
        <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/25 rounded-xl px-3.5 py-2.5">
          {error}
        </p>
      )}
    </div>
  );
}

