import Link from "next/link";
import {
  ArrowRight,
  Flame,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Zap,
  Globe,
} from "lucide-react";

export default function NocauteHubHomePage() {
  return (
    <div className="min-h-screen bg-[#0C0C0C] text-neutral-100 flex flex-col">
      {/* Header Institucional */}
      <header className="border-b border-white/10 bg-[#0C0C0C]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center font-display font-bold text-lg text-white">
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

          <div className="flex items-center gap-3">
            <Link
              href="/sites/nocaute-fight-club"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-semibold text-white transition"
            >
              Ver Site Demo
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

      {/* Hero Institucional Simples */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.18),transparent_45%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-widest text-rose-400">
                <Flame className="w-3.5 h-3.5" />
                <span>Plataforma SaaS Multi-Tenant</span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-white leading-[0.98]">
                Sites de alta conversão feitos sob medida para{" "}
                <span className="text-rose-500">academias de luta</span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl">
                Coloque sua academia de Jiu-Jitsu, Muay Thai, Boxe ou MMA no ar em minutos com visual de alto impacto, grade de horários interativa e mini-funil nativo para agendamentos no WhatsApp.
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
                  href="/master/login"
                  className="px-7 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm sm:text-base transition inline-flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>Entrar no Painel Master</span>
                </Link>
              </div>
            </div>

            {/* 4 Pilares */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
              {[
                {
                  icon: MessageCircle,
                  title: "Mini-Funil WhatsApp",
                  desc: "Pré-qualifica modalidade e turno em 2 cliques, salva o lead e já abre o WhatsApp pronto.",
                },
                {
                  icon: Smartphone,
                  title: "Mobile-First 4G",
                  desc: "Projetado para o tráfego do Instagram e anúncios locais com carregamento ultrarrápido.",
                },
                {
                  icon: Globe,
                  title: "Domínio Próprio",
                  desc: "Arquitetura multi-tenant preparada para subdomínios e domínios próprios via Cloudflare.",
                },
                {
                  icon: Zap,
                  title: "Demo em 2 Minutos",
                  desc: "Duplique uma academia modelo com logo e cores do prospect para fechar vendas na hora.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="glass-card rounded-2xl p-5 space-y-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-600/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-lg uppercase text-white">
                      {item.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-6 px-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Nocaute Hub • Plataforma Multi-Tenant para Academias de Artes Marciais
      </footer>
    </div>
  );
}
