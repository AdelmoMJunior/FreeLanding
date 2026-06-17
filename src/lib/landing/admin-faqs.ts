import "server-only";

import { ensureEditableLandingPage, getEditableLandingPage } from "@/lib/landing/admin-page";
import type { AdminFaq } from "@/lib/landing/faq-types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { FaqFormValues, FaqMoveDirection } from "@/lib/validations/faq";

function mapAdminFaq(row: Readonly<{
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}>): AdminFaq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

async function getEditablePageIdForFaqs() {
  const supabase = createSupabaseAdminClient();
  const { page, error } = await getEditableLandingPage(supabase);

  if (error || !page) {
    return { supabase, pageId: null, error };
  }

  return { supabase, pageId: page.id, error: null };
}

export async function getFaqsForAdmin() {
  const { supabase, pageId, error: pageError } = await getEditablePageIdForFaqs();

  if (pageError || !pageId) {
    return [];
  }

  const { data: faqs, error: faqsError } = await supabase
    .from("faqs")
    .select("id, question, answer, sort_order, is_active")
    .eq("landing_page_id", pageId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (faqsError) {
    return [];
  }

  return faqs.map(mapAdminFaq);
}

export async function saveFaq(values: FaqFormValues) {
  const supabase = createSupabaseAdminClient();
  const { pageId, error: pageError } = await ensureEditableLandingPage(supabase);

  if (pageError || !pageId) {
    throw new Error("Não foi possível localizar a landing principal.");
  }

  const payload = {
    landing_page_id: pageId,
    question: values.question,
    answer: values.answer,
    sort_order: values.sortOrder,
    is_active: values.isActive,
  };

  const { error } = values.id
    ? await supabase
        .from("faqs")
        .update(payload)
        .eq("id", values.id)
        .eq("landing_page_id", pageId)
    : await supabase.from("faqs").insert(payload);

  if (error) {
    throw new Error("Não foi possível salvar a FAQ.");
  }
}

export async function deleteFaq(id: string) {
  const { supabase, pageId, error: pageError } = await getEditablePageIdForFaqs();

  if (pageError || !pageId) {
    throw new Error("Não foi possível localizar a landing principal.");
  }

  const { error } = await supabase
    .from("faqs")
    .delete()
    .eq("id", id)
    .eq("landing_page_id", pageId);

  if (error) {
    throw new Error("Não foi possível remover a FAQ.");
  }
}

export async function toggleFaqStatus(id: string) {
  const { supabase, pageId, error: pageError } = await getEditablePageIdForFaqs();

  if (pageError || !pageId) {
    throw new Error("Não foi possível localizar a landing principal.");
  }

  const { data: faq, error: readError } = await supabase
    .from("faqs")
    .select("is_active")
    .eq("id", id)
    .eq("landing_page_id", pageId)
    .single();

  if (readError) {
    throw new Error("Não foi possível ler a FAQ.");
  }

  const { error } = await supabase
    .from("faqs")
    .update({ is_active: !faq.is_active })
    .eq("id", id)
    .eq("landing_page_id", pageId);

  if (error) {
    throw new Error("Não foi possível atualizar o status da FAQ.");
  }
}

export async function moveFaq(id: string, direction: FaqMoveDirection) {
  const { supabase, pageId, error: pageError } = await getEditablePageIdForFaqs();

  if (pageError || !pageId) {
    throw new Error("Não foi possível localizar a landing principal.");
  }

  const { data: faqs, error: readError } = await supabase
    .from("faqs")
    .select("id")
    .eq("landing_page_id", pageId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (readError || !faqs.length) {
    throw new Error("Não foi possível ordenar as FAQs.");
  }

  const currentIndex = faqs.findIndex((faq) => faq.id === id);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= faqs.length) {
    return;
  }

  const reorderedFaqs = [...faqs];
  [reorderedFaqs[currentIndex], reorderedFaqs[targetIndex]] = [
    reorderedFaqs[targetIndex],
    reorderedFaqs[currentIndex],
  ];

  const updateResults = await Promise.all(
    reorderedFaqs.map((faq, index) =>
      supabase
        .from("faqs")
        .update({ sort_order: index * 10 })
        .eq("id", faq.id)
        .eq("landing_page_id", pageId),
    ),
  );

  if (updateResults.some(({ error }) => error)) {
    throw new Error("Não foi possível reordenar as FAQs.");
  }
}
