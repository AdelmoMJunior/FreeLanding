import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import { getSupabaseAdminConfig } from "@/lib/supabase/server-config";

export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getSupabaseAdminConfig();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
