import type { Metadata } from "next";

import { AdminModulesManager } from "@/components/admin/modules-manager";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getModulesForAdmin } from "@/lib/landing/admin-modules";

export const metadata: Metadata = {
  title: "Módulos | Painel admin | FreeLanding",
  description: "Gerencie os módulos comerciais apresentados na landing page.",
};

export default async function AdminModulesPage() {
  await requireAdmin({ nextPath: "/admin/modules" });

  const modules = await getModulesForAdmin();
  const nextSortOrder = modules.length
    ? Math.max(...modules.map((module) => module.sortOrder)) + 10
    : 0;

  return <AdminModulesManager modules={modules} nextSortOrder={nextSortOrder} />;
}
