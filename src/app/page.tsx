export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-sm md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-stone-500">
          FreeLanding
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-950 md:text-6xl">
          Base do projeto pronta.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
          A landing editável, o painel admin e as integrações serão
          implementados em etapas pequenas, com validação e segurança desde o
          início.
        </p>
      </section>
    </main>
  );
}
