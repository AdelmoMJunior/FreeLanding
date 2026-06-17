import { describe, expect, it } from "vitest";

import {
  LeadValidationError,
  parseLeadStatusUpdateForm,
  parseLeadSubmission,
} from "@/lib/validations/lead";

const validPayload = {
  name: " Maria Oliveira ",
  email: " MARIA@EXAMPLE.COM ",
  phone: " (11) 98888-7777 ",
  company: " Mercado Central ",
  message: " Quero organizar melhor o caixa e o estoque da loja. ",
  website: "",
};

describe("parseLeadSubmission", () => {
  it("trims and normalizes a valid lead", () => {
    const parsed = parseLeadSubmission(validPayload);

    expect(parsed).toEqual({
      status: "valid",
      values: {
        name: "Maria Oliveira",
        email: "maria@example.com",
        phone: "(11) 98888-7777",
        company: "Mercado Central",
        message: "Quero organizar melhor o caixa e o estoque da loja.",
      },
    });
  });

  it("converts blank optional fields to null", () => {
    const parsed = parseLeadSubmission({
      ...validPayload,
      phone: " ",
      company: "",
    });

    expect(parsed.status).toBe("valid");
    if (parsed.status === "valid") {
      expect(parsed.values.phone).toBeNull();
      expect(parsed.values.company).toBeNull();
    }
  });

  it("accepts a blank message", () => {
    const parsed = parseLeadSubmission({
      ...validPayload,
      message: " ",
    });

    expect(parsed.status).toBe("valid");
    if (parsed.status === "valid") {
      expect(parsed.values.message).toBe("");
    }
  });

  it("returns spam status when the honeypot field is filled", () => {
    expect(parseLeadSubmission({ ...validPayload, website: "https://spam.example" })).toEqual({
      status: "spam",
    });
  });

  it("keeps honeypot submissions silent even when visible fields are invalid", () => {
    expect(
      parseLeadSubmission({
        name: "",
        email: "email-invalido",
        phone: "123",
        company: "",
        message: "a".repeat(1001),
        website: "bot preenchido",
      }),
    ).toEqual({ status: "spam" });
  });

  it("accepts phone numbers at the supported digit boundaries", () => {
    expect(parseLeadSubmission({ ...validPayload, phone: "1199999999" }).status).toBe("valid");
    expect(parseLeadSubmission({ ...validPayload, phone: "551199999999999" }).status).toBe("valid");
  });

  it("rejects phone numbers outside the supported digit boundaries", () => {
    ["119999999", "5511999999999999"].forEach((phone) => {
      expect(() => parseLeadSubmission({ ...validPayload, phone })).toThrow("Informe um telefone com DDD.");
    });
  });

  it("reports field errors for invalid public fields", () => {
    expect(() =>
      parseLeadSubmission({
        ...validPayload,
        name: " ",
        email: "email-invalido",
        phone: "123",
        message: "a".repeat(1001),
      }),
    ).toThrow(LeadValidationError);

    try {
      parseLeadSubmission({
        ...validPayload,
        name: " ",
        email: "email-invalido",
        phone: "123",
        message: "a".repeat(1001),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(LeadValidationError);
      expect((error as LeadValidationError).fieldErrors).toEqual({
        name: "Informe seu nome.",
        email: "Informe um e-mail válido.",
        phone: "Informe um telefone com DDD.",
        message: "A mensagem não pode passar de 1000 caracteres.",
      });
    }
  });
});

function statusFormData(values: Record<string, string>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    data.set(key, value);
  });

  return data;
}

describe("parseLeadStatusUpdateForm", () => {
  it("parses a valid lead id and status", () => {
    expect(
      parseLeadStatusUpdateForm(
        statusFormData({
          id: "26f7df84-4506-4f89-94cb-99d5b5d2b0ce",
          status: "contacted",
        }),
      ),
    ).toEqual({
      id: "26f7df84-4506-4f89-94cb-99d5b5d2b0ce",
      status: "contacted",
    });
  });

  it("rejects invalid lead ids", () => {
    expect(() =>
      parseLeadStatusUpdateForm(
        statusFormData({
          id: "lead-1",
          status: "new",
        }),
      ),
    ).toThrow("Lead inválido.");
  });

  it("rejects invalid lead statuses", () => {
    expect(() =>
      parseLeadStatusUpdateForm(
        statusFormData({
          id: "26f7df84-4506-4f89-94cb-99d5b5d2b0ce",
          status: "ignored",
        }),
      ),
    ).toThrow("Status de lead inválido.");
  });
});

describe("parseLeadAdminUpdateForm", () => {
  it("parses status and internal notes", async () => {
    const { parseLeadAdminUpdateForm } = await import("@/lib/validations/lead");

    expect(
      parseLeadAdminUpdateForm(
        statusFormData({
          id: "26f7df84-4506-4f89-94cb-99d5b5d2b0ce",
          status: "closed",
          adminNotes: " Cliente pediu retorno no fim do mês. ",
        }),
      ),
    ).toEqual({
      id: "26f7df84-4506-4f89-94cb-99d5b5d2b0ce",
      status: "closed",
      adminNotes: "Cliente pediu retorno no fim do mês.",
    });
  });

  it("rejects overly long internal notes", async () => {
    const { parseLeadAdminUpdateForm } = await import("@/lib/validations/lead");

    expect(() =>
      parseLeadAdminUpdateForm(
        statusFormData({
          id: "26f7df84-4506-4f89-94cb-99d5b5d2b0ce",
          status: "new",
          adminNotes: "a".repeat(2001),
        }),
      ),
    ).toThrow("A anotação não pode passar de 2000 caracteres.");
  });
});
