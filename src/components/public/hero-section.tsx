import Image from "next/image";

import { ButtonLink } from "@/components/ui/button-link";
import { SectionContainer } from "@/components/ui/section-container";
import type { PublicLandingContent } from "@/lib/landing/content";

type HeroSectionProps = Readonly<{
  content: PublicLandingContent;
}>;

export function HeroSection({ content }: HeroSectionProps) {
  const { hero } = content;
  const gridClassName = content.logoPath
    ? "grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]"
    : "grid w-full items-center";

  return (
    <SectionContainer id="top" className="relative min-h-screen overflow-hidden pt-32 text-white sm:pt-36 lg:flex lg:items-center">
      <div className="absolute left-1/2 top-28 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--brand-glow)] blur-3xl" />
      <div className={gridClassName}>
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
        </div>

        {content.logoPath ? (
          <div className="relative mx-auto aspect-square w-full max-w-xl drop-shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
            <Image
              src={content.logoPath}
              alt={`Logo ${content.company}`}
              fill
              sizes="(min-width: 1024px) 36rem, 90vw"
              className="object-contain"
              priority
            />
          </div>
        ) : null}
      </div>
    </SectionContainer>
  );
}
