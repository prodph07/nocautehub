"use client";

import { MessageCircle } from "lucide-react";
import {
  buildSalesWhatsAppUrl,
  trackPlatformConversion,
} from "@/lib/pixel-events";

interface SalesWhatsAppButtonProps {
  label: string;
  message: string;
  sourceLabel: string;
  className?: string;
}

export function SalesWhatsAppButton({
  label,
  message,
  sourceLabel,
  className,
}: SalesWhatsAppButtonProps) {
  return (
    <a
      href={buildSalesWhatsAppUrl(message)}
      target="_blank"
      rel="noreferrer"
      onClick={() =>
        trackPlatformConversion("Lead", {
          content_name: sourceLabel,
        })
      }
      className={
        className ||
        "min-h-[48px] px-6 py-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] border border-[#25D366]/40 text-[#25D366] hover:text-black font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 transition"
      }
    >
      <MessageCircle className="w-4 h-4" />
      <span>{label}</span>
    </a>
  );
}
