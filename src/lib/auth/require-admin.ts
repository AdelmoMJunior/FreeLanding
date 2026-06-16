import "server-only";

import { redirect } from "next/navigation";

import { resolveAdminAccess } from "@/lib/auth/access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RequireAdminOptions = Readonly<{
  nextPath?: string;
}>;

export async function requireAdmin({ nextPath = "/admin" }: RequireAdminOptions = {}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,role")
    .eq("id", user.id)
    .maybeSingle();

  const access = resolveAdminAccess({
    userId: user.id,
    profileRole: profile?.role,
  });

  if (access !== "allowed") {
    redirect(`/admin/login?error=forbidden&next=${encodeURIComponent(nextPath)}`);
  }

  return { user, profile };
}
