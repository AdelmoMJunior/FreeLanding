import { z } from "zod";

export type FaqFormValues = Readonly<{
  id?: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}>;

export type FaqField = keyof FaqFormValues;
export type FaqFieldErrors = Partial<Record<FaqField, string>>;
export type FaqMoveDirection = "up" | "down";

export class FaqValidationError extends Error {
  readonly fieldErrors: FaqFieldErrors;

  constructor(fieldErrors: FaqFieldErrors) {
    super(Object.values(fieldErrors)[0] ?? "FAQ inválida.");
    this.name = "FaqValidationError";
    this.fieldErrors = fieldErrors;
  }
}

const optionalIdSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.string().uuid("FAQ inválida.").optional());

const faqFormSchema = z.object({
  id: optionalIdSchema,
  question: z.string().trim().min(1, "Informe a pergunta.").max(180, "Use no máximo 180 caracteres."),
  answer: z
    .string()
    .trim()
    .min(1, "Informe a resposta.")
    .max(900, "Use no máximo 900 caracteres."),
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

function getFieldErrors(error: z.ZodError): FaqFieldErrors {
  const fieldErrors: FaqFieldErrors = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (typeof field === "string" && field in faqFormSchema.shape) {
      const key = field as FaqField;
      fieldErrors[key] ??= issue.message;
    }
  });

  return fieldErrors;
}

export function parseFaqForm(formData: FormData): FaqFormValues {
  const result = faqFormSchema.safeParse({
    id: getStringField(formData, "id"),
    question: getStringField(formData, "question"),
    answer: getStringField(formData, "answer"),
    sortOrder: getStringField(formData, "sortOrder"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  });

  if (!result.success) {
    throw new FaqValidationError(getFieldErrors(result.error));
  }

  return result.data;
}

export function parseFaqIdForm(formData: FormData) {
  const result = z.string().trim().uuid("FAQ inválida.").safeParse(getStringField(formData, "id"));

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "FAQ inválida.");
  }

  return result.data;
}

export function parseFaqMoveForm(formData: FormData): Readonly<{
  id: string;
  direction: FaqMoveDirection;
}> {
  const id = parseFaqIdForm(formData);
  const direction = getStringField(formData, "direction");

  if (direction !== "up" && direction !== "down") {
    throw new Error("Direção de ordenação inválida.");
  }

  return { id, direction };
}
