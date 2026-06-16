import { landingContent } from "@/lib/landing/static-content";

import { ButtonLink } from "@/components/ui/button-link";
import { SectionContainer } from "@/components/ui/section-container";

export function CtaSection() {
  const { cta } = landingContent;

  return (
    <SectionContainer id="contato" labelledBy="cta-title" className="pb-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-emerald-400 p-7 text-slate-950 shadow-2xl shadow-emerald-900/20 sm:p-10 lg:p-14">
        <div className="absolute -right-16 -top-16 size-48 rounded-full bg-white/25" aria-hidden="true" />
        <div className="relative max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.24em]">Próxima conversa</p>
          <h2 id="cta-title" className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{cta.title}</h2>
          <p className="mt-5 text-lg leading-8 text-slate-800">{cta.description}</p>
          <ButtonLink href="#modulos" variant="ghost" className="mt-8">{cta.action}</ButtonLink>
        </div>
      </div>
    </SectionContainer>
  );
}
