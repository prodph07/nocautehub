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
  X,
} from "lucide-react";
import { PLAN_COMPARISON_ROWS } from "@/lib/plans";
import { getPlatformSettings } from "@/lib/platform-settings";
import { TrackingScripts } from "@/components/site/TrackingScripts";

export const dynamic = "force-dynamic";

export default async function NocauteHubHomePage() {
  const platformSettings = await getPlatformSettings();
  const salesWa = (process.env.NEXT_PUBLIC_SALES_WHATSAPP || "").replace(
    /\D/g,
    ""
  );
  const waCommercialUrl = salesWa
    ? `https://wa.me/${salesWa}?text=${encodeURIComponent(
        "Olá! Quero conhecer o Nocaute Hub e ver uma demonstração para minha academia de luta."
      )}`
    : "/sites/ftm";

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-neutral-100 flex flex-col">
      <TrackingScripts
        pixelId={platformSettings.meta_pixel_id || null}
        gtmId={platformSettings.gtm_id || null}
        googleAdsId={platformSettings.google_ads_id || null}
      />
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
            <a href="#faq" className="hover:text-white transition">
              Dúvidas
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/sites/ftm"
              className="min-h-[40px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-semibold text-white transition inline-flex items-center"
            >
              Ver Demo
            </Link>
            <Link
              href="/master/login"
              className="min-h-[40px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs sm:text-sm font-semibold text-white transition inline-flex items-center"
            >
              Acessar Painel
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
                Chega de site lento que ninguém lê. O{" "}
                <strong className="text-white">Nocaute Hub</strong> entrega um
                site profissional em 11 seções de alta conversão, grade de
                horários interativa, mini-funil de WhatsApp e painel próprio
                para o dono da academia — no ar em minutos.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/sites/ftm"
                  className="btn-shimmer min-h-[52px] px-7 py-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.97] text-white font-bold text-sm sm:text-base uppercase tracking-wider transition inline-flex items-center justify-center gap-2 shadow-xl shadow-rose-600/25"
                >
                  <span>Ver Academia Demo ao Vivo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#planos"
                  className="min-h-[52px] px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-[0.97] text-white font-semibold text-sm sm:text-base transition inline-flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <span>Comparar Planos</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* RECURSOS */}
        <section
          id="recursos"
          className="py-16 sm:py-24 border-t border-white/5 bg-[#101012]"
        >
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
                  desc: "O visitante escolhe a modalidade e o turno em toques rápidos. O contato fica salvo e o WhatsApp abre com a mensagem pronta.",
                },
                {
                  icon: Palette,
                  title: "Editor Visual Ao Vivo",
                  desc: "Edite textos, fotos, cores e horários vendo o resultado em tempo real na tela dividida (Celular e Desktop).",
                },
                {
                  icon: BarChart3,
                  title: "Resultados Descomplicados",
                  desc: "Saiba quantas visitas, cliques no WhatsApp e matrículas o seu site gerou na semana sem gráficos confusos.",
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
                  desc: "Conecte seu domínio .com.br com HTTPS automático e velocidade extrema no 4G via rede Cloudflare.",
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
                  desc: "Aplicamos seu logotipo, cor principal, modalidades e horários em uma demonstração exclusiva para você aprovar.",
                },
                {
                  step: "02",
                  title: "Publicamos no Ar",
                  desc: "Ativamos seu subdomínio ou domínio próprio .com.br com SSL automático e otimização para buscas do seu bairro.",
                },
                {
                  step: "03",
                  title: "Alunos no WhatsApp",
                  desc: "Você acompanha visitas, pessoas interessadas e atualiza horários sozinho direto pelo Painel do Dono.",
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="glass-card rounded-2xl p-6 space-y-3"
                >
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

        {/* TABELA COMPARATIVA DE PLANOS (EXATA CONFORME ESPECIFICAÇÃO) */}
        <section
          id="planos"
          className="py-16 sm:py-24 border-t border-white/5 bg-[#101012]"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                Planos & Benefícios
              </span>
              <h2 className="font-display text-3xl sm:text-5xl uppercase text-white">
                Plano Essencial vs. Plano Pro
              </h2>
              <p className="text-sm text-neutral-400">
                Compare exatamente o que está incluso em cada plano e escolha o
                melhor momento da sua academia.
              </p>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03]">
                      <th className="p-4 sm:p-5 text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-300">
                        Benefício
                      </th>
                      <th className="p-4 sm:p-5 text-center text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-200 w-44 sm:w-56">
                        <span className="block">Plano Essencial</span>
                        <span className="block text-lg sm:text-xl font-display text-white mt-1">
                          R$ 47<span className="text-[11px] font-sans font-normal text-neutral-400">/mês</span>
                        </span>
                        <span className="block text-[10px] font-semibold normal-case tracking-normal text-emerald-400">
                          15 dias grátis para testar
                        </span>
                      </th>
                      <th className="p-4 sm:p-5 text-center text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-rose-600/15 border-l border-rose-500/25 w-48 sm:w-64">
                        <span className="inline-flex items-center gap-1.5 text-rose-400 block text-[10px] mb-1">
                          <Sparkles className="w-3 h-3" />
                          RECOMENDADO
                        </span>
                        <span className="block">Plano Pro</span>
                        <span className="block text-lg sm:text-xl font-display text-white mt-1">
                          R$ 97<span className="text-[11px] font-sans font-normal text-rose-200">/mês</span>
                        </span>
                        <span className="block text-[10px] font-semibold normal-case tracking-normal text-emerald-300">
                          15 dias grátis para testar
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                    {PLAN_COMPARISON_ROWS.map((row) => (
                      <tr
                        key={row.feature}
                        className="hover:bg-white/[0.02] transition"
                      >
                        <td className="p-4 sm:px-5 text-neutral-200 font-medium leading-snug">
                          {row.feature}
                        </td>
                        <td className="p-4 text-center">
                          {typeof row.essencial === "boolean" ? (
                            row.essencial ? (
                              <span className="inline-flex w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 items-center justify-center">
                                <Check className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="inline-flex w-7 h-7 rounded-full bg-white/5 text-neutral-600 items-center justify-center">
                                <X className="w-4 h-4" />
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-neutral-300">
                              {row.essencial}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center bg-rose-600/[0.06] border-l border-rose-500/15">
                          {typeof row.pro === "boolean" ? (
                            row.pro ? (
                              <span className="inline-flex w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 items-center justify-center">
                                <Check className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="inline-flex w-7 h-7 rounded-full bg-white/5 text-neutral-600 items-center justify-center">
                                <X className="w-4 h-4" />
                              </span>
                            )
                          ) : (
                            <span className="text-xs font-semibold text-white">
                              {row.pro}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-5 sm:p-6 border-t border-white/10 bg-black/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs sm:text-sm text-neutral-300">
                  Quer ver como ficaria o site da{" "}
                  <strong className="text-white">sua academia</strong> antes de
                  fechar? Montamos uma demonstração gratuita.
                </p>
                <a
                  href={waCommercialUrl}
                  target={salesWa ? "_blank" : undefined}
                  rel={salesWa ? "noreferrer" : undefined}
                  className="btn-shimmer shrink-0 w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.97] text-white font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Solicitar Demo Gratuita</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ COMERCIAL */}
        <section id="faq" className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                Dúvidas Frequentes
              </span>
              <h2 className="font-display text-3xl sm:text-5xl uppercase text-white mt-2">
                Perguntas de donos de academia
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  q: "Preciso entender de tecnologia para atualizar meus horários?",
                  a: "Não! Quem sabe usar WhatsApp e Instagram consegue alterar horários, avisos, textos e fotos sozinho pelo Painel do Dono em segundos.",
                },
                {
                  q: "Em quanto tempo o site da minha academia fica no ar?",
                  a: "Em poucos minutos montamos a demonstração com a identidade da sua academia e, após sua aprovação, publicamos no mesmo dia.",
                },
                {
                  q: "Já tenho um domínio .com.br, posso usar?",
                  a: "Sim! No Plano Pro você conecta seu domínio próprio (Registro.br, Hostinger, GoDaddy) em 3 passos com cadeado SSL automático.",
                },
                {
                  q: "Posso começar no Essencial e subir para o Pro depois?",
                  a: "Com certeza! A mudança de plano é instantânea, liberando Mini-Funil, Link na Bio, Stories e Painel de Resultados na hora.",
                },
              ].map((item) => (
                <div
                  key={item.q}
                  className="glass-card rounded-2xl p-5 space-y-2"
                >
                  <h3 className="font-semibold text-sm sm:text-base text-white">
                    {item.q}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>
            © {new Date().getFullYear()} Nocaute Hub • Plataforma Multi-Tenant
            para Academias de Artes Marciais
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/sites/ftm/links"
              className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Demo Link na Bio</span>
            </Link>
            <Link
              href="/master/login"
              className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acesso Administrativo</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
