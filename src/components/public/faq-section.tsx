import { landingContent } from "@/lib/landing/static-content";

import { SectionContainer } from "@/components/ui/section-container";

export function FaqSection() {
  return (
    <SectionContainer id="faq" labelledBy="faq-title">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-700">FAQ</p>
        <h2 id="faq-title" className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Perguntas comuns antes de conhecer a automação.
        </h2>
      </div>
      <div className="mx-auto mt-10 grid max-w-4xl gap-4">
        {landingContent.faq.map((item) => (
          <article key={item.question} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-slate-950">{item.question}</h3>
            <p className="mt-3 leading-7 text-slate-600">{item.answer}</p>
          </article>
        ))}
      </div>
    </SectionContainer>
  );
}
