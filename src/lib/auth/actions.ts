"use server";

import { redirect } from "next/navigation";

import { getSafeAdminNextPath, resolveAdminAccess } from "@/lib/auth/access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseLoginCredentials } from "@/lib/validations/auth";

function loginUrl(error: string, nextPath: string) {
  return `/admin/login?error=${error}&next=${encodeURIComponent(nextPath)}`;
}

export async function loginAdmin(formData: FormData) {
  const nextPath = getSafeAdminNextPath(formData.get("next"));
  let credentials;

  try {
    credentials = parseLoginCredentials(formData);
  } catch {
    redirect(loginUrl("invalid", nextPath));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    redirect(loginUrl("credentials", nextPath));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };

  const access = resolveAdminAccess({
    userId: user?.id,
    profileRole: profile?.role,
  });

  if (access !== "allowed") {
    await supabase.auth.signOut();
    redirect(loginUrl("forbidden", nextPath));
  }

  redirect(nextPath);
}

export async function logoutAdmin() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();
  redirect("/admin/login");
}
