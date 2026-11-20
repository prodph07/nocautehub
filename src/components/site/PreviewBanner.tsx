import { Eye, CreditCard } from "lucide-react";

interface PreviewBannerProps {
  slug: string;
  paymentLinkUrl?: string | null;
}

export function PreviewBanner({ slug, paymentLinkUrl }: PreviewBannerProps) {
  const checkoutHref =
    paymentLinkUrl && !paymentLinkUrl.includes("payment-link-v3.pagar.me")
      ? paymentLinkUrl
      : `/assinar/${slug}`;

  return (
    <div className="sticky top-0 z-[60] bg-amber-500 text-black border-b border-black/15">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-semibold">
        <div className="flex items-center gap-2 min-w-0">
          <Eye className="w-4 h-4 shrink-0" />
          <span className="truncate">
            <strong>Modo Demonstração</strong> — Ative sua assinatura para liberar{" "}
            <code className="px-1.5 py-0.5 rounded bg-black/15 font-mono text-[11px] sm:text-xs">
              {slug}.nocautehub.com
            </code>
          </span>
        </div>
        <a
          href={checkoutHref}
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-1.5 rounded-lg bg-black hover:bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition shrink-0"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Assinar Agora (15 Dias Grátis)</span>
        </a>
      </div>
    </div>
  );
}

