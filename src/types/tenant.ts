export type TenantStatus = "active" | "suspended";
export type DomainStatus = "pending" | "active" | "error";
export type PlanTier = "essencial" | "pro";
export type DayOfWeek = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
export type LeadShift = "Manhã" | "Tarde" | "Noite";
export type LeadStatus = "novo" | "agendado" | "matriculado";

export interface TopBarConfig {
  enabled: boolean;
  text: string;
  cta_text?: string;
  cta_link?: string;
}

export interface ThemeConfig {
  primary: string; // hex e.g. #E11D48
  secondary: string;
  bg: string;
  surface: string;
  font_preset?: "condensada" | "geometrica" | "marcial";
  hero_preset?: "full" | "split" | "minimal";
}

export interface FeatureFlags {
  interactive_schedule: boolean;
  mini_funnel: boolean;
  pixel_enabled: boolean;
  custom_domain: boolean;
}

export interface HeroConfig {
  eyebrow: string;
  headline: string;
  subheadline: string;
  cta_text: string;
  objection_breaker: string;
  media_type: "image" | "video";
  media_url: string;
  marquee_items: string[];
}

export interface AuthorityStat {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
  decimals?: number;
}

export interface TargetAudienceItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: "shield" | "flame" | "baby" | "trophy";
}

export interface GalleryImage {
  url: string;
  caption: string;
  category: string;
}

export interface AmenityItem {
  icon: "car" | "wind" | "shower" | "droplets" | "bus" | "wifi" | "baby" | "shield";
  label: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
}

export interface Tenant {
  id: string;
  slug: string;
  custom_domain: string | null;
  domain_status: DomainStatus;
  cloudflare_hostname_id: string | null;
  status: TenantStatus;
  plan_tier: PlanTier;
  name: string;
  logo_url: string | null;
  whatsapp_number: string;
  address: string;
  neighborhood: string;
  city: string;
  reference_point: string;
  google_maps_embed: string;
  opening_hours: string;
  pixel_id: string | null;
  gtm_id: string | null;
  top_bar_config: TopBarConfig;
  theme_config: ThemeConfig;
  feature_flags: FeatureFlags;
  hero_config: HeroConfig;
  authority_stats: AuthorityStat[];
  target_audience: TargetAudienceItem[];
  gallery_images: GalleryImage[];
  amenities: AmenityItem[];
  faqs: FaqItem[];
  social_links: SocialLinks;
  admin_email?: string;
  admin_password?: string;
  created_at: string;
  updated_at: string;
}

export type AnalyticsEventType = "page_view" | "whatsapp_click";

export interface AnalyticsEvent {
  id: string;
  tenant_id: string;
  event_type: AnalyticsEventType;
  source?: string | null;
  created_at: string;
}

export interface DailyAnalyticsPoint {
  date: string; // YYYY-MM-DD
  label: string; // e.g. "Seg"
  visits: number;
  whatsappClicks: number;
}

export interface WeeklyAnalyticsSummary {
  visits: number;
  whatsappClicks: number;
  conversionRate: number; // percentage 0..100
  daily: DailyAnalyticsPoint[];
}

export interface Modality {
  id: string;
  tenant_id: string;
  name: string;
  short_desc: string;
  image_url: string;
  target_audience: string;
  display_order: number;
}

export interface ScheduleItem {
  id: string;
  tenant_id: string;
  modality_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  instructor_name: string;
  level: string;
}

export interface Instructor {
  id: string;
  tenant_id: string;
  name: string;
  rank: string;
  lineage: string;
  experience_years: number;
  bio: string;
  photo_url: string;
  display_order: number;
}

export interface Testimonial {
  id: string;
  tenant_id: string;
  author_name: string;
  role_or_modality: string;
  rating: number;
  text: string;
  avatar_url: string;
  source: string;
}

export interface Lead {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  chosen_modality: string;
  preferred_shift: LeadShift;
  status: LeadStatus;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

export interface TenantWithRelations extends Tenant {
  modalities: Modality[];
  schedules: ScheduleItem[];
  instructors: Instructor[];
  testimonials: Testimonial[];
  leads_count?: number;
}

export const DAY_LABELS: Record<DayOfWeek, string> = {
  seg: "Segunda",
  ter: "Terça",
  qua: "Quarta",
  qui: "Quinta",
  sex: "Sexta",
  sab: "Sábado",
  dom: "Domingo",
};

export const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
  seg: "SEG",
  ter: "TER",
  qua: "QUA",
  qui: "QUI",
  sex: "SEX",
  sab: "SÁB",
  dom: "DOM",
};

export const DAYS_ORDER: DayOfWeek[] = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];

