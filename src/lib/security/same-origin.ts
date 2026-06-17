export function isSameOriginRequest(headers: Pick<Headers, "get">) {
  const origin = headers.get("origin")?.trim();
  const host = headers.get("host")?.trim();
  const secFetchSite = headers.get("sec-fetch-site")?.trim().toLowerCase();

  if (secFetchSite === "cross-site") {
    return false;
  }

  if (!origin) {
    return true;
  }

  if (!host) {
    return false;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
