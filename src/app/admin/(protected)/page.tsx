import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel admin | FreeLanding",
  description: "Painel administrativo inicial do FreeLanding.",
};

const cards = [
  {
    title: "Textos e identidade",
    description: "Ajuste títulos, chamadas, cor da marca, botões e canais de contato exibidos na página pública.",
  },
  {
    title: "Seções da página",
    description: "Organize módulos, benefícios e perguntas frequentes para apresentar sua oferta com clareza.",
  },
  {
    title: "Leads e retorno",
    description: "Acompanhe contatos recebidos, filtre por status ou data e registre anotações internas do atendimento.",
  },
];

export default function AdminHomePage() {
  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-300">
          Painel da landing
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
          Gerencie sua página sem depender de código.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Atualize a mensagem principal, organize as seções, acompanhe leads e mantenha a landing
          alinhada ao que sua empresa precisa comunicar agora.
        </p>
      </section>

      <section aria-labelledby="admin-next-steps-title" className="grid gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
            Áreas disponíveis
          </p>
          <h2 id="admin-next-steps-title" className="mt-2 text-2xl font-black tracking-tight">
            O que você pode editar
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
                Disponível
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
