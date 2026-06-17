import { z } from "zod";

import type { LeadStatus } from "@/types/database";

export const LEAD_HONEYPOT_FIELD = "website";

export type LeadSubmissionValues = Readonly<{
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
}>;

export type LeadSubmissionField = keyof LeadSubmissionValues;
export type LeadSubmissionFieldErrors = Partial<Record<LeadSubmissionField, string>>;

export type LeadStatusUpdateValues = Readonly<{
  id: string;
  status: LeadStatus;
}>;

export type LeadAdminUpdateValues = LeadStatusUpdateValues &
  Readonly<{
    adminNotes: string;
  }>;

export type ParsedLeadSubmission =
  | Readonly<{
      status: "valid";
      values: LeadSubmissionValues;
    }>
  | Readonly<{
      status: "spam";
    }>;

export class LeadValidationError extends Error {
  readonly fieldErrors: LeadSubmissionFieldErrors;

  constructor(fieldErrors: LeadSubmissionFieldErrors) {
    super(Object.values(fieldErrors)[0] ?? "Lead inválido.");
    this.name = "LeadValidationError";
    this.fieldErrors = fieldErrors;
  }
}

const optionalTrimmedText = (maxLength: number, message: string) =>
  z
    .string()
    .trim()
    .max(maxLength, message)
    .transform((value) => (value ? value : null));

const phoneSchema = z
  .string()
  .trim()
  .max(40, "O telefone não pode passar de 40 caracteres.")
  .transform((value, context) => {
    if (!value) {
      return null;
    }

    const digits = value.replace(/\D/g, "");

    if (digits.length < 10 || digits.length > 15) {
      context.addIssue({
        code: "custom",
        message: "Informe um telefone com DDD.",
      });

      return z.NEVER;
    }

    return value;
  });

const leadSubmissionSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome.").max(80, "O nome não pode passar de 80 caracteres."),
  email: z
    .string()
    .trim()
    .max(254, "O e-mail não pode passar de 254 caracteres.")
    .transform((value) => value.toLowerCase())
    .refine((value) => z.string().email().safeParse(value).success, "Informe um e-mail válido."),
  phone: phoneSchema,
  company: optionalTrimmedText(100, "A empresa não pode passar de 100 caracteres."),
  message: z
    .string()
    .trim()
    .max(1000, "A mensagem não pode passar de 1000 caracteres."),
});

const leadStatusSchema = z.enum(["new", "contacted", "closed", "spam"], {
  error: "Status de lead inválido.",
});

function getStringField(input: unknown, field: string) {
  if (!input || typeof input !== "object") {
    return "";
  }

  const value = (input as Record<string, unknown>)[field];

  return typeof value === "string" ? value : "";
}

function getFormDataString(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

function getFieldErrors(error: z.ZodError): LeadSubmissionFieldErrors {
  const fieldErrors: LeadSubmissionFieldErrors = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (typeof field === "string" && field in leadSubmissionSchema.shape) {
      const key = field as LeadSubmissionField;
      fieldErrors[key] ??= issue.message;
    }
  });

  return fieldErrors;
}

export function parseLeadSubmission(input: unknown): ParsedLeadSubmission {
  if (getStringField(input, LEAD_HONEYPOT_FIELD).trim()) {
    return { status: "spam" };
  }

  const result = leadSubmissionSchema.safeParse({
    name: getStringField(input, "name"),
    email: getStringField(input, "email"),
    phone: getStringField(input, "phone"),
    company: getStringField(input, "company"),
    message: getStringField(input, "message"),
  });

  if (!result.success) {
    throw new LeadValidationError(getFieldErrors(result.error));
  }

  return {
    status: "valid",
    values: result.data,
  };
}

export function parseLeadStatusUpdateForm(formData: FormData): LeadStatusUpdateValues {
  const idResult = z.string().trim().uuid("Lead inválido.").safeParse(getFormDataString(formData, "id"));

  if (!idResult.success) {
    throw new Error(idResult.error.issues[0]?.message ?? "Lead inválido.");
  }

  const statusResult = leadStatusSchema.safeParse(getFormDataString(formData, "status"));

  if (!statusResult.success) {
    throw new Error(statusResult.error.issues[0]?.message ?? "Status de lead inválido.");
  }

  return {
    id: idResult.data,
    status: statusResult.data,
  };
}

export function parseLeadAdminUpdateForm(formData: FormData): LeadAdminUpdateValues {
  const statusUpdate = parseLeadStatusUpdateForm(formData);
  const adminNotes = getFormDataString(formData, "adminNotes").trim();

  if (adminNotes.length > 2000) {
    throw new Error("A anotação não pode passar de 2000 caracteres.");
  }

  return {
    ...statusUpdate,
    adminNotes,
  };
}
