-- ============================================================================
-- NOCAUTE HUB — SETUP COMPLETO DO BANCO DE DADOS (FASES 1, 2 e 3 + DEMO SEED)
-- Cole este arquivo inteiro no SQL Editor do seu projeto Supabase e clique em RUN.
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

  name text not null,
  logo_url text,
  whatsapp_number text not null,
  address text not null default '',
  neighborhood text not null default '',
  city text not null default '',
  reference_point text not null default '',
  google_maps_embed text not null default '',
  opening_hours text not null default 'Seg a Sex: 06h às 22h • Sáb: 08h às 14h',

  pixel_id text,
  gtm_id text,

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

-- 2. MODALITIES
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

-- 3. SCHEDULES
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

-- 4. INSTRUCTORS
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

-- 5. TESTIMONIALS
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

-- 7. TENANT_USERS (Painel do Cliente isolado por academia)
create table if not exists public.tenant_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null,
  email text not null,
  role text not null default 'owner' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);
create index if not exists idx_tenant_users_user on public.tenant_users (user_id);

-- 8. ANALYTICS_EVENTS (Analytics Descomplicado)
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_type text not null check (event_type in ('page_view', 'whatsapp_click')),
  source text,
  created_at timestamptz not null default now()
);
create index if not exists idx_analytics_tenant_date on public.analytics_events (tenant_id, created_at desc);

-- Trigger updated_at
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
alter table public.tenant_users enable row level security;
alter table public.analytics_events enable row level security;

create policy "Public read tenants" on public.tenants for select using (true);
create policy "Public read modalities" on public.modalities for select using (true);
create policy "Public read schedules" on public.schedules for select using (true);
create policy "Public read instructors" on public.instructors for select using (true);
create policy "Public read testimonials" on public.testimonials for select using (true);
create policy "Public insert leads" on public.leads for insert with check (true);
create policy "Public insert analytics_events" on public.analytics_events for insert with check (true);

create policy "Authenticated full tenants" on public.tenants for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full modalities" on public.modalities for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full schedules" on public.schedules for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full instructors" on public.instructors for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full testimonials" on public.testimonials for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full leads" on public.leads for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated manage tenant_users" on public.tenant_users for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated read analytics_events" on public.analytics_events for select using (auth.role() = 'authenticated');

-- ============================================================================
-- STORAGE BUCKET PARA MÍDIA (.webp)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('tenant-media', 'tenant-media', true)
on conflict (id) do nothing;

create policy "Public read tenant-media" on storage.objects for select using (bucket_id = 'tenant-media');
create policy "Authenticated upload tenant-media" on storage.objects for insert with check (bucket_id = 'tenant-media' and auth.role() = 'authenticated');
create policy "Authenticated update tenant-media" on storage.objects for update using (bucket_id = 'tenant-media' and auth.role() = 'authenticated');
create policy "Authenticated delete tenant-media" on storage.objects for delete using (bucket_id = 'tenant-media' and auth.role() = 'authenticated');

-- ============================================================================
-- SEED INICIAL: ACADEMIA DEMO (nocaute-fight-club)
-- ============================================================================
insert into public.tenants (
  id, slug, status, plan_tier, name, whatsapp_number,
  address, neighborhood, city, reference_point, opening_hours,
  top_bar_config, theme_config, hero_config, authority_stats,
  target_audience, gallery_images, amenities, faqs, social_links
) values (
  '11111111-1111-4111-8111-111111111111',
  'nocaute-fight-club',
  'active',
  'pro',
  'Nocaute Fight Club',
  '5511999999999',
  'Av. Paulista, 1480 — Sobreloja',
  'Bela Vista',
  'São Paulo - SP',
  'A 150m do Metrô Trianon-MASP',
  'Seg a Sex: 06h30 às 22h • Sábado: 09h às 13h',
  '{"enabled": true, "text": "Vagas abertas para novas turmas de Iniciantes — 1ª aula 100% gratuita!", "cta_text": "Garantir vaga"}'::jsonb,
  '{"primary": "#E11D48", "secondary": "#F59E0B", "bg": "#0C0C0C", "surface": "#141414", "font_preset": "condensada", "hero_preset": "full"}'::jsonb,
  '{"eyebrow": "Bela Vista • São Paulo", "headline": "TRANSFORME SEU CORPO E SUA MENTE NO TATAME", "subheadline": "Jiu-Jitsu, Muay Thai e Boxe em Bela Vista com metodologia segura para iniciantes do zero, turmas Kids e estrutura climatizada.", "cta_text": "Agendar Aula Experimental Gratuita", "objection_breaker": "Não precisa ter equipamento • Emprestamos luvas/kimono na 1ª aula", "media_type": "image", "media_url": "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1800&q=85", "marquee_items": ["JIU-JITSU", "MUAY THAI", "BOXE", "DISCIPLINA", "DEFESA PESSOAL"]}'::jsonb,
  '[{"value": 850, "suffix": "+", "label": "Alunos Formados"}, {"value": 14, "suffix": " Anos", "label": "De Tradição no Tatame"}, {"value": 4.9, "suffix": "★", "label": "Nota no Google", "decimals": 1}, {"value": 100, "suffix": "%", "label": "Filiada CBJJ & CBMT"}]'::jsonb,
  '[{"id": "iniciantes", "badge": "ZERO EXPERIÊNCIA", "title": "Iniciantes do Zero", "description": "Aprenda os fundamentos passo a passo, sem pressão e sem risco de lesão.", "icon": "shield"}, {"id": "fitness", "badge": "ALTO GASTO CALÓRICO", "title": "Treino Fitness", "description": "Treinos dinâmicos que derretem estresse e aumentam sua disposição.", "icon": "flame"}, {"id": "kids", "badge": "5 A 13 ANOS", "title": "Turma Kids", "description": "Foco, respeito, disciplina e autoconfiança longe das telas.", "icon": "baby"}, {"id": "atletas", "badge": "ALTA PERFORMANCE", "title": "Atletas & Competição", "description": "Sparring técnico e preparação específica para campeonatos.", "icon": "trophy"}]'::jsonb,
  '[{"url": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80", "caption": "Tatame olímpico higienizado entre todos os turnos", "category": "Tatame"}]'::jsonb,
  '[{"icon": "car", "label": "Estacionamento Conveniado"}, {"icon": "wind", "label": "100% Climatizada"}, {"icon": "shower", "label": "Vestiários com Chuveiro"}, {"icon": "droplets", "label": "Bebedouro Gelado"}]'::jsonb,
  '[{"question": "Preciso comprar kimono ou luvas antes da primeira aula?", "answer": "Não! Emprestamos luvas ou kimono higienizados sem nenhum custo na sua aula experimental."}]'::jsonb,
  '{"instagram": "https://instagram.com"}'::jsonb
) on conflict (slug) do nothing;

