import { loginAdmin } from "@/lib/auth/actions";

type LoginFormProps = Readonly<{
  error?: "invalid" | "credentials" | "forbidden";
  nextPath: string;
}>;

const errorMessages = {
  invalid: "Confira o e-mail e a senha informados antes de tentar novamente.",
  credentials: "E-mail ou senha não conferem. Tente novamente.",
  forbidden: "Sua conta não tem permissão para acessar o painel administrativo.",
};

export function LoginForm({ error, nextPath }: LoginFormProps) {
  return (
    <form action={loginAdmin} className="grid gap-5" noValidate>
      <input type="hidden" name="next" value={nextPath} />

      {error ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
          role="alert"
        >
          {errorMessages[error]}
        </div>
      ) : null}

      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-bold text-slate-800">
          E-mail do administrador
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          placeholder="admin@empresa.com.br"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-bold text-slate-800">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          placeholder="Digite sua senha"
        />
      </div>

      <button
        type="submit"
        className="mt-2 inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-black text-slate-950 shadow-[0_18px_38px_rgba(16,185,129,0.28)] transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
      >
        Entrar no painel
      </button>
    </form>
  );
}
