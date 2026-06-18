import Image from "next/image";

import { SectionContainer } from "@/components/ui/section-container";
import type { PublicLandingModule } from "@/lib/landing/module-types";

type ModulesSectionProps = Readonly<{
  modules: readonly PublicLandingModule[];
}>;

export function ModulesSection({ modules }: ModulesSectionProps) {
  return (
    <SectionContainer id="modulos" labelledBy="modulos-title">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-700">Destaques</p>
        <h2 id="modulos-title" className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Conheça os principais pontos da proposta.
        </h2>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {modules.map((module, index) => (
          <article key={`${module.title}-${index}`} className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/10">
            {module.imagePath ? (
              <div className="relative mb-5 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100">
                <Image
                  src={module.imagePath}
                  alt={module.imageAlt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              </div>
            ) : null}
            <span className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-[var(--brand-accent-on-dark)]">
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
