import "server-only";

import { landingContent } from "@/lib/landing/static-content";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const DEFAULT_LANDING_SLUG = "principal";
export const DEFAULT_LANDING_NAME = "Landing principal";

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;

export type EditableLandingPage = Readonly<{
  id: string;
  seo_title: string;
  seo_description: string;
}>;

export async function getEditableLandingPage(supabase: SupabaseAdminClient) {
  const { data: publishedPage, error: publishedPageError } = await supabase
    .from("landing_pages")
    .select("id, seo_title, seo_description")
    .eq("status", "published")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (publishedPageError || publishedPage) {
    return { page: publishedPage, error: publishedPageError };
  }

  const { data: defaultPage, error: defaultPageError } = await supabase
    .from("landing_pages")
    .select("id, seo_title, seo_description")
    .eq("slug", DEFAULT_LANDING_SLUG)
    .maybeSingle();

  return { page: defaultPage, error: defaultPageError };
}

export async function ensureEditableLandingPage(supabase: SupabaseAdminClient) {
  const { page, error } = await getEditableLandingPage(supabase);

  if (error) {
    return { pageId: null, error };
  }

  if (page) {
    return { pageId: page.id, error: null };
  }

  const { data: insertedPage, error: insertError } = await supabase
    .from("landing_pages")
    .upsert(
      {
        slug: DEFAULT_LANDING_SLUG,
        name: DEFAULT_LANDING_NAME,
        status: "published",
        seo_title: landingContent.company,
        seo_description: landingContent.hero.description,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  return { pageId: insertedPage?.id ?? null, error: insertError };
}

export async function saveEditableLandingPageSeo(
  supabase: SupabaseAdminClient,
  values: Readonly<{ seoTitle: string; seoDescription: string }>,
) {
  const { page, error } = await getEditableLandingPage(supabase);

  if (error) {
    return { pageId: null, error };
  }

  if (page) {
    const { data: updatedPage, error: updateError } = await supabase
      .from("landing_pages")
      .update({
        status: "published",
        seo_title: values.seoTitle,
        seo_description: values.seoDescription,
      })
      .eq("id", page.id)
      .select("id")
      .single();

    return { pageId: updatedPage?.id ?? null, error: updateError };
  }

  const { data: insertedPage, error: insertError } = await supabase
    .from("landing_pages")
    .upsert(
      {
        slug: DEFAULT_LANDING_SLUG,
        name: DEFAULT_LANDING_NAME,
        status: "published",
        seo_title: values.seoTitle,
        seo_description: values.seoDescription,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  return { pageId: insertedPage?.id ?? null, error: insertError };
}
