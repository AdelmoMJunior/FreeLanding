import Image from "next/image";

import { ButtonLink } from "@/components/ui/button-link";
import { SectionContainer } from "@/components/ui/section-container";
import type { PublicLandingContent } from "@/lib/landing/content";

type HeroSectionProps = Readonly<{
  content: PublicLandingContent;
}>;

export function HeroSection({ content }: HeroSectionProps) {
  const { hero } = content;

  return (
    <SectionContainer id="top" className="relative min-h-screen overflow-hidden pt-32 text-white sm:pt-36 lg:flex lg:items-center">
      <div className="absolute left-1/2 top-28 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--brand-glow)] blur-3xl" />
      <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          {content.eyebrow ? (
            <p className="inline-flex rounded-full border border-[var(--brand-muted)] bg-[var(--brand-soft)] px-4 py-2 text-sm font-semibold text-white">
              {content.eyebrow}
            </p>
          ) : null}
          <h1 className={`${content.eyebrow ? "mt-6" : ""} max-w-4xl text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-7xl`}>
            {hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
            {hero.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={hero.primaryAction.href}>{hero.primaryAction.label}</ButtonLink>
            <ButtonLink href={hero.secondaryAction.href} variant="secondary">{hero.secondaryAction.label}</ButtonLink>
          </div>
          <p className="mt-5 text-sm text-slate-300">{hero.proof}</p>
        </div>

        <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-slate-950/40 backdrop-blur">
          <div className="rounded-[1.5rem] bg-slate-950/80 p-5 ring-1 ring-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-slate-400">Conheça {content.company}</p>
                <p className="font-bold text-white">Informações essenciais</p>
              </div>
              <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-sm font-semibold text-white">Disponível</span>
            </div>
            {content.logoPath ? (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Marca</p>
                <div className="relative mt-4 flex min-h-44 items-center justify-center overflow-hidden rounded-2xl bg-white p-6">
                  <Image
                    src={content.logoPath}
                    alt={`Logo ${content.company}`}
                    fill
                    sizes="(min-width: 1024px) 28rem, 80vw"
                    className="object-contain p-6"
                    priority
                  />
                </div>
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {hero.metrics.map((metric) => (
                  <div key={metric.value} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <p className="text-2xl font-black text-[var(--brand-accent-on-dark)]">{metric.value}</p>
                    <p className="mt-1 text-sm text-slate-300">{metric.label}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 rounded-2xl bg-[var(--brand-color)] p-4 text-[var(--brand-contrast)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">Próximo passo</p>
              <p className="mt-2 text-3xl font-black">Fale com a equipe</p>
              <p className="mt-1 text-sm font-medium">Envie uma mensagem para receber orientação e seguir com segurança.</p>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
