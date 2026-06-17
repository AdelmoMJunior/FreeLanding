import type { Metadata } from "next";

import { AdminFaqsManager } from "@/components/admin/faqs-manager";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getFaqsForAdmin } from "@/lib/landing/admin-faqs";

export const metadata: Metadata = {
  title: "FAQ | Painel admin | FreeLanding",
  description: "Gerencie as perguntas frequentes apresentadas na landing page.",
};

export default async function AdminFaqsPage() {
  await requireAdmin({ nextPath: "/admin/faqs" });

  const faqs = await getFaqsForAdmin();
  const nextSortOrder = faqs.length ? Math.max(...faqs.map((faq) => faq.sortOrder)) + 10 : 0;

  return <AdminFaqsManager faqs={faqs} nextSortOrder={nextSortOrder} />;
}
