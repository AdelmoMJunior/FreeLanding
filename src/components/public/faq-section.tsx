import { SectionContainer } from "@/components/ui/section-container";
import type { PublicLandingFaq } from "@/lib/landing/faq-types";

type FaqSectionProps = Readonly<{
  faqs: readonly PublicLandingFaq[];
}>;

export function FaqSection({ faqs }: FaqSectionProps) {
  if (!faqs.length) {
    return null;
  }

  return (
    <SectionContainer id="faq">
      <div className="mx-auto grid max-w-4xl gap-4">
        {faqs.map((item, index) => (
          <article key={`${item.question}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-slate-950">{item.question}</h3>
            <p className="mt-3 leading-7 text-slate-600">{item.answer}</p>
          </article>
        ))}
      </div>
    </SectionContainer>
  );
}
