import { describe, expect, it } from "vitest";

import {
  LandingSettingsValidationError,
  parseLandingSettingsForm,
} from "@/lib/validations/landing";
import { landingContent } from "@/lib/landing/static-content";

const validValues = {
  seoTitle: "Landing profissional para captar contatos",
  seoDescription: "Página clara para apresentar uma oferta e receber contatos qualificados.",
  headline: "Apresente sua oferta com clareza",
  subheadline: "Organize informações importantes em uma página simples para o visitante entender o próximo passo.",
  primaryCtaLabel: "Falar com especialista",
  primaryCtaUrl: "#contato",
  secondaryCtaLabel: "Ver módulos",
  secondaryCtaUrl: "/#modulos",
  ctaTitle: "Vamos conversar sobre sua necessidade?",
  ctaDescription: "Envie seus dados para receber um retorno objetivo da equipe comercial.",
  whatsappNumber: "+55 (11) 98888-7777",
  whatsappMessage: "Olá, quero saber mais sobre a oferta.",
  contactEmail: " COMERCIAL@Example.COM ",
  contactPhone: " (11) 98888-7777 ",
  brandColor: " #10B981 ",
  notifyLeadsByEmail: "on",
  leadNotificationEmail: " LEADS@Example.COM ",
  companyName: " Minha Marca ",
  logoPath: " /logo.png ",
  faviconPath: " /favicon.png ",
  leadFormTitle: " Fale com a equipe ",
  leadFormDescription: " Envie seus dados para receber um retorno objetivo. ",
  leadFormSubmitLabel: " Enviar contato ",
  leadFormSuccessTitle: " Mensagem enviada ",
  leadFormSuccessMessage: " Recebemos seus dados e entraremos em contato. ",
  leadFormSuccessDismissLabel: " OK ",
  leadFormRequiredLabel: " obrigatório ",
  leadFormNameLabel: " Nome ",
  leadFormEmailLabel: " E-mail ",
  leadFormPhoneLabel: " WhatsApp ",
  leadFormPhoneHelper: " Opcional para retorno rápido. ",
  leadFormCompanyLabel: " Empresa ",
  leadFormMessageLabel: " Mensagem ",
  leadFormMessageHelper: " Opcional para adiantar o assunto. ",
  leadFormMessagePlaceholder: " Conte rapidamente o que procura. ",
};

function formData(values: Record<string, string>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    data.set(key, value);
  });

  return data;
}

function expectLandingFieldErrors(values: Record<string, string>, expected: Record<string, string>) {
  try {
    parseLandingSettingsForm(formData(values));
  } catch (error) {
    expect(error).toBeInstanceOf(LandingSettingsValidationError);
    expect((error as LandingSettingsValidationError).fieldErrors).toMatchObject(expected);
    return;
  }

  throw new Error("Expected landing settings validation to fail.");
}

describe("parseLandingSettingsForm", () => {
  it("trims text fields and normalizes contact values", () => {
    const parsed = parseLandingSettingsForm(formData(validValues));

    expect(parsed).toEqual({
      seoTitle: "Landing profissional para captar contatos",
      seoDescription: "Página clara para apresentar uma oferta e receber contatos qualificados.",
      headline: "Apresente sua oferta com clareza",
      subheadline: "Organize informações importantes em uma página simples para o visitante entender o próximo passo.",
      primaryCtaLabel: "Falar com especialista",
      primaryCtaUrl: "#contato",
      secondaryCtaLabel: "Ver módulos",
      secondaryCtaUrl: "/#modulos",
      ctaTitle: "Vamos conversar sobre sua necessidade?",
      ctaDescription: "Envie seus dados para receber um retorno objetivo da equipe comercial.",
      whatsappNumber: "5511988887777",
      whatsappMessage: "Olá, quero saber mais sobre a oferta.",
      contactEmail: "comercial@example.com",
      contactPhone: "(11) 98888-7777",
      brandColor: "#10b981",
      notifyLeadsByEmail: true,
      leadNotificationEmail: "leads@example.com",
      companyName: "Minha Marca",
      logoPath: "/logo.png",
      faviconPath: "/favicon.png",
      leadFormTitle: "Fale com a equipe",
      leadFormDescription: "Envie seus dados para receber um retorno objetivo.",
      leadFormSubmitLabel: "Enviar contato",
      leadFormSuccessTitle: "Mensagem enviada",
      leadFormSuccessMessage: "Recebemos seus dados e entraremos em contato.",
      leadFormSuccessDismissLabel: "OK",
      leadFormRequiredLabel: "obrigatório",
      leadFormNameLabel: "Nome",
      leadFormEmailLabel: "E-mail",
      leadFormPhoneLabel: "WhatsApp",
      leadFormPhoneHelper: "Opcional para retorno rápido.",
      leadFormCompanyLabel: "Empresa",
      leadFormMessageLabel: "Mensagem",
      leadFormMessageHelper: "Opcional para adiantar o assunto.",
      leadFormMessagePlaceholder: "Conte rapidamente o que procura.",
    });
  });

  it("accepts empty optional contact and whatsapp fields", () => {
    const parsed = parseLandingSettingsForm(
      formData({
        ...validValues,
        whatsappNumber: "",
        whatsappMessage: "",
        contactEmail: "",
        contactPhone: "",
        notifyLeadsByEmail: "",
        leadNotificationEmail: "",
      }),
    );

    expect(parsed.whatsappNumber).toBe("");
    expect(parsed.whatsappMessage).toBe("");
    expect(parsed.contactEmail).toBe("");
    expect(parsed.contactPhone).toBe("");
    expect(parsed.notifyLeadsByEmail).toBe(false);
    expect(parsed.leadNotificationEmail).toBe("");
  });

  it("accepts empty optional form helper texts", () => {
    const parsed = parseLandingSettingsForm(
      formData({
        ...validValues,
        leadFormSuccessTitle: " ",
        leadFormRequiredLabel: " ",
        leadFormPhoneHelper: " ",
        leadFormMessageHelper: " ",
        leadFormMessagePlaceholder: " ",
      }),
    );

    expect(parsed.leadFormSuccessTitle).toBe("");
    expect(parsed.leadFormRequiredLabel).toBe("");
    expect(parsed.leadFormPhoneHelper).toBe("");
    expect(parsed.leadFormMessageHelper).toBe("");
    expect(parsed.leadFormMessagePlaceholder).toBe("");
  });

  it("requires a notification email only when lead email notifications are enabled", () => {
    expectLandingFieldErrors(
      {
        ...validValues,
        notifyLeadsByEmail: "on",
        leadNotificationEmail: " ",
      },
      {
        leadNotificationEmail: "Informe o e-mail que receberá os leads.",
      },
    );
  });

  it("rejects invalid brand colors", () => {
    expectLandingFieldErrors(
      {
        ...validValues,
        brandColor: "verde",
      },
      {
        brandColor: "Informe uma cor hexadecimal válida, por exemplo #10b981.",
      },
    );
  });

  it("rejects unsafe brand asset paths", () => {
    expectLandingFieldErrors(
      {
        ...validValues,
        logoPath: "https://cdn.example.com/logo.png",
        faviconPath: "javascript:alert(1)",
      },
      {
        logoPath: "Use uma imagem enviada pelo painel ou um caminho começando com /.",
        faviconPath: "Use uma imagem enviada pelo painel ou um caminho começando com /.",
      },
    );
  });

  it("accepts the current static fallback copy", () => {
    const parsed = parseLandingSettingsForm(
      formData({
        ...validValues,
        seoDescription: landingContent.hero.description,
        headline: landingContent.hero.title,
        subheadline: landingContent.hero.description,
      }),
    );

    expect(parsed.seoDescription).toBe(landingContent.hero.description);
    expect(parsed.subheadline).toBe(landingContent.hero.description);
  });

  it("rejects unsafe CTA URLs", () => {
    expectLandingFieldErrors(
      {
        ...validValues,
        primaryCtaUrl: "javascript:alert(1)",
        secondaryCtaUrl: "//example.com",
      },
      {
        primaryCtaUrl: "Use um link começando com #, /, http:// ou https://.",
        secondaryCtaUrl: "Use um link começando com #, /, http:// ou https://.",
      },
    );
  });

  it("rejects empty CTA URLs with field-specific errors", () => {
    expectLandingFieldErrors(
      {
        ...validValues,
        primaryCtaUrl: " ",
      },
      {
        primaryCtaUrl: "Informe o link do botão.",
      },
    );
  });

  it("rejects malformed whatsapp numbers", () => {
    expect(() =>
      parseLandingSettingsForm(
        formData({
          ...validValues,
          whatsappNumber: "telefone",
        }),
      ),
    ).toThrow("Informe um WhatsApp com DDD e número.");
  });
});
