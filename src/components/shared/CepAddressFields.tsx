"use client";

import { useState } from "react";
import { Loader2, MapPin, Search, CheckCircle2 } from "lucide-react";

interface AddressValue {
  address: string;
  neighborhood: string;
  city: string;
  google_maps_embed?: string;
}

interface CepAddressFieldsProps {
  value: AddressValue;
  onChange: (next: AddressValue) => void;
  showAddressLine?: boolean;
  showMapsHelper?: boolean;
  compact?: boolean;
}

function formatCep(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function buildGoogleMapsEmbedUrl(addr: AddressValue): string {
  const query = [addr.address, addr.neighborhood, addr.city, "Brasil"]
    .filter(Boolean)
    .join(", ");
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
}

export function CepAddressFields({
  value,
  onChange,
  showAddressLine = true,
  showMapsHelper = false,
  compact = false,
}: CepAddressFieldsProps) {
  const [cep, setCep] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [cepFound, setCepFound] = useState(false);

  const lookupCep = async (rawCep: string) => {
    const digits = rawCep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setCepError("Digite os 8 números do CEP.");
      return;
    }

    setLoading(true);
    setCepError("");
    setCepFound(false);

    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();

      if (!res.ok || data.erro) {
        setCepError("CEP não encontrado. Verifique os números.");
        return;
      }

      const street = data.logradouro || "";
      const composedAddress = street
        ? streetNumber
          ? `${street}, ${streetNumber}`
          : street
        : value.address;
      const neighborhood = data.bairro || value.neighborhood;
      const city =
        data.localidade && data.uf
          ? `${data.localidade} - ${data.uf}`
          : value.city;

      const next: AddressValue = {
        ...value,
        address: composedAddress,
        neighborhood,
        city,
      };

      if (showMapsHelper) {
        next.google_maps_embed = buildGoogleMapsEmbedUrl(next);
      }

      onChange(next);
      setCepFound(true);
    } catch {
      setCepError("Erro ao consultar CEP. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setCep(formatted);
    setCepError("");
    setCepFound(false);
    const digits = formatted.replace(/\D/g, "");
    if (digits.length === 8) {
      lookupCep(digits);
    }
  };

  const handleNumberBlur = () => {
    if (!streetNumber.trim() || !value.address) return;
    if (!value.address.includes(streetNumber.trim())) {
      const base = value.address.split(",")[0].trim();
      const next = { ...value, address: `${base}, ${streetNumber.trim()}` };
      if (showMapsHelper) {
        next.google_maps_embed = buildGoogleMapsEmbedUrl(next);
      }
      onChange(next);
    }
  };

  const inputCls = compact
    ? "w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
    : "w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500";

  return (
    <div className="space-y-2.5">
      {/* Busca Inteligente por CEP */}
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-7">
          <label className="block text-[11px] font-medium text-neutral-300 mb-1">
            CEP (preenche endereço automático)
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              inputMode="numeric"
              value={cep}
              onChange={handleCepChange}
              placeholder="00000-000"
              maxLength={9}
              className={inputCls}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => lookupCep(cep)}
              title="Buscar CEP"
              className="px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white inline-flex items-center justify-center shrink-0 transition"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="col-span-5">
          <label className="block text-[11px] font-medium text-neutral-300 mb-1">
            Número / Sala
          </label>
          <input
            type="text"
            value={streetNumber}
            onChange={(e) => setStreetNumber(e.target.value)}
            onBlur={handleNumberBlur}
            placeholder="Ex: 1480"
            className={inputCls}
          />
        </div>
      </div>

      {cepFound && (
        <p className="text-[11px] text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          Endereço preenchido automaticamente pelo CEP!
        </p>
      )}
      {cepError && <p className="text-[11px] text-rose-400">{cepError}</p>}

      {showAddressLine && (
        <div>
          <label className="block text-[11px] font-medium text-neutral-300 mb-1">
            Rua e Número
          </label>
          <input
            type="text"
            value={value.address}
            onChange={(e) => onChange({ ...value, address: e.target.value })}
            placeholder="Ex: Av. Paulista, 1480 — Sobreloja"
            className={inputCls}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-medium text-neutral-300 mb-1">
            Bairro
          </label>
          <input
            type="text"
            value={value.neighborhood}
            onChange={(e) =>
              onChange({ ...value, neighborhood: e.target.value })
            }
            placeholder="Bela Vista"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-neutral-300 mb-1">
            Cidade - UF
          </label>
          <input
            type="text"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="São Paulo - SP"
            className={inputCls}
          />
        </div>
      </div>

      {showMapsHelper && (
        <button
          type="button"
          onClick={() =>
            onChange({
              ...value,
              google_maps_embed: buildGoogleMapsEmbedUrl(value),
            })
          }
          className="text-[11px] text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 font-semibold transition"
        >
          <MapPin className="w-3.5 h-3.5" />
          Atualizar mapa do Google automaticamente com este endereço
        </button>
      )}
    </div>
  );
}

