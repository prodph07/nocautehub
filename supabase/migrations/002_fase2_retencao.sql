-- ============================================================================
-- Nocaute Hub - Fase 2 (Versão 1.5 - Retenção e Autonomia)
-- Execute após 001_initial_schema.sql quando conectar o Supabase.
-- ============================================================================

-- 1. Vínculo de usuários do Painel do Cliente (Isolamento por Tenant via RLS)
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

-- 2. Eventos de Analytics Descomplicado (Visitas & Cliques no WhatsApp)
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_type text not null check (event_type in ('page_view', 'whatsapp_click')),
  source text,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_tenant_date
  on public.analytics_events (tenant_id, created_at desc);

-- RLS
alter table public.tenant_users enable row level security;
alter table public.analytics_events enable row level security;

-- Inserção pública de eventos de visita e clique no WhatsApp
create policy "Public insert analytics_events" on public.analytics_events
  for insert with check (true);

create policy "Authenticated read analytics_events" on public.analytics_events
  for select using (auth.role() = 'authenticated');

create policy "Authenticated manage tenant_users" on public.tenant_users
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

