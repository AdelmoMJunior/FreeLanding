import type { ReactNode } from "react";

import { logoutAdmin } from "@/lib/auth/actions";

type AdminShellProps = Readonly<{
  adminEmail?: string | null;
  children: ReactNode;
}>;

const navigationItems = ["Configurações", "Módulos", "Benefícios", "FAQ", "Leads"];

export function AdminShell({ adminEmail, children }: AdminShellProps) {
  const displayEmail = adminEmail ?? "Administrador";

  return (
    <div className="min-h-screen bg-[#eef2ea] text-slate-950">
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <a
              href="/admin"
              className="inline-flex items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
              aria-label="Ir para o início do painel administrativo"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-emerald-300">
                FL
              </span>
              <span>
                <span className="block text-base font-black tracking-tight">FreeLanding</span>
                <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Painel admin
                </span>
              </span>
            </a>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              <span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Acesso
              </span>
              <span className="block truncate font-semibold text-slate-800">{displayEmail}</span>
            </div>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-slate-800 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600 sm:w-auto"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[280px_1fr] lg:px-10 lg:py-10">
        <aside className="rounded-[2rem] border border-white bg-white/75 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:sticky lg:top-6 lg:self-start">
          <nav aria-label="Navegação administrativa">
            <ul className="grid gap-2">
              {navigationItems.map((item, index) => (
                <li key={item}>
                  <span
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold ${
                      index === 0
                        ? "bg-slate-950 text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)]"
                        : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    {item}
                    <span className="text-xs font-semibold opacity-70">em breve</span>
                  </span>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
