import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Flame,
  Globe,
  Instagram,
  Link2,
  MessageCircle,
  Palette,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";

export default function NocauteHubHomePage() {
  return (
    <div className="min-h-screen bg-[#0C0C0C] text-neutral-100 flex flex-col">
      {/* Header Institucional */}
      <header className="border-b border-white/10 bg-[#0C0C0C]/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center font-display font-bold text-lg text-white shadow-lg shadow-rose-600/25">
              NH
            </div>
            <div>
              <span className="font-display text-xl uppercase tracking-wider text-white block leading-none">
                Nocaute Hub
              </span>
              <span className="text-[11px] text-neutral-400">
                Sites para Academias de Luta
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
            <a href="#recursos" className="hover:text-white transition">
              Recursos
            </a>
            <a href="#como-funciona" className="hover:text-white transition">
              Como Funciona
            </a>
            <a href="#planos" className="hover:text-white transition">
              Planos
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/sites/nocaute-fight-club"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-semibold text-white transition"
            >
              Ver Demo
            </Link>
            <Link
              href="/master/login"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs sm:text-sm font-semibold text-white transition"
            >
              Acesso Master
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO COMERCIAL */}
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.20),transparent_48%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-widest text-rose-400">
                <Flame className="w-3.5 h-3.5" />
                <span>Feito 100% para Jiu-Jitsu, Muay Thai, Boxe e MMA</span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-white leading-[0.98]">
                Transforme visitantes do Instagram em{" "}
                <span className="text-rose-500">alunos no seu tatame</span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl">
                Chega de site lento que ninguém lê. O <strong className="text-white">Nocaute Hub</strong> entrega um site profissional em 11 seções de alta conversão, grade de horários interativa, mini-funil de WhatsApp e painel próprio para sua academia — no ar em minutos.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/sites/nocaute-fight-club"
                  className="btn-shimmer px-7 py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm sm:text-base uppercase tracking-wider transition inline-flex items-center justify-center gap-2 shadow-xl shadow-rose-600/25"
                >
                  <span>Explorar Academia Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/sites/nocaute-fight-club/links"
                  className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm sm:text-base transition inline-flex items-center justify-center gap-2"
                >
                  <Link2 className="w-4 h-4 text-rose-400" />
                  <span>Ver Link na Bio</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* RECURSOS */}
        <section id="recursos" className="py-16 sm:py-24 border-t border-white/5 bg-[#101012]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                Engenharia de Conversão
              </span>
              <h2 className="font-display text-3xl sm:text-5xl uppercase text-white mt-2">
                Tudo que sua academia precisa para lotar turmas
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: MessageCircle,
                  title: "Mini-Funil WhatsApp",
                  desc: "O visitante escolhe a modalidade e o melhor turno em 2 cliques. O lead é salvo no CRM e o WhatsApp abre com a mensagem pronta.",
                },
                {
                  icon: Palette,
                  title: "Editor Visual Ao Vivo",
                  desc: "Edite textos, fotos, cores e horários vendo o resultado em tempo real na tela dividida (Celular e Desktop).",
                },
                {
                  icon: BarChart3,
                  title: "Analytics & Mini-CRM",
                  desc: "Saiba exatamente quantas visitas, cliques no WhatsApp e matrículas o seu site gerou na semana.",
                },
                {
                  icon: Instagram,
                  title: "Grade para Stories (1080×1920)",
                  desc: "Gere em 1 clique uma arte vertical da sua grade de horários pronta para postar nos Stories do Instagram.",
                },
                {
                  icon: Smartphone,
                  title: "Link na Bio Nativo (/links)",
                  desc: "Substitua agregadores genéricos por uma página dark com a identidade da sua academia e rastreamento real.",
                },
                {
                  icon: Globe,
                  title: "Domínio Próprio + SSL",
                  desc: "Use seu domínio próprio (ex: suaacademia.com.br) com HTTPS automático e velocidade global na rede Cloudflare.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="glass-card rounded-2xl p-6 space-y-3 hover:border-rose-500/40 transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-600/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-xl uppercase text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                Sem Burocracia
              </span>
              <h2 className="font-display text-3xl sm:text-5xl uppercase text-white mt-2">
                Sua academia no ar em 3 passos simples
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  title: "Montamos sua Demo",
                  desc: "Aplicamos seu logotipo, cor primária, modalidades e horários em uma URL de demonstração exclusiva.",
                },
                {
                  step: "02",
                  title: "Conectamos seu Domínio",
                  desc: "Ativamos seu domínio próprio ou subdomínio com certificado SSL automático e Meta Pixel configurado.",
                },
                {
                  step: "03",
                  title: "Alunos no WhatsApp",
                  desc: "Você acompanha visitas, leads e edita horários com total autonomia direto pelo Painel do Cliente.",
                },
              ].map((s) => (
                <div key={s.step} className="glass-card rounded-2xl p-6 space-y-3">
                  <span className="font-display text-4xl font-bold text-rose-500/70">
                    {s.step}
                  </span>
                  <h3 className="font-display text-2xl uppercase text-white">
                    {s.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLANOS */}
        <section id="planos" className="py-16 sm:py-24 border-t border-white/5 bg-[#101012]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                Planos
              </span>
              <h2 className="font-display text-3xl sm:text-5xl uppercase text-white mt-2">
                Escolha o plano ideal para sua academia
              </h2>
              <p className="text-sm text-neutral-400 mt-2">
                Sem taxa de desenvolvimento artesanal. Estrutura profissional sempre atualizada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plano Essencial */}
              <div className="glass-card rounded-3xl p-7 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                    Plano Essencial
                  </span>
                  <h3 className="font-display text-3xl uppercase text-white">
                    Presença Profissional
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Para academias que querem sair do amadorismo e ter um site rápido focado em WhatsApp.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-sm text-neutral-300">
                    {[
                      "Site completo em 11 seções Dark Mode",
                      "Botão de WhatsApp com mensagem contextual",
                      "Subdomínio grátis ou Domínio Próprio com SSL",
                      "Otimização automática de fotos (.webp)",
                      "SEO Local (Schema.org ExerciseGym)",
                    ].map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/sites/nocaute-fight-club"
                  className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm uppercase tracking-wider text-center transition"
                >
                  Ver Demonstração
                </Link>
              </div>

              {/* Plano Pro */}
              <div className="rounded-3xl p-7 sm:p-8 bg-gradient-to-br from-rose-600/20 via-[#141416] to-[#0C0C0C] border border-rose-500/40 flex flex-col justify-between gap-6 relative">
                <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-600 text-white inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Mais escolhido
                </span>

                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
                    Plano Pro
                  </span>
                  <h3 className="font-display text-3xl uppercase text-white">
                    Máquina de Matrículas
                  </h3>
                  <p className="text-sm text-neutral-300">
                    Tudo do Essencial + automação completa de conversão, autonomia e prova de ROI.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-sm text-neutral-200">
                    {[
                      "Grade de Horários Interativa com filtros",
                      "Mini-Funil de WhatsApp (2 etapas) + Mini-CRM",
                      "Painel do Cliente com Editor Visual Ao Vivo",
                      "Analytics Semanal (Visitas, Cliques e Conversão)",
                      "Link na Bio Nativo (/links) + Stories 1080×1920",
                      "Meta Pixel + Google Tag Manager + Presets de Hero",
                    ].map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Zap className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/sites/nocaute-fight-club"
                  className="btn-shimmer w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm uppercase tracking-wider text-center transition shadow-xl shadow-rose-600/25"
                >
                  Explorar Site Demo Pro
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>
            © {new Date().getFullYear()} Nocaute Hub • Plataforma Multi-Tenant para Academias de Artes Marciais
          </p>
          <Link
            href="/master/login"
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Acesso Administrativo</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
