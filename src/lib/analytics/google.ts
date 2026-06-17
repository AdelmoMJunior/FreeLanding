export function getGoogleAnalyticsId(value: string | undefined | null) {
  const normalized = value?.trim().toUpperCase() ?? "";

  if (!normalized) {
    return null;
  }

  return /^G-[A-Z0-9]{10}$/.test(normalized) ? normalized : null;
}
