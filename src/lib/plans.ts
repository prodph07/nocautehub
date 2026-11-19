import type { PlanTier } from "@/types/tenant";

export interface PlanCapabilities {
  customDomain: boolean;
  interactiveSchedule: boolean;
  miniFunnel: boolean;
  topBar: boolean;
  crm: boolean;
  analytics: boolean;
  linkBio: boolean;
  pixelTracking: boolean;
  storiesGenerator: boolean;
}

export function getPlanCapabilities(planTier: PlanTier): PlanCapabilities {
  const isPro = planTier === "pro";
  return {
    customDomain: isPro,
    interactiveSchedule: isPro,
    miniFunnel: isPro,
    topBar: isPro,
    crm: isPro,
    analytics: isPro,
    linkBio: isPro,
    pixelTracking: isPro,
    storiesGenerator: isPro,
  };
}

export interface PlanComparisonRow {
  feature: string;
  essencial: boolean | string;
  pro: boolean | string;
}

export const PLAN_COMPARISON_ROWS: PlanComparisonRow[] = [
  {
    feature: "Site profissional de alta conversão (Design Dark/Premium + Animações)",
    essencial: true,
    pro: true,
  },
  {
    feature: "100% adaptado para celular (Experiência rápida no 4G)",
    essencial: true,
    pro: true,
  },
  {
    feature:
      "Todas as seções essenciais (Modalidades, Professores, Estrutura, Mapa, FAQ e Depoimentos)",
    essencial: true,
    pro: true,
  },
  {
    feature: "Botão direto e flutuante do WhatsApp (com mensagem pronta)",
    essencial: true,
    pro: true,
  },
  {
    feature: "Prévia elegante ao compartilhar link no WhatsApp (Logo + título)",
    essencial: true,
    pro: true,
  },
  {
    feature: "SEO Local (Otimizado para buscas do bairro no Google)",
    essencial: true,
    pro: true,
  },
  {
    feature: "Endereço do site",
    essencial: "Subdomínio (academia.nocautehub.com.br)",
    pro: "Domínio Próprio (sua-academia.com.br) + SSL",
  },
  {
    feature: "Grade de horários",
    essencial: "Grade organizada padrão",
    pro: 'Grade Interativa (abas por dia + botão "Testar essa aula")',
  },
  {
    feature: "Mini-Funil de WhatsApp (Filtra luta e turno antes da conversa)",
    essencial: false,
    pro: true,
  },
  {
    feature: "Painel do Dono (/admin) (Altere horários e informações sozinho, na hora)",
    essencial: true,
    pro: true,
  },
  {
    feature: "Faixa de Avisos Rápidos no topo (Feriados, seminários, promoções)",
    essencial: false,
    pro: true,
  },
  {
    feature: "Gestão de Interessados (Mini-CRM) (Lista de leads + status de matrícula)",
    essencial: false,
    pro: true,
  },
  {
    feature: "Relatório simples de resultados (Visitas e cliques no WhatsApp)",
    essencial: false,
    pro: true,
  },
  {
    feature: "Página de Link na Bio (/links) (Substitui o Linktree no Instagram)",
    essencial: false,
    pro: true,
  },
  {
    feature: "Pronto para Anúncios Pagos (Meta Pixel + rastreamento de clique)",
    essencial: false,
    pro: true,
  },
  {
    feature: "Gerador de Grade para Stories (1080×1920 para Instagram)",
    essencial: false,
    pro: true,
  },
];

