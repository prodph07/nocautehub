# Guia de Publicação — Supabase + Cloudflare Pages

Siga estes 4 passos quando estiver pronto para colocar o **Nocaute Hub** em produção.

---

## Passo 1 — Criar o Projeto no Supabase

1. Acesse https://supabase.com/dashboard e clique em **New Project**.
2. Escolha a região mais próxima (**South America — São Paulo** `sa-east-1`).
3. Abra o menu **SQL Editor** → **New query**.
4. Copie todo o conteúdo de `supabase/setup_completo.sql`, cole lá e clique em **Run**.
5. Vá em **Project Settings → API** e copie:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** (`SUPABASE_SERVICE_ROLE_KEY`)

---

## Passo 2 — Criar seu Usuário Master no Supabase Auth

1. No Supabase, vá em **Authentication → Users → Add user → Create new user**.
2. Cadastre seu e-mail e senha de administrador Master (marque *Auto Confirm User*).
3. Cole as 3 chaves do Passo 1 no arquivo `.env.local` do projeto e reinicie `npm run dev`.
4. Pronto! O sistema sai automaticamente do Modo Local e passa a gravar tudo no PostgreSQL + Storage do Supabase.

> **Para liberar login de um cliente (dono da academia) no Supabase:**
> Crie o usuário em **Authentication → Users**, copie o `User UID` dele e insira uma linha na tabela `tenant_users` vinculando `tenant_id` + `user_id` + `email`.

---

## Passo 3 — Publicar na Cloudflare Pages

1. Suba este repositório para o **GitHub** (o `.env.local` e `.local-data/` já estão no `.gitignore`).
2. No painel da **Cloudflare**, vá em **Workers & Pages → Create → Pages → Connect to Git**.
3. Configure o build:
   - **Framework preset**: `Next.js` (ou build com `@cloudflare/next-on-pages` / OpenNext Cloudflare)
   - **Compatibility Flags**: `nodejs_compat` (já configurado em `wrangler.toml`)
4. Em **Settings → Environment Variables**, adicione:
   - `NEXT_PUBLIC_ROOT_DOMAIN` = `nocautehub.com.br` *(seu domínio real)*
   - `NEXT_PUBLIC_PLATFORM_NAME` = `Nocaute Hub`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_CLOUDFLARE_CNAME_TARGET` = `cname.nocautehub.com.br`
   - *(Opcional)* `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, `BILLING_WEBHOOK_SECRET`

---

## Passo 4 — Subdomínios Wildcard e Domínios Próprios

1. **Subdomínios automáticos (`*.nocautehub.com.br`)**:
   - No DNS da Cloudflare do seu domínio principal, crie um registro `CNAME` com nome `*` apontando para o host do seu projeto Pages.
2. **Domínios próprios dos clientes (`academiaalfa.com.br`)**:
   - Ative **SSL/TLS → Custom Hostnames (Cloudflare for SaaS)** no seu domínio principal.
   - Defina o **Fallback Origin** como `cname.nocautehub.com.br`.
   - Com `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ZONE_ID` configurados, o módulo de **Domínio Próprio** dentro do Painel Master e do Painel do Cliente faz o cadastro, verificação de DNS e emissão de SSL em 1 clique!

