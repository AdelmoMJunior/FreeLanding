import { SectionContainer } from "@/components/ui/section-container";
import type { PublicLandingBenefit } from "@/lib/landing/benefit-types";

type BenefitsSectionProps = Readonly<{
  benefits: readonly PublicLandingBenefit[];
}>;

export function BenefitsSection({ benefits }: BenefitsSectionProps) {
  if (!benefits.length) {
    return null;
  }

  return (
    <SectionContainer id="beneficios" className="py-8 lg:py-14">
      <div className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-950/20">
        <ul className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4" aria-label="Lista de benefícios">
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
