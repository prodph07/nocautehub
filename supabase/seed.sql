-- ============================================================================
-- Nocaute Hub - Seed Opcional (Academia Demo Completa)
-- Execute após rodar supabase/migrations/001_initial_schema.sql
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

