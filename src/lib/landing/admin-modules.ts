import "server-only";

import { ensureEditableLandingPage, getEditableLandingPage } from "@/lib/landing/admin-page";
import type { AdminModule } from "@/lib/landing/module-types";
import { deleteLandingImageByPublicUrl } from "@/lib/storage/images";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ModuleFormValues, ModuleMoveDirection } from "@/lib/validations/module";

function mapAdminModule(row: Readonly<{
  id: string;
  title: string;
  description: string;
  image_path: string | null;
  image_alt: string;
  sort_order: number;
  is_active: boolean;
}>): AdminModule {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imagePath: row.image_path,
    imageAlt: row.image_alt,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

async function getEditablePageIdForModules() {
  const supabase = createSupabaseAdminClient();
  const { page, error } = await getEditableLandingPage(supabase);

  if (error || !page) {
    return { supabase, pageId: null, error };
  }

  return { supabase, pageId: page.id, error: null };
}

export async function getModulesForAdmin() {
  const { supabase, pageId, error: pageError } = await getEditablePageIdForModules();

  if (pageError || !pageId) {
    return [];
  }

  const { data: modules, error: modulesError } = await supabase
    .from("system_modules")
    .select("id, title, description, image_path, image_alt, sort_order, is_active")
    .eq("landing_page_id", pageId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (modulesError) {
    return [];
  }

  return modules.map(mapAdminModule);
}

export async function saveModule(values: ModuleFormValues) {
  const supabase = createSupabaseAdminClient();
  const { pageId, error: pageError } = await ensureEditableLandingPage(supabase);

  if (pageError || !pageId) {
    throw new Error("Não foi possível localizar a landing principal.");
  }

  const payload = {
    landing_page_id: pageId,
    title: values.title,
    description: values.description,
    image_path: values.imagePath || null,
    image_alt: values.imageAlt,
    sort_order: values.sortOrder,
    is_active: values.isActive,
  };

  const { data: currentModule } = values.id
    ? await supabase
        .from("system_modules")
        .select("image_path")
        .eq("id", values.id)
        .eq("landing_page_id", pageId)
        .maybeSingle()
    : { data: null };

  const { error } = values.id
    ? await supabase
        .from("system_modules")
        .update(payload)
        .eq("id", values.id)
        .eq("landing_page_id", pageId)
    : await supabase.from("system_modules").insert(payload);

  if (error) {
    throw new Error("Não foi possível salvar o módulo.");
  }

  if (currentModule?.image_path && currentModule.image_path !== payload.image_path) {
    await deleteLandingImageByPublicUrl(currentModule.image_path);
  }
}

export async function deleteModule(id: string) {
  const { supabase, pageId, error: pageError } = await getEditablePageIdForModules();

  if (pageError || !pageId) {
    throw new Error("Não foi possível localizar a landing principal.");
  }

  const { data: module } = await supabase
    .from("system_modules")
    .select("image_path")
    .eq("id", id)
    .eq("landing_page_id", pageId)
    .maybeSingle();

  const { error } = await supabase
    .from("system_modules")
    .delete()
    .eq("id", id)
    .eq("landing_page_id", pageId);

  if (error) {
    throw new Error("Não foi possível remover o módulo.");
  }

  if (module?.image_path) {
    await deleteLandingImageByPublicUrl(module.image_path);
  }
}

export async function toggleModuleStatus(id: string) {
  const { supabase, pageId, error: pageError } = await getEditablePageIdForModules();

  if (pageError || !pageId) {
    throw new Error("Não foi possível localizar a landing principal.");
  }

  const { data: module, error: readError } = await supabase
    .from("system_modules")
    .select("is_active")
    .eq("id", id)
    .eq("landing_page_id", pageId)
    .single();

  if (readError) {
    throw new Error("Não foi possível ler o módulo.");
  }

  const { error } = await supabase
    .from("system_modules")
    .update({ is_active: !module.is_active })
    .eq("id", id)
    .eq("landing_page_id", pageId);

  if (error) {
    throw new Error("Não foi possível atualizar o status do módulo.");
  }
}

export async function moveModule(id: string, direction: ModuleMoveDirection) {
  const { supabase, pageId, error: pageError } = await getEditablePageIdForModules();

  if (pageError || !pageId) {
    throw new Error("Não foi possível localizar a landing principal.");
  }

  const { data: modules, error: readError } = await supabase
    .from("system_modules")
    .select("id")
    .eq("landing_page_id", pageId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (readError || !modules.length) {
    throw new Error("Não foi possível ordenar os módulos.");
  }

  const currentIndex = modules.findIndex((module) => module.id === id);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= modules.length) {
    return;
  }

  const reorderedModules = [...modules];
  [reorderedModules[currentIndex], reorderedModules[targetIndex]] = [
    reorderedModules[targetIndex],
    reorderedModules[currentIndex],
  ];

  const updateResults = await Promise.all(
    reorderedModules.map((module, index) =>
      supabase
        .from("system_modules")
        .update({ sort_order: index * 10 })
        .eq("id", module.id)
        .eq("landing_page_id", pageId),
    ),
  );

  if (updateResults.some(({ error }) => error)) {
    throw new Error("Não foi possível reordenar os módulos.");
  }
}
