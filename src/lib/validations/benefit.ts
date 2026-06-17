import { z } from "zod";

export type BenefitFormValues = Readonly<{
  id?: string;
  title: string;
  description: string;
  iconName: string;
  sortOrder: number;
  isActive: boolean;
}>;

export type BenefitField = keyof BenefitFormValues;
export type BenefitFieldErrors = Partial<Record<BenefitField, string>>;
export type BenefitMoveDirection = "up" | "down";

export class BenefitValidationError extends Error {
  readonly fieldErrors: BenefitFieldErrors;

  constructor(fieldErrors: BenefitFieldErrors) {
    super(Object.values(fieldErrors)[0] ?? "Benefício inválido.");
    this.name = "BenefitValidationError";
    this.fieldErrors = fieldErrors;
  }
}

const optionalIdSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.string().uuid("Benefício inválido.").optional());

const iconNameSchema = z
  .string()
  .trim()
  .max(48, "O ícone não pode passar de 48 caracteres.")
  .refine((value) => !value || /^[a-z0-9-]+$/.test(value), {
    message: "Use apenas letras, números e hífens no ícone.",
  });

const benefitFormSchema = z.object({
  id: optionalIdSchema,
  title: z.string().trim().min(1, "Informe o título do benefício.").max(90, "Use no máximo 90 caracteres."),
  description: z
    .string()
    .trim()
    .min(1, "Informe a descrição do benefício.")
    .max(360, "Use no máximo 360 caracteres."),
  iconName: iconNameSchema,
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

function getFieldErrors(error: z.ZodError): BenefitFieldErrors {
  const fieldErrors: BenefitFieldErrors = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (typeof field === "string" && field in benefitFormSchema.shape) {
      const key = field as BenefitField;
      fieldErrors[key] ??= issue.message;
    }
  });

  return fieldErrors;
}

export function parseBenefitForm(formData: FormData): BenefitFormValues {
  const result = benefitFormSchema.safeParse({
    id: getStringField(formData, "id"),
    title: getStringField(formData, "title"),
    description: getStringField(formData, "description"),
    iconName: getStringField(formData, "iconName"),
    sortOrder: getStringField(formData, "sortOrder"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  });

  if (!result.success) {
    throw new BenefitValidationError(getFieldErrors(result.error));
  }

  return result.data;
}

export function parseBenefitIdForm(formData: FormData) {
  const result = z.string().trim().uuid("Benefício inválido.").safeParse(getStringField(formData, "id"));

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Benefício inválido.");
  }

  return result.data;
}

export function parseBenefitMoveForm(formData: FormData): Readonly<{
  id: string;
  direction: BenefitMoveDirection;
}> {
  const id = parseBenefitIdForm(formData);
  const direction = getStringField(formData, "direction");

  if (direction !== "up" && direction !== "down") {
    throw new Error("Direção de ordenação inválida.");
  }

  return { id, direction };
}
