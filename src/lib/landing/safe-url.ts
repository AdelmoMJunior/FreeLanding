export function isSafeLandingHref(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith("#") || (trimmed.startsWith("/") && !trimmed.startsWith("//"))) {
    return true;
  }

  try {
    const url = new URL(trimmed);

    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function safeLandingHrefOrFallback(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim() ?? "";

  if (!isSafeLandingHref(trimmed)) {
    return fallback;
  }

  if (trimmed.startsWith("#") || trimmed.startsWith("/")) {
    return trimmed;
  }

  return new URL(trimmed).toString();
}
