import type {
  TenantWithRelations,
  Lead,
  Modality,
  ScheduleItem,
  Instructor,
  Testimonial,
} from "@/types/tenant";

export const DEFAULT_DEMO_TENANT_ID = "11111111-1111-4111-8111-111111111111";

export function createDemoSeedData(): {
  tenants: TenantWithRelations[];
  leads: Lead[];
} {
  const now = new Date().toISOString();
  const tenantId = DEFAULT_DEMO_TENANT_ID;

  const modBjjId = "22222222-2222-4222-8222-222222222201";
  const modMuayId = "22222222-2222-4222-8222-222222222202";
  const modBoxeId = "22222222-2222-4222-8222-222222222203";
  const modKidsId = "22222222-2222-4222-8222-222222222204";
  const modFemId = "22222222-2222-4222-8222-222222222205";
  const modNoGiId = "22222222-2222-4222-8222-222222222206";

  const modalities: Modality[] = [
    {
      id: modBjjId,
      tenant_id: tenantId,
      name: "Jiu-Jitsu",
      short_desc:
        "Defesa pessoal real, raciocínio estratégico e condicionamento completo em um ambiente seguro para iniciantes.",
      image_url:
        "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=900&q=80",
      target_audience: "Iniciante ao Avançado",
      display_order: 1,
    },
    {
      id: modMuayId,
      tenant_id: tenantId,
      name: "Muay Thai",
      short_desc:
        "Queime até 800 calorias por aula enquanto alivia o estresse e domina chutes, joelhadas e combinações de punho.",
      image_url:
        "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=900&q=80",
      target_audience: "Fitness & Combate",
      display_order: 2,
    },
    {
      id: modBoxeId,
      tenant_id: tenantId,
      name: "Boxe",
      short_desc:
        "Agilidade, coordenação motora e explosão cardiovascular com técnica limpa de esquivas e movimentação.",
      image_url:
        "https://images.unsplash.com/photo-1517438322307-e67111335449?auto=format&fit=crop&w=900&q=80",
      target_audience: "Iniciante & Fitness",
      display_order: 3,
    },
    {
      id: modKidsId,
      tenant_id: tenantId,
      name: "Jiu-Jitsu Kids",
      short_desc:
        "Disciplina, autoconfiança, respeito e coordenação motora para crianças de 5 a 13 anos sem violência.",
      image_url:
        "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80",
      target_audience: "Kids (5 a 13 anos)",
      display_order: 4,
    },
    {
      id: modFemId,
      tenant_id: tenantId,
      name: "Muay Thai Feminino",
      short_desc:
        "Turma exclusiva para mulheres com foco em defesa pessoal, tonificação muscular e evolução no seu ritmo.",
      image_url:
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
      target_audience: "Exclusivo Feminino",
      display_order: 5,
    },
    {
      id: modNoGiId,
      tenant_id: tenantId,
      name: "No-Gi / Submission",
      short_desc:
        "Luta agarrada sem kimono em ritmo dinâmico, ideal para quem busca velocidade, quedas e transição para MMA.",
      image_url:
        "https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?auto=format&fit=crop&w=900&q=80",
      target_audience: "Intermediário & Pro",
      display_order: 6,
    },
  ];

  const schedules: ScheduleItem[] = [
    { id: "33333333-3333-4333-8333-333333333301", tenant_id: tenantId, modality_id: modMuayId, day_of_week: "seg", start_time: "07:00", end_time: "08:00", instructor_name: "Prof. Rafael Silva", level: "Todos os níveis" },
    { id: "33333333-3333-4333-8333-333333333302", tenant_id: tenantId, modality_id: modBjjId, day_of_week: "seg", start_time: "12:00", end_time: "13:00", instructor_name: "Mestre Carlos Eduardo", level: "Iniciante & Fundamentos" },
    { id: "33333333-3333-4333-8333-333333333303", tenant_id: tenantId, modality_id: modKidsId, day_of_week: "seg", start_time: "17:30", end_time: "18:30", instructor_name: "Profª Amanda Costa", level: "Kids (5-13 anos)" },
    { id: "33333333-3333-4333-8333-333333333304", tenant_id: tenantId, modality_id: modMuayId, day_of_week: "seg", start_time: "19:00", end_time: "20:00", instructor_name: "Prof. Rafael Silva", level: "Todos os níveis" },
    { id: "33333333-3333-4333-8333-333333333305", tenant_id: tenantId, modality_id: modBjjId, day_of_week: "seg", start_time: "20:00", end_time: "21:30", instructor_name: "Mestre Carlos Eduardo", level: "Todos os níveis" },

    { id: "33333333-3333-4333-8333-333333333306", tenant_id: tenantId, modality_id: modBoxeId, day_of_week: "ter", start_time: "07:00", end_time: "08:00", instructor_name: "Prof. Bruno Rocha", level: "Todos os níveis" },
    { id: "33333333-3333-4333-8333-333333333307", tenant_id: tenantId, modality_id: modFemId, day_of_week: "ter", start_time: "18:30", end_time: "19:30", instructor_name: "Profª Amanda Costa", level: "Feminino" },
    { id: "33333333-3333-4333-8333-333333333308", tenant_id: tenantId, modality_id: modNoGiId, day_of_week: "ter", start_time: "19:30", end_time: "20:45", instructor_name: "Mestre Carlos Eduardo", level: "Intermediário / Pro" },

    { id: "33333333-3333-4333-8333-333333333309", tenant_id: tenantId, modality_id: modMuayId, day_of_week: "qua", start_time: "07:00", end_time: "08:00", instructor_name: "Prof. Rafael Silva", level: "Todos os níveis" },
    { id: "33333333-3333-4333-8333-333333333310", tenant_id: tenantId, modality_id: modKidsId, day_of_week: "qua", start_time: "17:30", end_time: "18:30", instructor_name: "Profª Amanda Costa", level: "Kids (5-13 anos)" },
    { id: "33333333-3333-4333-8333-333333333311", tenant_id: tenantId, modality_id: modBjjId, day_of_week: "qua", start_time: "19:30", end_time: "21:00", instructor_name: "Mestre Carlos Eduardo", level: "Todos os níveis" },

    { id: "33333333-3333-4333-8333-333333333312", tenant_id: tenantId, modality_id: modBoxeId, day_of_week: "qui", start_time: "07:00", end_time: "08:00", instructor_name: "Prof. Bruno Rocha", level: "Todos os níveis" },
    { id: "33333333-3333-4333-8333-333333333313", tenant_id: tenantId, modality_id: modFemId, day_of_week: "qui", start_time: "18:30", end_time: "19:30", instructor_name: "Profª Amanda Costa", level: "Feminino" },
    { id: "33333333-3333-4333-8333-333333333314", tenant_id: tenantId, modality_id: modMuayId, day_of_week: "qui", start_time: "19:30", end_time: "20:30", instructor_name: "Prof. Rafael Silva", level: "Todos os níveis" },

    { id: "33333333-3333-4333-8333-333333333315", tenant_id: tenantId, modality_id: modBjjId, day_of_week: "sex", start_time: "12:00", end_time: "13:00", instructor_name: "Mestre Carlos Eduardo", level: "Iniciante" },
    { id: "33333333-3333-4333-8333-333333333316", tenant_id: tenantId, modality_id: modBoxeId, day_of_week: "sex", start_time: "19:00", end_time: "20:00", instructor_name: "Prof. Bruno Rocha", level: "Todos os níveis" },
    { id: "33333333-3333-4333-8333-333333333317", tenant_id: tenantId, modality_id: modNoGiId, day_of_week: "sex", start_time: "20:00", end_time: "21:30", instructor_name: "Mestre Carlos Eduardo", level: "Open Mat / Sparring" },

    { id: "33333333-3333-4333-8333-333333333318", tenant_id: tenantId, modality_id: modBjjId, day_of_week: "sab", start_time: "10:00", end_time: "11:30", instructor_name: "Mestre Carlos Eduardo", level: "Treinão Geral" },
    { id: "33333333-3333-4333-8333-333333333319", tenant_id: tenantId, modality_id: modMuayId, day_of_week: "sab", start_time: "11:30", end_time: "12:30", instructor_name: "Prof. Rafael Silva", level: "Todos os níveis" },
  ];

  const instructors: Instructor[] = [
    {
      id: "44444444-4444-4444-8444-444444444401",
      tenant_id: tenantId,
      name: "Mestre Carlos Eduardo",
      rank: "Faixa Preta 4º Grau • Jiu-Jitsu",
      lineage: "Linhagem Carlson Gracie • Filiado CBJJ / IBJJF",
      experience_years: 18,
      bio: "Formou mais de 40 faixas-pretas e dedica sua metodologia a acolher quem nunca pisou em um tatame, unindo técnica afiada, respeito e zero ego.",
      photo_url:
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=700&q=80",
      display_order: 1,
    },
    {
      id: "44444444-4444-4444-8444-444444444402",
      tenant_id: tenantId,
      name: "Prof. Rafael Silva",
      rank: "Kruang Preto • Muay Thai",
      lineage: "Formação Tailândia • Confederação Brasileira de Muay Thai",
      experience_years: 12,
      bio: "Ex-atleta profissional com mais de 30 lutas. Conhecido pelas aulas intensas, didáticas e adaptadas para o condicionamento de cada aluno.",
      photo_url:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=80",
      display_order: 2,
    },
    {
      id: "44444444-4444-4444-8444-444444444403",
      tenant_id: tenantId,
      name: "Profª Amanda Costa",
      rank: "Faixa Marrom BJJ & Kruang Azul MT",
      lineage: "Especialista em Turmas Kids & Feminino",
      experience_years: 9,
      bio: "Educadora física focada em construir confiança desde o primeiro treino. Lidera as turmas infantis e o Muay Thai exclusivo para mulheres.",
      photo_url:
        "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=700&q=80",
      display_order: 3,
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: "55555555-5555-4555-8555-555555555501",
      tenant_id: tenantId,
      author_name: "Lucas Mendes",
      role_or_modality: "Aluno de Jiu-Jitsu há 1 ano",
      rating: 5,
      text: "Cheguei completamente sedentário e com medo de me machucar. Os professores têm uma paciência absurda com iniciantes. Já perdi 11kg e virou minha terapia diária.",
      avatar_url: "",
      source: "Google",
    },
    {
      id: "55555555-5555-4555-8555-555555555502",
      tenant_id: tenantId,
      author_name: "Mariana Oliveira",
      role_or_modality: "Muay Thai Feminino",
      rating: 5,
      text: "Ambiente super limpo, tatame higienizado todo dia e vestiário impecável. A turma feminina me deixou 100% à vontade desde a aula experimental gratuita.",
      avatar_url: "",
      source: "Google",
    },
    {
      id: "55555555-5555-4555-8555-555555555503",
      tenant_id: tenantId,
      author_name: "Roberto & Pedro (pai de aluno)",
      role_or_modality: "Turma Kids",
      rating: 5,
      text: "Meu filho de 8 anos era muito tímido na escola. Em 4 meses de Jiu-Jitsu Kids a postura, foco e disciplina dele mudaram completamente. Recomendo de olhos fechados.",
      avatar_url: "",
      source: "Google",
    },
  ];

  const demoTenant: TenantWithRelations = {
    id: tenantId,
    slug: "nocaute-fight-club",
    custom_domain: null,
    domain_status: "pending",
    cloudflare_hostname_id: null,
    status: "active",
    plan_tier: "pro",
    name: "Nocaute Fight Club",
    logo_url: null,
    whatsapp_number: "5511999999999",
    address: "Av. Paulista, 1480 — Sobreloja",
    neighborhood: "Bela Vista",
    city: "São Paulo - SP",
    reference_point: "A 150m do Metrô Trianon-MASP, ao lado do estacionamento conveniado",
    google_maps_embed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975870299253!2d-46.6564943!3d-23.5613496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr",
    opening_hours: "Seg a Sex: 06h30 às 22h • Sábado: 09h às 13h",
    pixel_id: null,
    gtm_id: null,
    top_bar_config: {
      enabled: true,
      text: "Vagas abertas para novas turmas de Iniciantes este mês — 1ª aula 100% gratuita!",
      cta_text: "Garantir vaga",
      cta_link: "#agendar",
    },
    theme_config: {
      primary: "#E11D48",
      secondary: "#F59E0B",
      bg: "#0C0C0C",
      surface: "#141414",
      font_preset: "condensada",
      hero_preset: "full",
    },
    feature_flags: {
      interactive_schedule: true,
      mini_funnel: true,
      pixel_enabled: true,
      custom_domain: true,
    },
    hero_config: {
      eyebrow: "Bela Vista • São Paulo",
      headline: "TRANSFORME SEU CORPO E SUA MENTE NO TATAME",
      subheadline:
        "Jiu-Jitsu, Muay Thai e Boxe em Bela Vista com metodologia segura para iniciantes do zero, turmas Kids e estrutura climatizada.",
      cta_text: "Agendar Aula Experimental Gratuita",
      objection_breaker:
        "Não precisa ter equipamento • Emprestamos luvas/kimono na 1ª aula",
      media_type: "image",
      media_url:
        "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1800&q=85",
      marquee_items: [
        "JIU-JITSU",
        "MUAY THAI",
        "BOXE",
        "DISCIPLINA",
        "DEFESA PESSOAL",
        "TURMA KIDS",
        "CONDICIONAMENTO",
      ],
    },
    authority_stats: [
      { value: 850, suffix: "+", label: "Alunos Formados" },
      { value: 14, suffix: " Anos", label: "De Tradição no Tatame" },
      { value: 4.9, suffix: "★", label: "Nota no Google (210+ avaliações)", decimals: 1 },
      { value: 100, suffix: "%", label: "Filiada CBJJ & CBMT" },
    ],
    target_audience: [
      {
        id: "iniciantes",
        badge: "ZERO EXPERIÊNCIA",
        title: "Iniciantes do Zero",
        description:
          "Nunca lutou antes ou está parado há anos? Você aprende os fundamentos passo a passo, sem pressão e sem risco de lesão.",
        icon: "shield",
      },
      {
        id: "fitness",
        badge: "ALTO GASTO CALÓRICO",
        title: "Treino Fitness & Condicionamento",
        description:
          "Troque a esteira monótona por treinos dinâmicos que derretem estresse, definem o corpo e aumentam sua disposição.",
        icon: "flame",
      },
      {
        id: "kids",
        badge: "5 A 13 ANOS",
        title: "Turma Kids",
        description:
          "Aulas lúdicas e estruturadas que desenvolvem foco, respeito, disciplina e autoconfiança longe das telas.",
        icon: "baby",
      },
      {
        id: "atletas",
        badge: "ALTA PERFORMANCE",
        title: "Atletas & Competição",
        description:
          "Treinos técnicos de sparring, preparação física específica e acompanhamento de mestres experientes em campeonatos.",
        icon: "trophy",
      },
    ],
    gallery_images: [
      {
        url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80",
        caption: "Tatame olímpico de 180m² higienizado entre todos os turnos",
        category: "Tatame",
      },
      {
        url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80",
        caption: "Área de sacos profissionais e preparação funcional",
        category: "Striking",
      },
      {
        url: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=80",
        caption: "Ambiente 100% climatizado com renovação de ar",
        category: "Estrutura",
      },
      {
        url: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=80",
        caption: "Vestiários individuais com chuveiro quente e área de espera para pais",
        category: "Conforto",
      },
    ],
    amenities: [
      { icon: "car", label: "Estacionamento Conveniado" },
      { icon: "bus", label: "150m do Metrô" },
      { icon: "wind", label: "100% Climatizada" },
      { icon: "shower", label: "Vestiários com Chuveiro" },
      { icon: "droplets", label: "Bebedouro Gelado" },
      { icon: "baby", label: "Área de Espera para Pais" },
    ],
    faqs: [
      {
        question: "Preciso comprar kimono ou luvas antes da primeira aula?",
        answer:
          "Não! Para a sua aula experimental gratuita você só precisa vir com uma roupa confortável de treino (camiseta e bermuda/legging). Nós emprestamos luvas de boxe/muay thai ou kimono higienizados sem nenhum custo.",
      },
      {
        question: "Nunca fiz luta e estou fora de forma. Posso começar mesmo assim?",
        answer:
          "Com certeza! Mais de 80% dos nossos alunos começaram exatamente do zero. Você não precisa estar em forma para começar a treinar — você entra em forma treinando, sempre respeitando o seu ritmo.",
      },
      {
        question: "A aula experimental realmente é gratuita? Tenho compromisso de matrícula?",
        answer:
          "Sim, a primeira aula é 100% gratuita e sem compromisso. Queremos que você conheça os professores, sinta a energia do tatame e veja nossa estrutura antes de decidir.",
      },
      {
        question: "Qual a idade mínima para treinar na academia?",
        answer:
          "Temos turmas Kids a partir de 5 anos de idade (separadas por faixa etária) e turmas jovens/adultos sem limite máximo de idade — temos alunos de 15 a 62 anos treinando todos os dias.",
      },
      {
        question: "Tem risco de sair machucado na aula?",
        answer:
          "Nossa prioridade absoluta é a segurança. Iniciantes treinam técnica e condicionamento com controle total e supervisão direta do professor — não há sparring pesado para quem está começando.",
      },
    ],
    social_links: {
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
      youtube: "https://youtube.com",
    },
    admin_email: "dono@nocautefight.com.br",
    admin_password: "academia123",
    created_at: now,
    updated_at: now,
    modalities,
    schedules,
    instructors,
    testimonials,
  };

  const sampleLeads: Lead[] = [
    {
      id: "66666666-6666-4666-8666-666666666601",
      tenant_id: tenantId,
      name: "Gabriel Ferreira",
      phone: "11988887777",
      chosen_modality: "Muay Thai",
      preferred_shift: "Noite",
      status: "novo",
      utm_source: "instagram",
      utm_medium: "stories",
      utm_campaign: "aula-experimental",
      created_at: now,
    },
    {
      id: "66666666-6666-4666-8666-666666666602",
      tenant_id: tenantId,
      name: "Camila Souza",
      phone: "11977776666",
      chosen_modality: "Muay Thai Feminino",
      preferred_shift: "Tarde",
      status: "agendado",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "bela-vista",
      created_at: now,
    },
  ];

  return {
    tenants: [demoTenant],
    leads: sampleLeads,
  };
}

