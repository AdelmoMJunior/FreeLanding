import type { Metadata } from "next";

import { AdminSettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getLandingSettingsForAdmin } from "@/lib/landing/admin-settings";

export const metadata: Metadata = {
  title: "Configurações | Painel admin | FreeLanding",
  description: "Edição das configurações gerais da landing page.",
};

export default async function AdminSettingsPage() {
  await requireAdmin({ nextPath: "/admin/settings" });
  const settings = await getLandingSettingsForAdmin();

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] bg-white/90 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] ring-1 ring-white sm:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-800">
          Configurações
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Configurações gerais da landing
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Ajuste textos principais, chamadas para ação, canais de contato, identidade visual e
          notificações enviadas quando um lead chega pela landing.
        </p>
      </section>

      <AdminSettingsForm initialValues={settings} />
    </div>
  );
}
