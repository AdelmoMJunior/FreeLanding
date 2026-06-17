import "server-only";

import { sendLeadNotificationEmail } from "@/lib/leads/email-notifications";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LeadSubmissionValues } from "@/lib/validations/lead";
import type { Json } from "@/types/database";

export async function createPublicLead(values: LeadSubmissionValues, metadata: Json = {}) {
  const supabase = createSupabaseAdminClient();
  const { data: page, error: pageError } = await supabase
    .from("landing_pages")
    .select("id")
    .eq("status", "published")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (pageError || !page) {
    throw new Error("Não foi possível localizar a landing publicada.");
  }

  const { data: settings } = await supabase
    .from("landing_settings")
    .select("notify_leads_by_email, lead_notification_email")
    .eq("landing_page_id", page.id)
    .maybeSingle();

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      landing_page_id: page.id,
      name: values.name,
      email: values.email,
      phone: values.phone,
      company: values.company,
      message: values.message,
      source: "landing_page",
      status: "new",
      metadata,
    })
    .select("id, created_at")
    .single();

  if (error) {
    throw new Error("Não foi possível registrar o lead.");
  }

  if (lead && settings?.notify_leads_by_email && settings.lead_notification_email) {
    await sendLeadNotificationEmail({
      to: settings.lead_notification_email,
      leadId: lead.id,
      createdAt: lead.created_at,
      values,
    }).catch((error: unknown) => {
      console.error("Lead notification email failed.", error);
    });
  }
}
