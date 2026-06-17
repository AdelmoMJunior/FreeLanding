"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { deleteFaq, moveFaq, saveFaq, toggleFaqStatus } from "@/lib/landing/admin-faqs";
import { requireSameOriginAdminMutation } from "@/lib/security/admin-mutation";
import {
  FaqValidationError,
  parseFaqForm,
  parseFaqIdForm,
  parseFaqMoveForm,
  type FaqFieldErrors,
} from "@/lib/validations/faq";

export type FaqActionState = Readonly<{
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FaqFieldErrors;
}>;

function revalidateFaqs() {
  revalidatePath("/");
  revalidatePath("/admin/faqs");
}

export async function saveFaqAction(
  _state: FaqActionState,
  formData: FormData,
): Promise<FaqActionState> {
  await requireSameOriginAdminMutation();
  await requireAdmin({ nextPath: "/admin/faqs" });

  let values;

  try {
    values = parseFaqForm(formData);
  } catch (error) {
    if (error instanceof FaqValidationError) {
      return {
        status: "error",
        message: "Corrija os campos destacados antes de salvar a FAQ.",
        fieldErrors: error.fieldErrors,
      };
    }

    return { status: "error", message: "Não foi possível validar a FAQ." };
  }

  try {
    await saveFaq(values);
  } catch {
    return {
      status: "error",
      message: "Não foi possível salvar a FAQ agora. Confira o Supabase e tente novamente.",
    };
  }

  revalidateFaqs();

  return {
    status: "success",
    message: values.id ? "FAQ atualizada." : "FAQ criada.",
  };
}

export async function deleteFaqAction(formData: FormData) {
  await requireSameOriginAdminMutation();
  await requireAdmin({ nextPath: "/admin/faqs" });

  try {
    const id = parseFaqIdForm(formData);
    await deleteFaq(id);
    revalidateFaqs();
  } catch {
    return;
  }
}

export async function toggleFaqStatusAction(formData: FormData) {
  await requireSameOriginAdminMutation();
  await requireAdmin({ nextPath: "/admin/faqs" });

  try {
    const id = parseFaqIdForm(formData);
    await toggleFaqStatus(id);
    revalidateFaqs();
  } catch {
    return;
  }
}

export async function moveFaqAction(formData: FormData) {
  await requireSameOriginAdminMutation();
  await requireAdmin({ nextPath: "/admin/faqs" });

  try {
    const { id, direction } = parseFaqMoveForm(formData);
    await moveFaq(id, direction);
    revalidateFaqs();
  } catch {
    return;
  }
}
