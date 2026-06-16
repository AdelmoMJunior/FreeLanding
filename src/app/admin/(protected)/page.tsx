import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel admin | FreeLanding",
  description: "Painel administrativo inicial do FreeLanding.",
};

const cards = [
  {
    title: "Configurações da landing",
    description: "Prepare título, chamadas, contatos e dados gerais da página pública.",
  },
  {
    title: "Conteúdo comercial",
    description: "Organize módulos, benefícios e perguntas frequentes antes da edição completa.",
  },
  {
    title: "Leads recebidos",
    description: "Acompanhe futuramente os contatos enviados pelos formulários públicos.",
  },
];

export default function AdminHomePage() {
  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-300">
          Etapa 6
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
          Painel administrativo inicial protegido.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          A estrutura de acesso já está no lugar. As telas de CRUD serão adicionadas nas
          próximas etapas, mantendo a validação e autorização no servidor.
        </p>
      </section>

      <section aria-labelledby="admin-next-steps-title" className="grid gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
            Próximos blocos
          </p>
          <h2 id="admin-next-steps-title" className="mt-2 text-2xl font-black tracking-tight">
            Áreas planejadas para edição
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.title}
              className="rounded-[1.75rem] border border-white bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            >
              <h3 className="text-lg font-black tracking-tight text-slate-950">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
              <p className="mt-5 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
                Em breve
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
