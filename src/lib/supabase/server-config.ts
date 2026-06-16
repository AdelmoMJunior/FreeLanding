import "server-only";

type SupabaseAdminConfig = Readonly<{
  url: string;
  serviceRoleKey: string;
}>;

function getRequiredEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseAdminConfig(): SupabaseAdminConfig {
  return {
    url: getRequiredEnv(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL",
    ),
    serviceRoleKey: getRequiredEnv(
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      "SUPABASE_SERVICE_ROLE_KEY",
    ),
  };
}
