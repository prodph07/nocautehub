"use client";

import { CheckCircle2, Phone } from "lucide-react";

interface WhatsAppInputProps {
  label?: string;
  value: string; // Stored normalized with 55 prefix e.g. "5511999999999" or raw digits
  onChange: (normalizedValue: string) => void;
  includeCountryPrefix?: boolean;
  required?: boolean;
  placeholder?: string;
}

/**
 * Formata dígitos locais (10 ou 11 dígitos) em (DD) 99999-9999 ou (DD) 9999-9999.
 */
function formatBrPhone(localDigits: string): string {
  const d = localDigits.slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function extractLocalDigits(val: string, includeCountryPrefix: boolean): string {
  const digits = (val || "").replace(/\D/g, "");
  if (includeCountryPrefix && digits.startsWith("55") && digits.length > 11) {
    return digits.slice(2, 13);
  }
  if (includeCountryPrefix && digits.startsWith("55") && digits.length === 12) {
    return digits.slice(2);
  }
  return digits.slice(0, 11);
}

export function WhatsAppInput({
  label,
  value,
  onChange,
  includeCountryPrefix = true,
  required = false,
  placeholder = "(11) 99999-9999",
}: WhatsAppInputProps) {
  const localDigits = extractLocalDigits(value, includeCountryPrefix);
  const formatted = formatBrPhone(localDigits);
  const isValid = localDigits.length === 10 || localDigits.length === 11;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (!onlyDigits) {
      onChange("");
      return;
    }
    onChange(includeCountryPrefix ? `55${onlyDigits}` : onlyDigits);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-neutral-300">
          {label} {required && "*"}
        </label>
      )}
      <div className="flex items-center rounded-xl bg-black/50 border border-white/15 focus-within:border-rose-500 overflow-hidden">
        <span className="px-3 py-2.5 bg-white/5 border-r border-white/10 text-xs font-semibold text-neutral-300 inline-flex items-center gap-1.5 shrink-0 select-none">
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          +55
        </span>
        <input
          type="tel"
          inputMode="numeric"
          required={required}
          value={formatted}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={15}
          className="flex-1 min-w-0 px-3 py-2.5 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
        />
        {isValid && (
          <span className="pr-3 text-emerald-400" title="WhatsApp válido">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        )}
      </div>
      {localDigits.length > 0 && !isValid && (
        <p className="text-[11px] text-amber-400">
          Digite o DDD + número completo (10 ou 11 dígitos).
        </p>
      )}
    </div>
  );
}

