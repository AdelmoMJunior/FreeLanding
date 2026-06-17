import "server-only";

import { landingContent } from "@/lib/landing/static-content";
import {
  getEditableLandingPage,
  saveEditableLandingPageSeo,
  type EditableLandingPage,
} from "@/lib/landing/admin-page";
import { safeLandingHrefOrFallback } from "@/lib/landing/safe-url";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LandingSettingsFormValues } from "@/lib/validations/landing";

type EditableLandingSettings = Readonly<{
  headline: string;
  subheadline: string;
  primary_cta_label: string;
  primary_cta_url: string;
  secondary_cta_label: string;
  secondary_cta_url: string;
  cta_title: string;
  cta_description: string;
  whatsapp_number: string;
  whatsapp_message: string;
  contact_email: string;
  contact_phone: string;
  brand_color: string;
  notify_leads_by_email: boolean;
  lead_notification_email: string;
}>;

export const defaultLandingSettingsFormValues: LandingSettingsFormValues = {
  seoTitle: landingContent.company,
  seoDescription: landingContent.hero.description,
  headline: landingContent.hero.title,
  subheadline: landingContent.hero.description,
  primaryCtaLabel: landingContent.hero.primaryAction,
  primaryCtaUrl: "#modulos",
  secondaryCtaLabel: landingContent.hero.secondaryAction,
  secondaryCtaUrl: "#beneficios",
  ctaTitle: landingContent.cta.title,
  ctaDescription: landingContent.cta.description,
  whatsappNumber: "",
  whatsappMessage: "",
  contactEmail: "",
  contactPhone: "",
  brandColor: "#10b981",
  notifyLeadsByEmail: false,
  leadNotificationEmail: "",
};

function textOrFallback(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : fallback;
}

function toFormValues(
  page: EditableLandingPage | null,
  settings: EditableLandingSettings | null,
): LandingSettingsFormValues {
  return {
    seoTitle: textOrFallback(page?.seo_title, defaultLandingSettingsFormValues.seoTitle),
    seoDescription: textOrFallback(
      page?.seo_description,
      defaultLandingSettingsFormValues.seoDescription,
    ),
    headline: textOrFallback(settings?.headline, defaultLandingSettingsFormValues.headline),
    subheadline: textOrFallback(settings?.subheadline, defaultLandingSettingsFormValues.subheadline),
    primaryCtaLabel: textOrFallback(
      settings?.primary_cta_label,
      defaultLandingSettingsFormValues.primaryCtaLabel,
    ),
    primaryCtaUrl: safeLandingHrefOrFallback(
      settings?.primary_cta_url,
      defaultLandingSettingsFormValues.primaryCtaUrl,
    ),
    secondaryCtaLabel: textOrFallback(
      settings?.secondary_cta_label,
      defaultLandingSettingsFormValues.secondaryCtaLabel,
    ),
    secondaryCtaUrl: safeLandingHrefOrFallback(
      settings?.secondary_cta_url,
      defaultLandingSettingsFormValues.secondaryCtaUrl,
    ),
    ctaTitle: textOrFallback(settings?.cta_title, defaultLandingSettingsFormValues.ctaTitle),
    ctaDescription: textOrFallback(settings?.cta_description, defaultLandingSettingsFormValues.ctaDescription),
    whatsappNumber: textOrFallback(settings?.whatsapp_number, ""),
    whatsappMessage: textOrFallback(settings?.whatsapp_message, ""),
    contactEmail: textOrFallback(settings?.contact_email, ""),
    contactPhone: textOrFallback(settings?.contact_phone, ""),
    brandColor: textOrFallback(settings?.brand_color, defaultLandingSettingsFormValues.brandColor),
    notifyLeadsByEmail: settings?.notify_leads_by_email ?? false,
    leadNotificationEmail: textOrFallback(settings?.lead_notification_email, ""),
  };
}

export async function getLandingSettingsForAdmin() {
  const supabase = createSupabaseAdminClient();
  const { page, error: pageError } = await getEditableLandingPage(supabase);

  if (pageError || !page) {
    return defaultLandingSettingsFormValues;
  }

  const { data: settings, error: settingsError } = await supabase
    .from("landing_settings")
    .select(
      "headline, subheadline, primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url, cta_title, cta_description, whatsapp_number, whatsapp_message, contact_email, contact_phone, brand_color, notify_leads_by_email, lead_notification_email",
    )
    .eq("landing_page_id", page.id)
    .maybeSingle();

  if (settingsError) {
    return toFormValues(page, null);
  }

  return toFormValues(page, settings);
}

export async function saveLandingSettings(values: LandingSettingsFormValues) {
  const supabase = createSupabaseAdminClient();
  const { pageId, error: pageError } = await saveEditableLandingPageSeo(supabase, {
    seoTitle: values.seoTitle,
    seoDescription: values.seoDescription,
  });

  if (pageError || !pageId) {
    throw new Error("Não foi possível salvar a página da landing.");
  }

  const { error: settingsError } = await supabase.from("landing_settings").upsert(
    {
      landing_page_id: pageId,
      headline: values.headline,
      subheadline: values.subheadline,
      primary_cta_label: values.primaryCtaLabel,
      primary_cta_url: values.primaryCtaUrl,
      secondary_cta_label: values.secondaryCtaLabel,
      secondary_cta_url: values.secondaryCtaUrl,
      cta_title: values.ctaTitle,
      cta_description: values.ctaDescription,
      whatsapp_number: values.whatsappNumber,
      whatsapp_message: values.whatsappMessage,
      contact_email: values.contactEmail,
      contact_phone: values.contactPhone,
      brand_color: values.brandColor,
      notify_leads_by_email: values.notifyLeadsByEmail,
      lead_notification_email: values.leadNotificationEmail,
    },
    { onConflict: "landing_page_id" },
  );

  if (settingsError) {
    throw new Error("Não foi possível salvar as configurações da landing.");
  }
}
