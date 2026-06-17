import { ButtonLink } from "@/components/ui/button-link";
import { LeadForm } from "@/components/public/lead-form";
import { SectionContainer } from "@/components/ui/section-container";
import type { PublicLandingContent } from "@/lib/landing/content";

type CtaSectionProps = Readonly<{
  content: PublicLandingContent;
}>;

export function CtaSection({ content }: CtaSectionProps) {
  const { contact, cta } = content;
  const hasContactInfo = Boolean(contact.email || contact.phone);

  return (
    <SectionContainer id="contato" labelledBy="cta-title" className="pb-36 sm:pb-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-[var(--brand-color)] p-7 text-[var(--brand-contrast)] shadow-2xl shadow-slate-950/20 sm:p-10 lg:p-14">
        <div className="absolute -right-16 -top-16 size-48 rounded-full bg-white/25" aria-hidden="true" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1fr)] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.24em]">Contato</p>
            <h2 id="cta-title" className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{cta.title}</h2>
            <p className="mt-5 text-lg leading-8 opacity-85">{cta.description}</p>
            {hasContactInfo ? (
              <div className="mt-6 flex flex-col gap-2 text-sm font-semibold opacity-85 sm:flex-row sm:gap-5 lg:flex-col lg:gap-2">
                {contact.email ? <span>E-mail: {contact.email}</span> : null}
                {contact.phone ? <span>Telefone: {contact.phone}</span> : null}
              </div>
            ) : null}
            <ButtonLink href={cta.action.href} variant="ghost" className="mt-8">{cta.action.label}</ButtonLink>
          </div>
          <LeadForm />
        </div>
      </div>
    </SectionContainer>
  );
}
