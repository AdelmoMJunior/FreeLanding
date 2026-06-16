import type { ProfileRole } from "@/types/database";

export type AdminAccessStatus = "allowed" | "unauthenticated" | "forbidden";

type AdminAccessInput = Readonly<{
  userId: string | null | undefined;
  profileRole: ProfileRole | null | undefined;
}>;

export function resolveAdminAccess({
  userId,
  profileRole,
}: AdminAccessInput): AdminAccessStatus {
  if (!userId) {
    return "unauthenticated";
  }

  return profileRole === "admin" ? "allowed" : "forbidden";
}

export function getSafeAdminNextPath(value: FormDataEntryValue | string | null): string {
  if (typeof value !== "string") {
    return "/admin";
  }

  const isAdminPath =
    (value === "/admin" || value.startsWith("/admin/") || value.startsWith("/admin?"));

  if (!isAdminPath) {
    return "/admin";
  }

  if (value.startsWith("//") || value === "/admin/login" || value.startsWith("/admin/login?")) {
    return "/admin";
  }

  return value;
}
