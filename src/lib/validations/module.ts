import { z } from "zod";

import { safeImagePathOrNull } from "@/lib/landing/safe-image";

export type ModuleFormValues = Readonly<{
  id?: string;
  title: string;
  description: string;
  imagePath: string;
  imageAlt: string;
  sortOrder: number;
  isActive: boolean;
}>;

export type ModuleField = keyof ModuleFormValues;
export type ModuleFieldErrors = Partial<Record<ModuleField, string>>;
export type ModuleMoveDirection = "up" | "down";

export class ModuleValidationError extends Error {
  readonly fieldErrors: ModuleFieldErrors;

  constructor(fieldErrors: ModuleFieldErrors) {
    super(Object.values(fieldErrors)[0] ?? "Módulo inválido.");
    this.name = "ModuleValidationError";
    this.fieldErrors = fieldErrors;
  }
}

const optionalIdSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.string().uuid("Módulo inválido.").optional());

const moduleFormSchema = z.object({
  id: optionalIdSchema,
  title: z.string().trim().min(1, "Informe o título do módulo.").max(80, "Use no máximo 80 caracteres."),
  description: z
    .string()
    .trim()
    .min(1, "Informe a descrição do módulo.")
    .max(360, "Use no máximo 360 caracteres."),
  imagePath: z
    .string()
    .trim()
    .max(512, "O caminho da imagem não pode passar de 512 caracteres.")
    .refine(
      (value) => !value || safeImagePathOrNull(value) !== null,
      "Use uma imagem relativa segura ou uma imagem enviada pelo admin.",
    ),
  imageAlt: z.string().trim().max(120, "O texto alternativo não pode passar de 120 caracteres."),
  sortOrder: z
    .string()
    .trim()
    .min(1, "Informe uma ordem numérica.")
    .transform((value) => Number(value))
    .pipe(
      z
        .number({ error: "Informe uma ordem numérica." })
        .int("Informe uma ordem inteira.")
        .min(0, "A ordem não pode ser negativa.")
        .max(9999, "A ordem não pode passar de 9999."),
    ),
  isActive: z.boolean(),
});

function getStringField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

function getFieldErrors(error: z.ZodError): ModuleFieldErrors {
  const fieldErrors: ModuleFieldErrors = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (typeof field === "string" && field in moduleFormSchema.shape) {
      const key = field as ModuleField;
      fieldErrors[key] ??= issue.message;
    }
  });

  return fieldErrors;
}

export function parseModuleForm(formData: FormData): ModuleFormValues {
  const result = moduleFormSchema.safeParse({
    id: getStringField(formData, "id"),
    title: getStringField(formData, "title"),
    description: getStringField(formData, "description"),
    imagePath: getStringField(formData, "imagePath"),
    imageAlt: getStringField(formData, "imageAlt"),
    sortOrder: getStringField(formData, "sortOrder"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  });

  if (!result.success) {
    throw new ModuleValidationError(getFieldErrors(result.error));
  }

  return result.data;
}

export function parseModuleIdForm(formData: FormData) {
  const result = z.string().trim().uuid("Módulo inválido.").safeParse(getStringField(formData, "id"));

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Módulo inválido.");
  }

  return result.data;
}

export function parseModuleMoveForm(formData: FormData): Readonly<{
  id: string;
  direction: ModuleMoveDirection;
}> {
  const id = parseModuleIdForm(formData);
  const direction = getStringField(formData, "direction");

  if (direction !== "up" && direction !== "down") {
    throw new Error("Direção de ordenação inválida.");
  }

  return { id, direction };
}
