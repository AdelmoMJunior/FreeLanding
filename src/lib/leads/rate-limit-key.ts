function normalizeIpCandidate(value: string | undefined) {
  const candidate = value?.trim().slice(0, 64) ?? "";

  return /^[a-zA-Z0-9:._-]+$/.test(candidate) ? candidate : "";
}

function getForwardedIp(headers: Headers) {
  return normalizeIpCandidate(headers.get("x-forwarded-for")?.split(",")[0]);
}

export function shouldTrustProxyHeaders() {
  return process.env.LEAD_FORM_TRUST_PROXY_HEADERS === "true";
}

export function getLeadRateLimitKey(headers: Headers, trustProxyHeaders = shouldTrustProxyHeaders()) {
  if (!trustProxyHeaders) {
    return "lead:global";
  }

  const clientIp = getForwardedIp(headers) || normalizeIpCandidate(headers.get("x-real-ip") ?? undefined);

  return `lead:${clientIp || "unknown"}`;
}
