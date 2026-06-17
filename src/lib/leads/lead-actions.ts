"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { updateLeadAdminFields } from "@/lib/leads/admin-leads";
import { requireSameOriginAdminMutation } from "@/lib/security/admin-mutation";
import { parseLeadAdminUpdateForm } from "@/lib/validations/lead";

export async function updateLeadStatusAction(formData: FormData) {
  await requireSameOriginAdminMutation();
  await requireAdmin({ nextPath: "/admin/leads" });

  try {
    const { id, status, adminNotes } = parseLeadAdminUpdateForm(formData);
    await updateLeadAdminFields(id, status, adminNotes);
    revalidatePath("/admin/leads");
  } catch {
    return;
  }
}
