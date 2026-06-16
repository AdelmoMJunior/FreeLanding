import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/require-admin";

type AdminProtectedLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function AdminProtectedLayout({ children }: AdminProtectedLayoutProps) {
  const { profile, user } = await requireAdmin({ nextPath: "/admin" });

  return <AdminShell adminEmail={profile?.email ?? user.email}>{children}</AdminShell>;
}
