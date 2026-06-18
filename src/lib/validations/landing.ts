import { z } from "zod";

import { safeImagePathOrNull } from "@/lib/landing/safe-image";
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
  companyName: string;
  logoPath: string;
  faviconPath: string;
  leadFormTitle: string;
  leadFormDescription: string;
  leadFormSubmitLabel: string;
  leadFormSuccessTitle: string;
  leadFormSuccessMessage: string;
  leadFormSuccessDismissLabel: string;
  leadFormRequiredLabel: string;
  leadFormNameLabel: string;
  leadFormEmailLabel: string;
  leadFormPhoneLabel: string;
  leadFormPhoneHelper: string;
  leadFormCompanyLabel: string;
  leadFormMessageLabel: string;
  leadFormMessageHelper: string;
  leadFormMessagePlaceholder: string;
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

const optionalPublicText = (maxLength: number) =>
  z.string().trim().max(maxLength, `Use no máximo ${maxLength} caracteres.`);

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

const rootImagePathPattern = /^\/(?!api\/|admin\/)[^?#]+\.(?:jpe?g|png|webp|svg|ico)$/i;

const optionalImagePathSchema = z
  .string()
  .trim()
  .max(512, "O caminho não pode passar de 512 caracteres.")
  .refine((value) => !value || (safeImagePathOrNull(value) === value && (!value.startsWith("/") || rootImagePathPattern.test(value))), {
    message: "Use uma imagem enviada pelo painel ou um caminho começando com /.",
  });

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
  companyName: requiredText("Informe o nome da marca.", 80),
  logoPath: optionalImagePathSchema,
  faviconPath: optionalImagePathSchema,
  leadFormTitle: requiredText("Informe o título do formulário.", 80),
  leadFormDescription: requiredText("Informe a descrição do formulário.", 220),
  leadFormSubmitLabel: requiredText("Informe o texto do botão do formulário.", 48),
  leadFormSuccessTitle: optionalPublicText(80),
  leadFormSuccessMessage: requiredText("Informe a mensagem de sucesso do formulário.", 220),
  leadFormSuccessDismissLabel: requiredText("Informe o texto do botão de confirmação.", 24),
  leadFormRequiredLabel: optionalPublicText(32),
  leadFormNameLabel: requiredText("Informe o rótulo do campo de nome.", 48),
  leadFormEmailLabel: requiredText("Informe o rótulo do campo de e-mail.", 48),
  leadFormPhoneLabel: requiredText("Informe o rótulo do campo de telefone.", 48),
  leadFormPhoneHelper: optionalPublicText(140),
  leadFormCompanyLabel: requiredText("Informe o rótulo do campo de empresa.", 48),
  leadFormMessageLabel: requiredText("Informe o rótulo do campo de mensagem.", 48),
  leadFormMessageHelper: optionalPublicText(160),
  leadFormMessagePlaceholder: optionalPublicText(180),
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
    companyName: getStringField(formData, "companyName"),
    logoPath: getStringField(formData, "logoPath"),
    faviconPath: getStringField(formData, "faviconPath"),
    leadFormTitle: getStringField(formData, "leadFormTitle"),
    leadFormDescription: getStringField(formData, "leadFormDescription"),
    leadFormSubmitLabel: getStringField(formData, "leadFormSubmitLabel"),
    leadFormSuccessTitle: getStringField(formData, "leadFormSuccessTitle"),
    leadFormSuccessMessage: getStringField(formData, "leadFormSuccessMessage"),
    leadFormSuccessDismissLabel: getStringField(formData, "leadFormSuccessDismissLabel"),
    leadFormRequiredLabel: getStringField(formData, "leadFormRequiredLabel"),
    leadFormNameLabel: getStringField(formData, "leadFormNameLabel"),
    leadFormEmailLabel: getStringField(formData, "leadFormEmailLabel"),
    leadFormPhoneLabel: getStringField(formData, "leadFormPhoneLabel"),
    leadFormPhoneHelper: getStringField(formData, "leadFormPhoneHelper"),
    leadFormCompanyLabel: getStringField(formData, "leadFormCompanyLabel"),
    leadFormMessageLabel: getStringField(formData, "leadFormMessageLabel"),
    leadFormMessageHelper: getStringField(formData, "leadFormMessageHelper"),
    leadFormMessagePlaceholder: getStringField(formData, "leadFormMessagePlaceholder"),
  });

  if (!result.success) {
    throw new LandingSettingsValidationError(getFieldErrors(result.error));
  }

  return result.data;
}
