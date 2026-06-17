"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { saveLandingSettings } from "@/lib/landing/admin-settings";
import { requireSameOriginAdminMutation } from "@/lib/security/admin-mutation";
import {
  LandingSettingsValidationError,
  parseLandingSettingsForm,
  type LandingSettingsFieldErrors,
} from "@/lib/validations/landing";

export type LandingSettingsActionState = Readonly<{
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: LandingSettingsFieldErrors;
}>;

export async function saveLandingSettingsAction(
  _state: LandingSettingsActionState,
  formData: FormData,
): Promise<LandingSettingsActionState> {
  await requireSameOriginAdminMutation();
  await requireAdmin({ nextPath: "/admin/settings" });

  let values;

  try {
    values = parseLandingSettingsForm(formData);
  } catch (error) {
    if (error instanceof LandingSettingsValidationError) {
      return {
        status: "error",
        message: "Corrija os campos destacados antes de salvar.",
        fieldErrors: error.fieldErrors,
      };
    }

    return {
      status: "error",
      message: "Não foi possível validar os dados informados.",
    };
  }

  try {
    await saveLandingSettings(values);
  } catch (error) {
    console.error("Landing settings save failed.", error);

    return {
      status: "error",
      message:
        error instanceof Error && error.message.startsWith("A migration de marca")
          ? error.message
          : "Não foi possível salvar agora. Confira a conexão com o Supabase e tente novamente.",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");

  return {
    status: "success",
    message: "Configurações salvas. A página pública já vai mostrar as alterações em instantes.",
  };
}
