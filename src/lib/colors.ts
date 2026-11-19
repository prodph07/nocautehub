/**
 * Converte cor HEX (#E11D48 ou #e11d48) em triplet RGB ("225 29 72")
 * para uso em Tailwind CSS com suporte a opacidade: rgb(var(--primary-rgb) / <alpha-value>)
 */
export function hexToRgbTriplet(hex: string): string {
  const clean = (hex || "#E11D48").replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return "225 29 72";
  }

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

export const BRAND_COLOR_PRESETS = [
  { name: "Vermelho Nocaute", hex: "#E11D48" },
  { name: "Laranja Combate", hex: "#F97316" },
  { name: "Ouro Campeão", hex: "#EAB308" },
  { name: "Azul Royal Tatame", hex: "#2563EB" },
  { name: "Verde Neon Strike", hex: "#22C55E" },
  { name: "Roxo Faixa", hex: "#9333EA" },
];

