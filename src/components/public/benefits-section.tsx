import { SectionContainer } from "@/components/ui/section-container";
import type { PublicLandingBenefit } from "@/lib/landing/benefit-types";

type BenefitsSectionProps = Readonly<{
  benefits: readonly PublicLandingBenefit[];
}>;

export function BenefitsSection({ benefits }: BenefitsSectionProps) {
  return (
    <SectionContainer id="beneficios" labelledBy="beneficios-title" className="py-8 lg:py-14">
      <div className="grid overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-950/20 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-white/10 p-7 sm:p-10 lg:border-b-0 lg:border-r">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--brand-accent-on-dark)]">Benefícios</p>
          <h2 id="beneficios-title" className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            Menos improviso no dia a dia da loja.
          </h2>
          <p className="mt-5 leading-8 text-slate-300">
            A proposta visual prioriza clareza: o visitante entende rapidamente quais rotinas o sistema cobre e por que isso importa para a operação.
          </p>
        </div>
        <ul className="grid gap-px bg-white/10 sm:grid-cols-2" aria-label="Lista de benefícios">
          {benefits.map((benefit, index) => (
            <li key={`${benefit.title}-${index}`} className="bg-slate-950 p-7 sm:p-8">
              <span className="mb-5 inline-flex size-8 items-center justify-center rounded-full bg-[var(--brand-color)] text-[var(--brand-contrast)]" aria-hidden="true">
                ✓
              </span>
              <p className="text-lg font-semibold leading-7">{benefit.title}</p>
              {benefit.description ? (
                <p className="mt-3 text-sm leading-6 text-slate-300">{benefit.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </SectionContainer>
  );
}
