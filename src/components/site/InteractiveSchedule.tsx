"use client";

import { useMemo, useState } from "react";
import { Clock, User, Calendar, ArrowRight } from "lucide-react";
import {
  DAYS_ORDER,
  DAY_LABELS,
  DAY_SHORT_LABELS,
  type DayOfWeek,
  type Modality,
  type ScheduleItem,
} from "@/types/tenant";

interface InteractiveScheduleProps {
  modalities: Modality[];
  schedules: ScheduleItem[];
  onBookModality: (modalityName: string) => void;
}

const JS_DAY_TO_KEY: DayOfWeek[] = [
  "dom",
  "seg",
  "ter",
  "qua",
  "qui",
  "sex",
  "sab",
];

export function InteractiveSchedule({
  modalities,
  schedules,
  onBookModality,
}: InteractiveScheduleProps) {
  const activeDays = useMemo(() => {
    const set = new Set(schedules.map((s) => s.day_of_week));
    return DAYS_ORDER.filter((d) => set.has(d));
  }, [schedules]);

  const defaultDay = useMemo<DayOfWeek | "all">(() => {
    const todayKey = JS_DAY_TO_KEY[new Date().getDay()];
    return activeDays.includes(todayKey) ? todayKey : activeDays[0] || "all";
  }, [activeDays]);

  const [selectedDay, setSelectedDay] = useState<DayOfWeek | "all">(defaultDay);
  const [selectedModality, setSelectedModality] = useState<string>("all");

  const modalityMap = useMemo(() => {
    const map = new Map<string, Modality>();
    modalities.forEach((m) => map.set(m.id, m));
    return map;
  }, [modalities]);

  const filtered = useMemo(() => {
    return schedules
      .filter((s) => {
        if (selectedDay !== "all" && s.day_of_week !== selectedDay) return false;
        if (selectedModality !== "all" && s.modality_id !== selectedModality)
          return false;
        return true;
      })
      .sort((a, b) => {
        const dayDiff =
          DAYS_ORDER.indexOf(a.day_of_week) - DAYS_ORDER.indexOf(b.day_of_week);
        if (dayDiff !== 0) return dayDiff;
        return a.start_time.localeCompare(b.start_time);
      });
  }, [schedules, selectedDay, selectedModality]);

  const groupedByDay = useMemo(() => {
    const groups = new Map<DayOfWeek, ScheduleItem[]>();
    filtered.forEach((item) => {
      const list = groups.get(item.day_of_week) ?? [];
      list.push(item);
      groups.set(item.day_of_week, list);
    });
    return Array.from(groups.entries());
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Filtros Interativos */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <Calendar className="w-4 h-4 text-brand-primary" />
            <span>Filtrar por Dia</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeDays.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold active:scale-[0.97] transition duration-200 ${
                  selectedDay === day
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25"
                    : "bg-white/5 text-neutral-300 hover:bg-white/10"
                }`}
              >
                {DAY_SHORT_LABELS[day]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedDay("all")}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold active:scale-[0.97] transition duration-200 ${
                selectedDay === "all"
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25"
                  : "bg-white/5 text-neutral-300 hover:bg-white/10"
              }`}
            >
              Semana toda
            </button>
          </div>
        </div>

        <div className="h-px bg-white/5" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Filtrar por Modalidade
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedModality("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedModality === "all"
                  ? "bg-white text-black font-semibold"
                  : "bg-white/5 text-neutral-300 hover:bg-white/10"
              }`}
            >
              Todas
            </button>
            {modalities.map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => setSelectedModality(mod.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedModality === mod.id
                    ? "bg-white text-black font-semibold"
                    : "bg-white/5 text-neutral-300 hover:bg-white/10"
                }`}
              >
                {mod.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista Dinâmica em HTML (Mobile-First) */}
      {groupedByDay.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-neutral-400 text-sm">
          Nenhuma aula encontrada para este filtro. Tente selecionar outro dia ou modalidade.
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByDay.map(([day, items]) => (
            <div key={day} className="space-y-2.5">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-lg sm:text-xl uppercase tracking-wider text-white">
                  {DAY_LABELS[day]}
                </h3>
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-neutral-500">
                  {items.length} {items.length === 1 ? "aula" : "aulas"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((item) => {
                  const mod = modalityMap.get(item.modality_id);
                  const modName = mod?.name || "Modalidade";
                  return (
                    <div
                      key={item.id}
                      className="glass-card rounded-xl p-4 hover:border-brand-primary/50 transition flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="px-2.5 py-2 rounded-lg bg-brand-primary/15 border border-brand-primary/30 text-center shrink-0">
                          <div className="flex items-center justify-center gap-1 text-brand-primary font-bold text-sm leading-none">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{item.start_time}</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 block mt-1">
                            até {item.end_time}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-semibold text-white text-sm sm:text-base truncate">
                            {modName}
                          </h4>
                          <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5 truncate">
                            <User className="w-3 h-3 shrink-0 text-neutral-500" />
                            <span className="truncate">
                              {item.instructor_name || "Equipe Técnica"}
                            </span>
                          </p>
                          <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/10">
                            {item.level}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onBookModality(modName)}
                        className="shrink-0 min-h-[44px] px-3.5 py-2 rounded-xl bg-white/5 hover:bg-brand-primary active:scale-[0.97] text-neutral-200 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <span className="hidden sm:inline">Testar aula</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

