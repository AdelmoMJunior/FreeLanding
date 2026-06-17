import { afterEach, describe, expect, it } from "vitest";

import {
  ModuleValidationError,
  parseModuleForm,
  parseModuleIdForm,
  parseModuleMoveForm,
} from "@/lib/validations/module";

const validValues = {
  title: " Frente de caixa ",
  description: " Venda rápida no balcão com desconto autorizado. ",
  imagePath: " modules/frente-caixa.webp ",
  imageAlt: " Tela do caixa ",
  sortOrder: "2",
  isActive: "on",
};

const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

afterEach(() => {
  if (originalSupabaseUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    return;
  }

  process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
});

function formData(values: Record<string, string>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    data.set(key, value);
  });

  return data;
}

function expectModuleFieldError(values: Record<string, string>, field: keyof ModuleValidationError["fieldErrors"], message: string) {
  try {
    parseModuleForm(formData(values));
  } catch (error) {
    expect(error).toBeInstanceOf(ModuleValidationError);
    expect((error as ModuleValidationError).fieldErrors[field]).toBe(message);
    return;
  }

  throw new Error("Expected module validation to fail.");
}

describe("parseModuleForm", () => {
  it("trims values and normalizes active state", () => {
    const parsed = parseModuleForm(formData(validValues));

    expect(parsed).toEqual({
      id: undefined,
      title: "Frente de caixa",
      description: "Venda rápida no balcão com desconto autorizado.",
      imagePath: "modules/frente-caixa.webp",
      imageAlt: "Tela do caixa",
      sortOrder: 2,
      isActive: true,
    });
  });

  it("accepts an existing module id and inactive checkbox", () => {
    const parsed = parseModuleForm(
      formData({
        ...validValues,
        id: "26f7df84-4506-4f89-94cb-99d5b5d2b0ce",
        isActive: "",
      }),
    );

    expect(parsed.id).toBe("26f7df84-4506-4f89-94cb-99d5b5d2b0ce");
    expect(parsed.isActive).toBe(false);
  });

  it("rejects missing title", () => {
    expectModuleFieldError(
      {
        ...validValues,
        title: " ",
      },
      "title",
      "Informe o título do módulo.",
    );
  });

  it("rejects missing description", () => {
    expectModuleFieldError(
      {
        ...validValues,
        description: " ",
      },
      "description",
      "Informe a descrição do módulo.",
    );
  });

  it("rejects negative sort order", () => {
    expectModuleFieldError(
      {
        ...validValues,
        sortOrder: "-1",
      },
      "sortOrder",
      "A ordem não pode ser negativa.",
    );
  });

  it("rejects blank sort order", () => {
    expect(() =>
      parseModuleForm(
        formData({
          ...validValues,
          sortOrder: " ",
        }),
      ),
    ).toThrow("Informe uma ordem numérica.");
  });

  it("rejects unsafe image paths", () => {
    expect(() =>
      parseModuleForm(
        formData({
          ...validValues,
          imagePath: "../secret.png",
        }),
      ),
    ).toThrow("Use uma imagem relativa segura ou uma imagem enviada pelo admin.");
  });

  it("accepts a blank image path", () => {
    const parsed = parseModuleForm(formData({ ...validValues, imagePath: " " }));

    expect(parsed.imagePath).toBe("");
  });

  it("rejects unsafe image URL schemes", () => {
    ["javascript:alert(1)", "data:image/svg+xml,<svg>", "file:///etc/passwd"].forEach((imagePath) => {
      expect(() => parseModuleForm(formData({ ...validValues, imagePath }))).toThrow(
        "Use uma imagem relativa segura ou uma imagem enviada pelo admin.",
      );
    });
  });

  it("rejects external image URLs that next/image cannot render", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";

    expect(() =>
      parseModuleForm(
        formData({
          ...validValues,
          imagePath: "https://cdn.example.com/module.webp",
        }),
      ),
    ).toThrow("Use uma imagem relativa segura ou uma imagem enviada pelo admin.");
  });

  it("accepts configured Supabase storage image URLs", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";

    const parsed = parseModuleForm(
      formData({
        ...validValues,
        imagePath: "https://project.supabase.co/storage/v1/object/public/landing-images/landing-pages/page-id/module.webp",
      }),
    );

    expect(parsed.imagePath).toBe(
      "https://project.supabase.co/storage/v1/object/public/landing-images/landing-pages/page-id/module.webp",
    );
  });

  it("rejects Supabase image URLs with embedded credentials", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";

    expect(() =>
      parseModuleForm(
        formData({
          ...validValues,
          imagePath: "https://token@project.supabase.co/storage/v1/object/public/landing-images/landing-pages/page-id/module.webp",
        }),
      ),
    ).toThrow("Use uma imagem relativa segura ou uma imagem enviada pelo admin.");
  });

  it("rejects encoded traversal and backslash image paths", () => {
    [
      "%2e%2e/secret.png",
      "/images/%2e%2e/secret.png",
      "images/%5csecret.png",
      "%2525252e%2525252e/secret.png",
      "images/%2525255csecret.png",
      "%2525252f%2525252fcdn.example.com/image.png",
    ].forEach((imagePath) => {
      expect(() =>
        parseModuleForm(
          formData({
            ...validValues,
            imagePath,
          }),
        ),
      ).toThrow("Use uma imagem relativa segura ou uma imagem enviada pelo admin.");
    });
  });
});

describe("module action id parsers", () => {
  it("parses module ids and move directions", () => {
    const id = "26f7df84-4506-4f89-94cb-99d5b5d2b0ce";

    expect(parseModuleIdForm(formData({ id }))).toBe(id);
    expect(parseModuleMoveForm(formData({ id, direction: "up" }))).toEqual({
      id,
      direction: "up",
    });
  });

  it("rejects invalid ids and move directions", () => {
    expect(() => parseModuleIdForm(formData({ id: "module-1" }))).toThrow("Módulo inválido.");
    expect(() =>
      parseModuleMoveForm(
        formData({
          id: "26f7df84-4506-4f89-94cb-99d5b5d2b0ce",
          direction: "left",
        }),
      ),
    ).toThrow("Direção de ordenação inválida.");
  });
});
