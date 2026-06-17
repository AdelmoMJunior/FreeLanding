import { describe, expect, it } from "vitest";

import {
  BenefitValidationError,
  parseBenefitForm,
  parseBenefitIdForm,
  parseBenefitMoveForm,
} from "@/lib/validations/benefit";

const validValues = {
  title: " Menos retrabalho ",
  description: " Integra balcão, estoque e financeiro para reduzir conferências manuais. ",
  iconName: " check-circle ",
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

describe("parseBenefitForm", () => {
  it("trims values and normalizes active state", () => {
    const parsed = parseBenefitForm(formData(validValues));

    expect(parsed).toEqual({
      id: undefined,
      title: "Menos retrabalho",
      description: "Integra balcão, estoque e financeiro para reduzir conferências manuais.",
      iconName: "check-circle",
      sortOrder: 10,
      isActive: true,
    });
  });

  it("accepts an existing benefit id and inactive checkbox", () => {
    const parsed = parseBenefitForm(
      formData({
        ...validValues,
        id: "26f7df84-4506-4f89-94cb-99d5b5d2b0ce",
        isActive: "",
      }),
    );

    expect(parsed.id).toBe("26f7df84-4506-4f89-94cb-99d5b5d2b0ce");
    expect(parsed.isActive).toBe(false);
  });

  it("rejects missing title and negative sort order", () => {
    expect(() =>
      parseBenefitForm(
        formData({
          ...validValues,
          title: " ",
          sortOrder: "-1",
        }),
      ),
    ).toThrow(BenefitValidationError);
  });

  it("rejects blank sort order", () => {
    expect(() =>
      parseBenefitForm(
        formData({
          ...validValues,
          sortOrder: " ",
        }),
      ),
    ).toThrow("Informe uma ordem numérica.");
  });

  it("rejects unsafe icon names", () => {
    expect(() =>
      parseBenefitForm(
        formData({
          ...validValues,
          iconName: "../icon",
        }),
      ),
    ).toThrow("Use apenas letras, números e hífens no ícone.");
  });
});

describe("benefit action id parsers", () => {
  it("parses benefit ids and move directions", () => {
    const id = "26f7df84-4506-4f89-94cb-99d5b5d2b0ce";

    expect(parseBenefitIdForm(formData({ id }))).toBe(id);
    expect(parseBenefitMoveForm(formData({ id, direction: "down" }))).toEqual({
      id,
      direction: "down",
    });
  });

  it("rejects invalid ids and move directions", () => {
    expect(() => parseBenefitIdForm(formData({ id: "benefit-1" }))).toThrow("Benefício inválido.");
    expect(() =>
      parseBenefitMoveForm(
        formData({
          id: "26f7df84-4506-4f89-94cb-99d5b5d2b0ce",
          direction: "left",
        }),
      ),
    ).toThrow("Direção de ordenação inválida.");
  });
});
