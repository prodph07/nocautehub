import { Clock, CreditCard, ShieldCheck } from "lucide-react";

interface PreviewLockedScreenProps {
  academyName: string;
  slug: string;
  paymentLinkUrl?: string | null;
}

export function PreviewLockedScreen({
  academyName,
  slug,
  paymentLinkUrl,
}: PreviewLockedScreenProps) {
  const checkoutHref =
    paymentLinkUrl && !paymentLinkUrl.includes("payment-link-v3.pagar.me")
      ? paymentLinkUrl
      : `https://nocautehub.com/assinar/${slug}`;

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-neutral-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl bg-[#141417] border border-white/10 p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Clock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            Site em Preparação
          </span>
          <h1 className="font-display text-3xl uppercase text-white tracking-wide pt-1">
            {academyName}
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            O endereço oficial{" "}
            <code className="text-neutral-200">{slug}.nocautehub.com</code>{" "}
            está pronto e aguarda a ativação da assinatura para ir ao ar.
          </p>
        </div>

        <div className="pt-2 space-y-2.5">
          <a
            href={checkoutHref}
            className="w-full py-3.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 transition shadow-lg shadow-rose-600/20"
          >
            <CreditCard className="w-4 h-4" />
            <span>Ativar Assinatura (15 Dias Grátis)</span>
          </a>
          <p className="text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            R$ 0,00 hoje • Liberação automática imediata
          </p>
        </div>

        <div className="pt-4 border-t border-white/5 text-[11px] text-neutral-500">
          Tecnologia{" "}
          <a
            href="https://nocautehub.com"
            className="text-neutral-300 hover:text-white underline"
          >
            Nocaute Hub
          </a>
        </div>
      </div>
    </div>
  );
}

