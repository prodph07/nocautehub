-- ============================================================================
-- Nocaute Hub - Configurações Globais da Plataforma (Pixel & Tráfego Pago)
-- Execute no SQL Editor do Supabase.
-- ============================================================================

create table if not exists public.platform_settings (
  id text primary key default 'default',
  meta_pixel_id text,
  gtm_id text,
  google_ads_id text,
  updated_at timestamptz not null default now()
);

insert into public.platform_settings (id)
values ('default')
on conflict (id) do nothing;

alter table public.platform_settings enable row level security;

drop policy if exists "Leitura publica de platform_settings" on public.platform_settings;
create policy "Leitura publica de platform_settings"
  on public.platform_settings
  for select
  using (true);

