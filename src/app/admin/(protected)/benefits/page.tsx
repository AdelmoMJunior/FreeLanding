import type { Metadata } from "next";

import { AdminBenefitsManager } from "@/components/admin/benefits-manager";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getBenefitsForAdmin } from "@/lib/landing/admin-benefits";

export const metadata: Metadata = {
  title: "Benefícios | Painel admin | FreeLanding",
  description: "Gerencie os benefícios apresentados na landing page.",
};

export default async function AdminBenefitsPage() {
  await requireAdmin({ nextPath: "/admin/benefits" });

  const benefits = await getBenefitsForAdmin();
  const nextSortOrder = benefits.length
    ? Math.max(...benefits.map((benefit) => benefit.sortOrder)) + 10
    : 0;

  return <AdminBenefitsManager benefits={benefits} nextSortOrder={nextSortOrder} />;
}
