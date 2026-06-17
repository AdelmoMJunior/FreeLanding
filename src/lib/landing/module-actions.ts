"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  deleteModule,
  moveModule,
  saveModule,
  toggleModuleStatus,
} from "@/lib/landing/admin-modules";
import { requireSameOriginAdminMutation } from "@/lib/security/admin-mutation";
import {
  ModuleValidationError,
  parseModuleForm,
  parseModuleIdForm,
  parseModuleMoveForm,
  type ModuleFieldErrors,
} from "@/lib/validations/module";

export type ModuleActionState = Readonly<{
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: ModuleFieldErrors;
}>;

function revalidateModules() {
  revalidatePath("/");
  revalidatePath("/admin/modules");
}

export async function saveModuleAction(
  _state: ModuleActionState,
  formData: FormData,
): Promise<ModuleActionState> {
  await requireSameOriginAdminMutation();
  await requireAdmin({ nextPath: "/admin/modules" });

  let values;

  try {
    values = parseModuleForm(formData);
  } catch (error) {
    if (error instanceof ModuleValidationError) {
      return {
        status: "error",
        message: "Corrija os campos destacados antes de salvar o módulo.",
        fieldErrors: error.fieldErrors,
      };
    }

    return { status: "error", message: "Não foi possível validar o módulo." };
  }

  try {
    await saveModule(values);
  } catch {
    return {
      status: "error",
      message: "Não foi possível salvar o módulo agora. Confira o Supabase e tente novamente.",
    };
  }

  revalidateModules();

  return {
    status: "success",
    message: values.id ? "Módulo atualizado." : "Módulo criado.",
  };
}

export async function deleteModuleAction(formData: FormData) {
  await requireSameOriginAdminMutation();
  await requireAdmin({ nextPath: "/admin/modules" });

  try {
    const id = parseModuleIdForm(formData);
    await deleteModule(id);
    revalidateModules();
  } catch {
    return;
  }
}

export async function toggleModuleStatusAction(formData: FormData) {
  await requireSameOriginAdminMutation();
  await requireAdmin({ nextPath: "/admin/modules" });

  try {
    const id = parseModuleIdForm(formData);
    await toggleModuleStatus(id);
    revalidateModules();
  } catch {
    return;
  }
}

export async function moveModuleAction(formData: FormData) {
  await requireSameOriginAdminMutation();
  await requireAdmin({ nextPath: "/admin/modules" });

  try {
    const { id, direction } = parseModuleMoveForm(formData);
    await moveModule(id, direction);
    revalidateModules();
  } catch {
    return;
  }
}
