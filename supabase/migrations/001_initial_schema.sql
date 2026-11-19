-- ============================================================================
-- Nocaute Hub - Schema Inicial (Fase 1 - MVP 1.0)
-- Execute este arquivo no SQL Editor do seu projeto Supabase quando criá-lo.
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. TENANTS (Academias)
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  custom_domain text unique,
  domain_status text not null default 'pending' check (domain_status in ('pending', 'active', 'error')),
  cloudflare_hostname_id text,
  status text not null default 'active' check (status in ('active', 'suspended')),
  plan_tier text not null default 'pro' check (plan_tier in ('essencial', 'pro')),

  -- Identidade e Contato
  name text not null,
  logo_url text,
  whatsapp_number text not null,
  address text not null default '',
  neighborhood text not null default '',
  city text not null default '',
  reference_point text not null default '',
  google_maps_embed text not null default '',
  opening_hours text not null default 'Seg a Sex: 06h às 22h • Sáb: 08h às 14h',

  -- Rastreamento
  pixel_id text,
  gtm_id text,

  -- Configurações Dinâmicas (JSONB) para 100% das 11 seções editáveis
  top_bar_config jsonb not null default '{"enabled": false, "text": "", "cta_text": "", "cta_link": ""}'::jsonb,
  theme_config jsonb not null default '{"primary": "#E11D48", "secondary": "#F59E0B", "bg": "#0C0C0C", "surface": "#141414", "font_preset": "condensada", "hero_preset": "full"}'::jsonb,
  feature_flags jsonb not null default '{"interactive_schedule": true, "mini_funnel": true, "pixel_enabled": true, "custom_domain": true}'::jsonb,
  hero_config jsonb not null default '{}'::jsonb,
  authority_stats jsonb not null default '[]'::jsonb,
  target_audience jsonb not null default '[]'::jsonb,
  gallery_images jsonb not null default '[]'::jsonb,
  amenities jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  social_links jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tenants_slug on public.tenants (slug);
create index if not exists idx_tenants_custom_domain on public.tenants (custom_domain);

-- 2. MODALITIES (Modalidades)
create table if not exists public.modalities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  short_desc text not null,
  image_url text not null default '',
  target_audience text not null default 'Iniciante / Todos os níveis',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_modalities_tenant on public.modalities (tenant_id, display_order);

-- 3. SCHEDULES (Grade de Horários)
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  modality_id uuid not null references public.modalities(id) on delete cascade,
  day_of_week text not null check (day_of_week in ('seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom')),
  start_time text not null,
  end_time text not null,
  instructor_name text not null default '',
  level text not null default 'Todos os níveis',
  created_at timestamptz not null default now()
);

create index if not exists idx_schedules_tenant on public.schedules (tenant_id, day_of_week, start_time);

-- 4. INSTRUCTORS (Mestre e Equipe)
create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  rank text not null,
  lineage text not null default '',
  experience_years integer not null default 5,
  bio text not null default '',
  photo_url text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_instructors_tenant on public.instructors (tenant_id, display_order);

-- 5. TESTIMONIALS (Depoimentos Reais)
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  author_name text not null,
  role_or_modality text not null default 'Aluno(a)',
  rating integer not null default 5 check (rating >= 1 and rating <= 5),
  text text not null,
  avatar_url text not null default '',
  source text not null default 'Google',
  created_at timestamptz not null default now()
);

create index if not exists idx_testimonials_tenant on public.testimonials (tenant_id);

-- 6. LEADS (Mini-Funil WhatsApp / Mini-CRM)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  phone text not null default '',
  chosen_modality text not null,
  preferred_shift text not null check (preferred_shift in ('Manhã', 'Tarde', 'Noite')),
  status text not null default 'novo' check (status in ('novo', 'agendado', 'matriculado')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_tenant_created on public.leads (tenant_id, created_at desc);

-- Trigger de updated_at automático em tenants
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_tenants_updated_at on public.tenants;
create trigger set_tenants_updated_at
  before update on public.tenants
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

alter table public.tenants enable row level security;
alter table public.modalities enable row level security;
alter table public.schedules enable row level security;
alter table public.instructors enable row level security;
alter table public.testimonials enable row level security;
alter table public.leads enable row level security;

-- Leitura pública para renderização dos sites multi-tenant
create policy "Public read tenants" on public.tenants
  for select using (true);

create policy "Public read modalities" on public.modalities
  for select using (true);

create policy "Public read schedules" on public.schedules
  for select using (true);

create policy "Public read instructors" on public.instructors
  for select using (true);

create policy "Public read testimonials" on public.testimonials
  for select using (true);

-- Inserção pública de leads (Mini-Funil de WhatsApp)
create policy "Public insert leads" on public.leads
  for insert with check (true);

-- Acesso completo para usuários autenticados (Painel Master na Fase 1)
create policy "Authenticated full tenants" on public.tenants
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full modalities" on public.modalities
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full schedules" on public.schedules
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full instructors" on public.instructors
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full testimonials" on public.testimonials
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full leads" on public.leads
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================================
-- STORAGE BUCKET PARA MÍDIA DAS ACADEMIAS (.webp)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('tenant-media', 'tenant-media', true)
on conflict (id) do nothing;

create policy "Public read tenant-media" on storage.objects
  for select using (bucket_id = 'tenant-media');

create policy "Authenticated upload tenant-media" on storage.objects
  for insert with check (bucket_id = 'tenant-media' and auth.role() = 'authenticated');

create policy "Authenticated update tenant-media" on storage.objects
  for update using (bucket_id = 'tenant-media' and auth.role() = 'authenticated');

create policy "Authenticated delete tenant-media" on storage.objects
  for delete using (bucket_id = 'tenant-media' and auth.role() = 'authenticated');

