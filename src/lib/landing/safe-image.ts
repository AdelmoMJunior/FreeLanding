const landingImagesPublicPath = "/storage/v1/object/public/landing-images/";

function decodeRepeatedly(value: string) {
  let decoded = value;

  for (let index = 0; index < 3; index += 1) {
    try {
      const nextValue = decodeURIComponent(decoded);

      if (nextValue === decoded) {
        return decoded;
      }

      decoded = nextValue;
    } catch {
      return null;
    }
  }

  return null;
}

function hasUnsafeImagePathSyntax(value: string) {
  const decodedValue = decodeRepeatedly(value);

  return (
    decodedValue === null ||
    [value, decodedValue].some(
      (candidate) => candidate.includes("..") || candidate.includes("\\") || candidate.startsWith("//"),
    )
  );
}

function getConfiguredSupabaseImageUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function isAllowedSupabaseImageUrl(url: URL) {
  const supabaseUrl = getConfiguredSupabaseImageUrl();

  return Boolean(
    supabaseUrl &&
      url.protocol === supabaseUrl.protocol &&
      url.hostname === supabaseUrl.hostname &&
      url.port === supabaseUrl.port &&
      url.username === "" &&
      url.password === "" &&
      url.pathname.startsWith(landingImagesPublicPath),
  );
}

export function safeImagePathOrNull(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return null;
  }

  if (hasUnsafeImagePathSyntax(trimmed)) {
    return null;
  }

  try {
    const url = new URL(trimmed);

    return isAllowedSupabaseImageUrl(url) ? url.toString() : null;
  } catch {
    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
      return null;
    }

    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }
}
