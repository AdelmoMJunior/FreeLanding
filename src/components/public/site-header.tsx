import { landingContent } from "@/lib/landing/static-content";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-10 px-5 py-5 sm:px-8 lg:px-10" aria-label="Cabeçalho do site">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-slate-950/55 px-4 py-3 text-white shadow-2xl shadow-slate-950/20 backdrop-blur md:px-5">
        <a href="#top" className="flex items-center gap-3 font-bold tracking-tight" aria-label="FreeLanding Automação — ir para o início">
          <span className="grid size-9 place-items-center rounded-full bg-emerald-400 text-slate-950">F</span>
          <span>{landingContent.company}</span>
        </a>
        <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex" aria-label="Navegação principal">
          <a className="hover:text-white" href="#modulos">Módulos</a>
          <a className="hover:text-white" href="#beneficios">Benefícios</a>
          <a className="hover:text-white" href="#faq">FAQ</a>
          <a className="hover:text-white" href="#contato">Contato</a>
        </nav>
      </div>
    </header>
  );
}
