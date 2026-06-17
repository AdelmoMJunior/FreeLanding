import type { Metadata } from "next";

import { AdminLeadsManager } from "@/components/admin/leads-manager";
import { requireAdmin } from "@/lib/auth/require-admin";
import { parseLeadAdminFilters } from "@/lib/leads/admin-filters";
import { getLeadsForAdmin } from "@/lib/leads/admin-leads";

export const metadata: Metadata = {
  title: "Leads | Painel admin | FreeLanding",
  description: "Listagem protegida de leads recebidos pela landing page.",
};

type AdminLeadsPageProps = Readonly<{
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
  await requireAdmin({ nextPath: "/admin/leads" });

  const filters = parseLeadAdminFilters((await searchParams) ?? {});
  const leadList = await getLeadsForAdmin(filters);

  return <AdminLeadsManager filters={filters} leadList={leadList} />;
}
