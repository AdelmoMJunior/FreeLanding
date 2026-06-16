import { landingContent } from "@/lib/landing/static-content";

import { SectionContainer } from "@/components/ui/section-container";

export function ModulesSection() {
  return (
    <SectionContainer id="modulos" labelledBy="modulos-title">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-700">Módulos</p>
        <h2 id="modulos-title" className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Peças essenciais da operação no mesmo lugar.
        </h2>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {landingContent.modules.map((module, index) => (
          <article key={module.title} className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/10">
            <span className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-emerald-300">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-6 text-2xl font-black text-slate-950">{module.title}</h3>
            <p className="mt-3 leading-7 text-slate-600">{module.description}</p>
          </article>
        ))}
      </div>
    </SectionContainer>
  );
}
