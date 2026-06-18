import Image from "next/image";

import type { PublicLandingContent } from "@/lib/landing/content";

type SiteHeaderProps = Readonly<{
  content: PublicLandingContent;
}>;

export function SiteHeader({ content }: SiteHeaderProps) {
  const fallbackInitial = content.company.trim().charAt(0).toUpperCase() || "F";
  const headerIconPath = content.faviconPath ?? content.logoPath;

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-black focus:text-slate-950 focus:shadow-xl"
      >
        Pular para o conteúdo
      </a>
      <header className="absolute inset-x-0 top-0 z-10 px-5 py-5 sm:px-8 lg:px-10" aria-label="Cabeçalho do site">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border border-white/10 bg-slate-950/55 px-4 py-3 text-white shadow-2xl shadow-slate-950/20 backdrop-blur md:px-5">
          <a href="#top" className="flex min-w-0 items-center gap-3 font-bold tracking-tight" aria-label={`${content.company} — ir para o início`}>
            {headerIconPath ? (
              <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-white/95 ring-1 ring-white/20">
                <Image
                  src={headerIconPath}
                  alt={`Ícone ${content.company}`}
                  fill
                  sizes="36px"
                  className="object-contain p-1"
                />
              </span>
            ) : (
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--brand-color)] text-[var(--brand-contrast)]">
                {fallbackInitial}
              </span>
            )}
            <span className="truncate">{content.company}</span>
          </a>
          <a
            href="#contato"
            className="inline-flex min-h-10 items-center rounded-full bg-[var(--brand-color)] px-4 text-xs font-black uppercase tracking-[0.14em] text-[var(--brand-contrast)] md:hidden"
          >
            Contato
          </a>
          <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex" aria-label="Navegação principal">
            <a className="hover:text-white" href="#modulos">Destaques</a>
            <a className="hover:text-white" href="#beneficios">Benefícios</a>
            <a className="hover:text-white" href="#faq">FAQ</a>
            <a className="hover:text-white" href="#contato">Contato</a>
          </nav>
        </div>
      </header>
    </>
  );
}
