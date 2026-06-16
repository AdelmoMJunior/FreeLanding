import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Login admin | FreeLanding",
  description: "Acesso administrativo do FreeLanding.",
};

type LoginPageProps = Readonly<{
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeError(value: string | undefined) {
  if (value === "invalid" || value === "credentials" || value === "forbidden") {
    return value;
  }

  return undefined;
}

function normalizeNextPath(value: string | undefined): string {
  if (!value) {
    return "/admin";
  }

  const isAdminPath =
    value === "/admin" || value.startsWith("/admin/") || value.startsWith("/admin?");

  if (!isAdminPath || value.startsWith("/admin/login")) {
    return "/admin";
  }

  return value;
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = normalizeError(firstSearchParam(params.error));
  const nextPath = normalizeNextPath(firstSearchParam(params.next));

  return (
    <main className="min-h-screen bg-[#edf3ea] px-5 py-8 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_480px]">
        <section className="rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-10 lg:p-12">
          <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-emerald-200">
            Administração segura
          </p>
          <h1 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
            Acesse o painel para preparar a gestão da landing page.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Esta área centraliza as próximas rotinas de conteúdo: configurações, módulos,
            benefícios, FAQ e acompanhamento de leads.
          </p>
          <div className="mt-8 grid gap-3 text-sm font-semibold text-slate-200 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Proteção por sessão no servidor
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Acesso restrito a perfis autorizados
            </div>
          </div>
        </section>

        <section
          aria-labelledby="admin-login-title"
          className="rounded-[2rem] border border-white bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] sm:p-8"
        >
          <div className="mb-7">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              FreeLanding
            </p>
            <h2 id="admin-login-title" className="mt-2 text-3xl font-black tracking-tight">
              Login administrativo
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use o e-mail e a senha cadastrados para sua conta de administração.
            </p>
          </div>

          <LoginForm error={error} nextPath={nextPath} />
        </section>
      </div>
    </main>
  );
}
