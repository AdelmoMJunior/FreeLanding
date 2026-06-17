import { describe, expect, it } from "vitest";

import {
  FaqValidationError,
  parseFaqForm,
  parseFaqIdForm,
  parseFaqMoveForm,
} from "@/lib/validations/faq";

const validValues = {
  question: " O sistema atende lojas com venda no balcão? ",
  answer: " Sim. A proposta apoia vendas rápidas, estoque e caixa durante o expediente. ",
  sortOrder: "10",
  isActive: "on",
};

function formData(values: Record<string, string>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    data.set(key, value);
  });

  return data;
}

describe("parseFaqForm", () => {
  it("trims values and normalizes active state", () => {
    const parsed = parseFaqForm(formData(validValues));

    expect(parsed).toEqual({
      id: undefined,
      question: "O sistema atende lojas com venda no balcão?",
      answer: "Sim. A proposta apoia vendas rápidas, estoque e caixa durante o expediente.",
      sortOrder: 10,
      isActive: true,
    });
  });

  it("accepts an existing faq id and inactive checkbox", () => {
    const parsed = parseFaqForm(
      formData({
        ...validValues,
        id: "26f7df84-4506-4f89-94cb-99d5b5d2b0ce",
        isActive: "",
      }),
    );

    expect(parsed.id).toBe("26f7df84-4506-4f89-94cb-99d5b5d2b0ce");
    expect(parsed.isActive).toBe(false);
  });

  it("rejects missing question and negative sort order", () => {
    expect(() =>
      parseFaqForm(
        formData({
          ...validValues,
          question: " ",
          sortOrder: "-1",
        }),
      ),
    ).toThrow(FaqValidationError);
  });

  it("rejects blank sort order", () => {
    expect(() =>
      parseFaqForm(
        formData({
          ...validValues,
          sortOrder: " ",
        }),
      ),
    ).toThrow("Informe uma ordem numérica.");
  });
});

describe("faq action id parsers", () => {
  it("parses faq ids and move directions", () => {
    const id = "26f7df84-4506-4f89-94cb-99d5b5d2b0ce";

    expect(parseFaqIdForm(formData({ id }))).toBe(id);
    expect(parseFaqMoveForm(formData({ id, direction: "up" }))).toEqual({
      id,
      direction: "up",
    });
  });

  it("rejects invalid ids and move directions", () => {
    expect(() => parseFaqIdForm(formData({ id: "faq-1" }))).toThrow("FAQ inválida.");
    expect(() =>
      parseFaqMoveForm(
        formData({
          id: "26f7df84-4506-4f89-94cb-99d5b5d2b0ce",
          direction: "left",
        }),
      ),
    ).toThrow("Direção de ordenação inválida.");
  });
});
