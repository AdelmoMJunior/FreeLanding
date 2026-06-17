"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  deleteBenefit,
  moveBenefit,
  saveBenefit,
  toggleBenefitStatus,
} from "@/lib/landing/admin-benefits";
import { requireSameOriginAdminMutation } from "@/lib/security/admin-mutation";
import {
  BenefitValidationError,
  parseBenefitForm,
  parseBenefitIdForm,
  parseBenefitMoveForm,
  type BenefitFieldErrors,
} from "@/lib/validations/benefit";

export type BenefitActionState = Readonly<{
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: BenefitFieldErrors;
}>;

function revalidateBenefits() {
  revalidatePath("/");
  revalidatePath("/admin/benefits");
}

export async function saveBenefitAction(
  _state: BenefitActionState,
  formData: FormData,
): Promise<BenefitActionState> {
  await requireSameOriginAdminMutation();
  await requireAdmin({ nextPath: "/admin/benefits" });

  let values;

  try {
    values = parseBenefitForm(formData);
  } catch (error) {
    if (error instanceof BenefitValidationError) {
      return {
        status: "error",
        message: "Corrija os campos destacados antes de salvar o benefício.",
        fieldErrors: error.fieldErrors,
      };
    }

    return { status: "error", message: "Não foi possível validar o benefício." };
  }

  try {
    await saveBenefit(values);
  } catch {
    return {
      status: "error",
      message: "Não foi possível salvar o benefício agora. Confira o Supabase e tente novamente.",
    };
  }

  revalidateBenefits();

  return {
    status: "success",
    message: values.id ? "Benefício atualizado." : "Benefício criado.",
  };
}

export async function deleteBenefitAction(formData: FormData) {
  await requireSameOriginAdminMutation();
  await requireAdmin({ nextPath: "/admin/benefits" });

  try {
    const id = parseBenefitIdForm(formData);
    await deleteBenefit(id);
    revalidateBenefits();
  } catch {
    return;
  }
}

export async function toggleBenefitStatusAction(formData: FormData) {
  await requireSameOriginAdminMutation();
  await requireAdmin({ nextPath: "/admin/benefits" });

  try {
    const id = parseBenefitIdForm(formData);
    await toggleBenefitStatus(id);
    revalidateBenefits();
  } catch {
    return;
  }
}

export async function moveBenefitAction(formData: FormData) {
  await requireSameOriginAdminMutation();
  await requireAdmin({ nextPath: "/admin/benefits" });

  try {
    const { id, direction } = parseBenefitMoveForm(formData);
    await moveBenefit(id, direction);
    revalidateBenefits();
  } catch {
    return;
  }
}
