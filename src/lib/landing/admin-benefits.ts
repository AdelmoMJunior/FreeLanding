import "server-only";

import { ensureEditableLandingPage, getEditableLandingPage } from "@/lib/landing/admin-page";
import type { AdminBenefit } from "@/lib/landing/benefit-types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { BenefitFormValues, BenefitMoveDirection } from "@/lib/validations/benefit";

function mapAdminBenefit(row: Readonly<{
  id: string;
  title: string;
  description: string;
  icon_name: string | null;
  sort_order: number;
  is_active: boolean;
}>): AdminBenefit {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    iconName: row.icon_name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

async function getEditablePageIdForBenefits() {
  const supabase = createSupabaseAdminClient();
  const { page, error } = await getEditableLandingPage(supabase);

  if (error || !page) {
    return { supabase, pageId: null, error };
  }

  return { supabase, pageId: page.id, error: null };
}

export async function getBenefitsForAdmin() {
  const { supabase, pageId, error: pageError } = await getEditablePageIdForBenefits();

  if (pageError || !pageId) {
    return [];
  }

  const { data: benefits, error: benefitsError } = await supabase
    .from("benefits")
    .select("id, title, description, icon_name, sort_order, is_active")
    .eq("landing_page_id", pageId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (benefitsError) {
    return [];
  }

  return benefits.map(mapAdminBenefit);
}

export async function saveBenefit(values: BenefitFormValues) {
  const supabase = createSupabaseAdminClient();
  const { pageId, error: pageError } = await ensureEditableLandingPage(supabase);

  if (pageError || !pageId) {
    throw new Error("Não foi possível localizar a landing principal.");
  }

  const payload = {
    landing_page_id: pageId,
    title: values.title,
    description: values.description,
    icon_name: values.iconName || null,
    sort_order: values.sortOrder,
    is_active: values.isActive,
  };

  const { error } = values.id
    ? await supabase
        .from("benefits")
        .update(payload)
        .eq("id", values.id)
        .eq("landing_page_id", pageId)
    : await supabase.from("benefits").insert(payload);

  if (error) {
    throw new Error("Não foi possível salvar o benefício.");
  }
}

export async function deleteBenefit(id: string) {
  const { supabase, pageId, error: pageError } = await getEditablePageIdForBenefits();

  if (pageError || !pageId) {
    throw new Error("Não foi possível localizar a landing principal.");
  }

  const { error } = await supabase
    .from("benefits")
    .delete()
    .eq("id", id)
    .eq("landing_page_id", pageId);

  if (error) {
    throw new Error("Não foi possível remover o benefício.");
  }
}

export async function toggleBenefitStatus(id: string) {
  const { supabase, pageId, error: pageError } = await getEditablePageIdForBenefits();

  if (pageError || !pageId) {
    throw new Error("Não foi possível localizar a landing principal.");
  }

  const { data: benefit, error: readError } = await supabase
    .from("benefits")
    .select("is_active")
    .eq("id", id)
    .eq("landing_page_id", pageId)
    .single();

  if (readError) {
    throw new Error("Não foi possível ler o benefício.");
  }

  const { error } = await supabase
    .from("benefits")
    .update({ is_active: !benefit.is_active })
    .eq("id", id)
    .eq("landing_page_id", pageId);

  if (error) {
    throw new Error("Não foi possível atualizar o status do benefício.");
  }
}

export async function moveBenefit(id: string, direction: BenefitMoveDirection) {
  const { supabase, pageId, error: pageError } = await getEditablePageIdForBenefits();

  if (pageError || !pageId) {
    throw new Error("Não foi possível localizar a landing principal.");
  }

  const { data: benefits, error: readError } = await supabase
    .from("benefits")
    .select("id")
    .eq("landing_page_id", pageId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (readError || !benefits.length) {
    throw new Error("Não foi possível ordenar os benefícios.");
  }

  const currentIndex = benefits.findIndex((benefit) => benefit.id === id);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= benefits.length) {
    return;
  }

  const reorderedBenefits = [...benefits];
  [reorderedBenefits[currentIndex], reorderedBenefits[targetIndex]] = [
    reorderedBenefits[targetIndex],
    reorderedBenefits[currentIndex],
  ];

  const updateResults = await Promise.all(
    reorderedBenefits.map((benefit, index) =>
      supabase
        .from("benefits")
        .update({ sort_order: index * 10 })
        .eq("id", benefit.id)
        .eq("landing_page_id", pageId),
    ),
  );

  if (updateResults.some(({ error }) => error)) {
    throw new Error("Não foi possível reordenar os benefícios.");
  }
}
