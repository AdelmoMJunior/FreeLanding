import Link from "next/link";

type AdminPlaceholderPageProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  items: readonly string[];
}>;

export function AdminPlaceholderPage({
  eyebrow,
  title,
  description,
  items,
}: AdminPlaceholderPageProps) {
  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] bg-white/90 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] ring-1 ring-white sm:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-800">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
            Área disponível
          </span>
          <Link
            href="/admin"
            className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-700 transition hover:border-slate-950 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
          >
            Voltar à visão geral
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="placeholder-scope-title"
        className="rounded-[1.75rem] border border-white bg-white/75 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
      >
        <h2 id="placeholder-scope-title" className="text-xl font-black tracking-tight text-slate-950">
          Recursos desta área
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
