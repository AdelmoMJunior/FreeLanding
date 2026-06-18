import "server-only";

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

import { buildLandingContent } from "@/lib/landing/content";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

const landingPageColumns = "id, seo_title, seo_description, seo_image_path";
const landingSettingsColumns =
  "headline, subheadline, primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url, cta_title, cta_description, whatsapp_number, whatsapp_message, contact_email, contact_phone, brand_color, notify_leads_by_email, lead_notification_email, company_name, logo_path, favicon_path, lead_form_title, lead_form_description, lead_form_submit_label, lead_form_success_title, lead_form_success_message, lead_form_success_dismiss_label, lead_form_required_label, lead_form_name_label, lead_form_email_label, lead_form_phone_label, lead_form_phone_helper, lead_form_company_label, lead_form_message_label, lead_form_message_helper, lead_form_message_placeholder";
const landingModuleColumns =
  "title, description, image_path, image_alt, sort_order, is_active";
const landingBenefitColumns = "title, description, icon_name, sort_order, is_active";
const landingFaqColumns = "question, answer, sort_order, is_active";

export const getPublicLandingContent = cache(async () => {
  try {
    const { url, anonKey } = getSupabasePublicConfig();
    const supabase = createClient<Database>(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });

    const { data: page, error: pageError } = await supabase
      .from("landing_pages")
      .select(landingPageColumns)
      .eq("status", "published")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (pageError || !page) {
      return buildLandingContent();
    }

    const { data: settings, error: settingsError } = await supabase
      .from("landing_settings")
      .select(landingSettingsColumns)
      .eq("landing_page_id", page.id)
      .maybeSingle();

    if (settingsError) {
      return buildLandingContent({ page });
    }

    const { data: modules, error: modulesError } = await supabase
      .from("system_modules")
      .select(landingModuleColumns)
      .eq("landing_page_id", page.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    const { data: benefits, error: benefitsError } = await supabase
      .from("benefits")
      .select(landingBenefitColumns)
      .eq("landing_page_id", page.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    const { data: faqs, error: faqsError } = await supabase
      .from("faqs")
      .select(landingFaqColumns)
      .eq("landing_page_id", page.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    return buildLandingContent({
      page,
      settings,
      modules: modulesError ? null : modules,
      benefits: benefitsError ? null : benefits,
      faqs: faqsError ? null : faqs,
    });
  } catch {
    return buildLandingContent();
  }
});
