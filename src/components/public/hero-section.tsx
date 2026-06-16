import { landingContent } from "@/lib/landing/static-content";

import { ButtonLink } from "@/components/ui/button-link";
import { SectionContainer } from "@/components/ui/section-container";

export function HeroSection() {
  const { hero } = landingContent;

  return (
    <SectionContainer id="top" className="relative min-h-screen overflow-hidden pt-32 text-white sm:pt-36 lg:flex lg:items-center">
      <div className="absolute left-1/2 top-28 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="inline-flex rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100">
            {landingContent.eyebrow}
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-7xl">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
            {hero.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#modulos">{hero.primaryAction}</ButtonLink>
            <ButtonLink href="#beneficios" variant="secondary">{hero.secondaryAction}</ButtonLink>
          </div>
          <p className="mt-5 text-sm text-slate-300">{hero.proof}</p>
        </div>

        <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-slate-950/40 backdrop-blur">
          <div className="rounded-[1.5rem] bg-slate-950/80 p-5 ring-1 ring-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-slate-400">Painel do operador</p>
                <p className="font-bold text-white">Caixa aberto</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-semibold text-emerald-200">Online</span>
            </div>
            <div className="mt-5 grid gap-3">
              {hero.metrics.map((metric) => (
                <div key={metric.value} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-2xl font-black text-emerald-300">{metric.value}</p>
                  <p className="mt-1 text-sm text-slate-300">{metric.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-emerald-400 p-4 text-slate-950">
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">Resumo visual</p>
              <p className="mt-2 text-3xl font-black">R$ 8.420,00</p>
              <p className="mt-1 text-sm font-medium">Exemplo estático de vendas do dia</p>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
