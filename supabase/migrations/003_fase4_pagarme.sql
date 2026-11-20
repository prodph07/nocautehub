-- ============================================================================
-- Nocaute Hub - Fase 4: Assinaturas Pagar.me v5 + Modo Preview & Parceiros
-- Execute no SQL Editor do Supabase antes de publicar em produção.
-- ============================================================================

-- 1. Atualiza constraint de status para incluir 'preview'
alter table public.tenants
  drop constraint if exists tenants_status_check;

alter table public.tenants
  add constraint tenants_status_check
  check (status in ('preview', 'active', 'suspended'));

-- 2. Colunas de cobrança, parceiro e Pagar.me v5
alter table public.tenants
  add column if not exists billing_mode text not null default 'partner'
    check (billing_mode in ('preview', 'pagarme', 'partner')),
  add column if not exists subscription_status text not null default 'none'
    check (subscription_status in ('none', 'pending', 'paid', 'past_due', 'canceled')),
  add column if not exists monthly_price_cents integer not null default 9700,
  add column if not exists pagarme_payment_link_id text,
  add column if not exists pagarme_payment_link_url text,
  add column if not exists pagarme_subscription_id text;

-- Academias que já estavam ativas antes desta migration ficam preservadas como 'partner'
update public.tenants
set billing_mode = 'partner'
where status = 'active' and billing_mode is null;
