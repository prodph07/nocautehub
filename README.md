# Nocaute Hub — Plataforma SaaS Multi-Tenant de Sites para Academias de Luta

Implementação completa das **Fases 1, 2 e 3** conforme a especificação técnica.

## Stack
- **Next.js 15 (App Router)** + TypeScript + Tailwind CSS
- **Supabase** (PostgreSQL + RLS + Storage + Auth) — *pronto para conectar quando criar o projeto*
- **Cloudflare Pages** (Edge-ready, conversão `.webp` no navegador via Canvas API, suporte a Cloudflare for SaaS Custom Hostnames)

## Rotas Principais (Modo Local — porta `3001` ou `3000`)

- **Institucional Nocaute Hub**: `http://localhost:3001`
- **Site Demo da Academia (11 seções + Mini-Funil + Schema.org)**: `http://localhost:3001/sites/nocaute-fight-club`
- **Link na Bio Nativo (`/links`)**: `http://localhost:3001/sites/nocaute-fight-club/links`
- **Painel do Cliente (`/admin`)**: `http://localhost:3001/sites/nocaute-fight-club/admin`
  - E-mail (Modo Local): `dono@nocautefight.com.br` | Senha: `academia123`
  - Inclui: **Analytics Descomplicado**, **Editor Visual Completo (Split-Screen Live Preview)**, **Mini-CRM de Leads**, **Horários + Gerador de Stories `1080×1920`** e **Domínio Próprio**.
- **Painel Master (`/master/login` → `/master`)**: `http://localhost:3001/master/login`
  - E-mail (Modo Local): `admin@nocautehub.com.br` | Senha: `nocaute123`
  - Inclui: KPIs, criação de academias, **Duplicar Demo em 1 clique**, chave **Ativo/Suspenso** e **Editor Visual Split-Screen**.

## Como Conectar o Supabase (Última Etapa)

1. Crie um projeto gratuito no [Supabase](https://supabase.com).
2. Abra o **SQL Editor** e execute, nesta ordem:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_fase2_retencao.sql`
   - *(Opcional)* `supabase/seed.sql`
3. Em **Authentication → Users**, crie seu usuário Master.
4. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`.
5. Reinicie o servidor — o sistema alterna automaticamente do Modo Local para o Supabase.

## Webhook de Cobrança Recorrente (Asaas / Mercado Pago / Stripe)
- Endpoint: `POST /api/webhooks/billing`
- Defina `BILLING_WEBHOOK_SECRET` no ambiente e envie no header `x-webhook-secret` (ou `asaas-access-token`).
- Inadimplência suspende o tenant automaticamente; pagamento confirmado reativa automaticamente.
