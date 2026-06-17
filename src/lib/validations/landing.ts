import { z } from "zod";

import { isSafeLandingHref, safeLandingHrefOrFallback } from "@/lib/landing/safe-url";

export type LandingSettingsFormValues = Readonly<{
  seoTitle: string;
  seoDescription: string;
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  ctaTitle: string;
  ctaDescription: string;
  whatsappNumber: string;
  whatsappMessage: string;
  contactEmail: string;
  contactPhone: string;
  brandColor: string;
  notifyLeadsByEmail: boolean;
  leadNotificationEmail: string;
}>;

export type LandingSettingsField = keyof LandingSettingsFormValues;
export type LandingSettingsFieldErrors = Partial<Record<LandingSettingsField, string>>;

export class LandingSettingsValidationError extends Error {
  readonly fieldErrors: LandingSettingsFieldErrors;

  constructor(fieldErrors: LandingSettingsFieldErrors) {
    super(Object.values(fieldErrors)[0] ?? "Configurações inválidas.");
    this.name = "LandingSettingsValidationError";
    this.fieldErrors = fieldErrors;
  }
}

const requiredText = (message: string, maxLength: number) =>
  z.string().trim().min(1, message).max(maxLength, `Use no máximo ${maxLength} caracteres.`);

const ctaUrlSchema = z
  .string()
  .trim()
  .min(1, "Informe o link do botão.")
  .max(2048, "O link não pode passar de 2048 caracteres.")
  .refine(isSafeLandingHref, "Use um link começando com #, /, http:// ou https://.")
  .transform((value) => safeLandingHrefOrFallback(value, "#contato"));

const optionalEmailSchema = z
  .string()
  .trim()
  .max(254, "O e-mail não pode passar de 254 caracteres.")
  .transform((value) => value.toLowerCase())
  .refine((value) => !value || z.string().email().safeParse(value).success, {
    message: "Informe um e-mail válido.",
  });

const brandColorSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^#[0-9a-f]{6}$/, "Informe uma cor hexadecimal válida, por exemplo #10b981.");

const whatsappNumberSchema = z
  .string()
  .trim()
  .max(32, "O WhatsApp não pode passar de 32 caracteres.")
  .transform((value, context) => {
    const digits = value.replace(/\D/g, "");

    if (value && (digits.length < 10 || digits.length > 15)) {
      context.addIssue({
        code: "custom",
        message: "Informe um WhatsApp com DDD e número.",
      });

      return z.NEVER;
    }

    return digits;
  });

const landingSettingsSchema = z.object({
  seoTitle: requiredText("Informe o título de SEO.", 70),
  seoDescription: requiredText("Informe a descrição de SEO.", 320),
  headline: requiredText("Informe o título principal.", 140),
  subheadline: requiredText("Informe o texto de apoio do hero.", 320),
  primaryCtaLabel: requiredText("Informe o texto do botão principal.", 48),
  primaryCtaUrl: ctaUrlSchema,
  secondaryCtaLabel: requiredText("Informe o texto do botão secundário.", 48),
  secondaryCtaUrl: ctaUrlSchema,
  ctaTitle: requiredText("Informe o título da chamada final.", 140),
  ctaDescription: requiredText("Informe o texto da chamada final.", 360),
  whatsappNumber: whatsappNumberSchema,
  whatsappMessage: z.string().trim().max(220, "A mensagem do WhatsApp não pode passar de 220 caracteres."),
  contactEmail: optionalEmailSchema,
  contactPhone: z.string().trim().max(40, "O telefone não pode passar de 40 caracteres."),
  brandColor: brandColorSchema,
  notifyLeadsByEmail: z.boolean(),
  leadNotificationEmail: optionalEmailSchema,
}).superRefine((values, context) => {
  if (values.notifyLeadsByEmail && !values.leadNotificationEmail) {
    context.addIssue({
      code: "custom",
      path: ["leadNotificationEmail"],
      message: "Informe o e-mail que receberá os leads.",
    });
  }
});

function getStringField(formData: FormData, field: LandingSettingsField) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

function getFieldErrors(error: z.ZodError): LandingSettingsFieldErrors {
  const fieldErrors: LandingSettingsFieldErrors = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (typeof field === "string" && field in landingSettingsSchema.shape) {
      const key = field as LandingSettingsField;
      fieldErrors[key] ??= issue.message;
    }
  });

  return fieldErrors;
}

export function parseLandingSettingsForm(formData: FormData): LandingSettingsFormValues {
  const result = landingSettingsSchema.safeParse({
    seoTitle: getStringField(formData, "seoTitle"),
    seoDescription: getStringField(formData, "seoDescription"),
    headline: getStringField(formData, "headline"),
    subheadline: getStringField(formData, "subheadline"),
    primaryCtaLabel: getStringField(formData, "primaryCtaLabel"),
    primaryCtaUrl: getStringField(formData, "primaryCtaUrl"),
    secondaryCtaLabel: getStringField(formData, "secondaryCtaLabel"),
    secondaryCtaUrl: getStringField(formData, "secondaryCtaUrl"),
    ctaTitle: getStringField(formData, "ctaTitle"),
    ctaDescription: getStringField(formData, "ctaDescription"),
    whatsappNumber: getStringField(formData, "whatsappNumber"),
    whatsappMessage: getStringField(formData, "whatsappMessage"),
    contactEmail: getStringField(formData, "contactEmail"),
    contactPhone: getStringField(formData, "contactPhone"),
    brandColor: getStringField(formData, "brandColor"),
    notifyLeadsByEmail: formData.get("notifyLeadsByEmail") === "on" || formData.get("notifyLeadsByEmail") === "true",
    leadNotificationEmail: getStringField(formData, "leadNotificationEmail"),
  });

  if (!result.success) {
    throw new LandingSettingsValidationError(getFieldErrors(result.error));
  }

  return result.data;
}
