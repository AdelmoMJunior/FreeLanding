import "server-only";

import { headers } from "next/headers";

import { isSameOriginRequest } from "@/lib/security/same-origin";

export async function requireSameOriginAdminMutation() {
  const requestHeaders = await headers();

  if (!isSameOriginRequest(requestHeaders)) {
    throw new Error("Requisição administrativa inválida.");
  }
}
