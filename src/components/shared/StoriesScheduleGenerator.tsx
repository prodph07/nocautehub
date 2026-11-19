"use client";

import { useState } from "react";
import { Download, Instagram, Loader2 } from "lucide-react";
import {
  DAYS_ORDER,
  DAY_LABELS,
  type DayOfWeek,
  type TenantWithRelations,
} from "@/types/tenant";

interface StoriesScheduleGeneratorProps {
  tenant: TenantWithRelations;
}

/**
 * Renderiza a grade de horários do banco diretamente em imagem vertical 1080×1920 (PNG)
 * pronta para postar nos Stories do Instagram. 100% client-side via Canvas API.
 */
export function StoriesScheduleGenerator({
  tenant,
}: StoriesScheduleGeneratorProps) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const width = 1080;
      const height = 1920;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const primary = tenant.theme_config?.primary || "#E11D48";

      // Fundo Dark Mode
      ctx.fillStyle = "#0C0C0C";
      ctx.fillRect(0, 0, width, height);

      // Glow radial no topo na cor primária
      const grad = ctx.createRadialGradient(
        width / 2,
        140,
        40,
        width / 2,
        140,
        680
      );
      grad.addColorStop(0, `${primary}44`);
      grad.addColorStop(1, "rgba(12,12,12,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, 750);

      // Faixa superior de destaque
      ctx.fillStyle = primary;
      ctx.fillRect(0, 0, width, 16);

      // Nome da academia
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.font = "700 54px Oswald, sans-serif";
      ctx.fillText(tenant.name.toUpperCase(), width / 2, 130);

      // Bairro e cidade
      ctx.fillStyle = "#A3A3A3";
      ctx.font = "500 28px Inter, sans-serif";
      ctx.fillText(
        `${tenant.neighborhood} • ${tenant.city}`.toUpperCase(),
        width / 2,
        178
      );

      // Título principal
      ctx.fillStyle = primary;
      ctx.font = "700 84px Oswald, sans-serif";
      ctx.fillText("GRADE DE HORÁRIOS", width / 2, 285);

      // Linha divisória
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(90, 320, width - 180, 2);

      // Mapeia modalidades
      const modMap = new Map(tenant.modalities.map((m) => [m.id, m.name]));

      // Agrupa horários por dia
      const grouped = new Map<DayOfWeek, typeof tenant.schedules>();
      for (const day of DAYS_ORDER) {
        const items = tenant.schedules
          .filter((s) => s.day_of_week === day)
          .sort((a, b) => a.start_time.localeCompare(b.start_time));
        if (items.length > 0) grouped.set(day, items);
      }

      let y = 375;
      const leftX = 80;
      const boxW = width - 160;

      for (const [day, items] of grouped.entries()) {
        if (y > 1650) break;

        // Cabeçalho do dia
        ctx.textAlign = "left";
        ctx.fillStyle = primary;
        ctx.font = "700 34px Oswald, sans-serif";
        ctx.fillText(DAY_LABELS[day].toUpperCase(), leftX, y);
        y += 18;

        for (const item of items.slice(0, 4)) {
          if (y > 1680) break;
          // Card da aula
          ctx.fillStyle = "rgba(255,255,255,0.05)";
          ctx.beginPath();
          ctx.roundRect(leftX, y, boxW, 66, 14);
          ctx.fill();

          // Horário
          ctx.fillStyle = primary;
          ctx.font = "700 28px Inter, sans-serif";
          ctx.fillText(item.start_time, leftX + 24, y + 43);

          // Modalidade
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "600 28px Inter, sans-serif";
          const modName = modMap.get(item.modality_id) || "Treino";
          ctx.fillText(modName, leftX + 150, y + 43);

          // Nível à direita
          ctx.textAlign = "right";
          ctx.fillStyle = "#A3A3A3";
          ctx.font = "500 22px Inter, sans-serif";
          ctx.fillText(item.level.slice(0, 22), leftX + boxW - 24, y + 41);
          ctx.textAlign = "left";

          y += 78;
        }
        y += 26;
      }

      // Rodapé CTA
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.roundRect(90, height - 185, width - 180, 92, 20);
      ctx.fill();

      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 34px Oswald, sans-serif";
      ctx.fillText(
        "AGENDE SUA 1ª AULA GRATUITA NO LINK DA BIO",
        width / 2,
        height - 127
      );

      ctx.fillStyle = "#737373";
      ctx.font = "500 22px Inter, sans-serif";
      ctx.fillText(
        tenant.custom_domain || `${tenant.slug}.nocautehub.com.br`,
        width / 2,
        height - 46
      );

      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `horarios-stories-${tenant.slug}.png`;
      a.click();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      type="button"
      disabled={generating}
      onClick={handleGenerate}
      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:brightness-110 text-white text-xs font-bold inline-flex items-center gap-1.5 transition shadow-lg shadow-rose-600/20 disabled:opacity-60"
    >
      {generating ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Instagram className="w-3.5 h-3.5" />
      )}
      <span>Baixar Grade p/ Stories (1080×1920)</span>
      <Download className="w-3.5 h-3.5" />
    </button>
  );
}

