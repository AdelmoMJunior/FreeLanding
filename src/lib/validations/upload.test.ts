import { describe, expect, it } from "vitest";

import {
  ImageUploadValidationError,
  MAX_IMAGE_UPLOAD_SIZE_BYTES,
  parseImageUploadFormData,
  validateImageUploadFile,
} from "@/lib/validations/upload";
import { createLandingImageStoragePath } from "@/lib/storage/image-path";

const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const jpegSignature = [0xff, 0xd8, 0xff, 0xdb];
const webpSignature = [0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50];

function imageFile(bytes: number[], name: string, type: string) {
  return new File([new Uint8Array(bytes)], name, { type });
}

function imageFileAtMaxSize(signature: number[], name: string, type: string) {
  const bytes = new Uint8Array(MAX_IMAGE_UPLOAD_SIZE_BYTES);
  bytes.set(signature);

  return new File([bytes], name, { type });
}

describe("validateImageUploadFile", () => {
  it("accepts JPEG, PNG and WebP files with matching signatures", async () => {
    await expect(validateImageUploadFile(imageFile(jpegSignature, "caixa.jpg", "image/jpeg"))).resolves.toEqual({
      extension: "jpg",
      mimeType: "image/jpeg",
      sizeBytes: jpegSignature.length,
    });
    await expect(validateImageUploadFile(imageFile(pngSignature, "caixa.png", "image/png"))).resolves.toEqual({
      extension: "png",
      mimeType: "image/png",
      sizeBytes: pngSignature.length,
    });
    await expect(validateImageUploadFile(imageFile(webpSignature, "caixa.webp", "image/webp"))).resolves.toEqual({
      extension: "webp",
      mimeType: "image/webp",
      sizeBytes: webpSignature.length,
    });
  });

  it("rejects SVG even when a file is present", async () => {
    await expect(
      validateImageUploadFile(imageFile([0x3c, 0x73, 0x76, 0x67], "icon.svg", "image/svg+xml")),
    ).rejects.toThrow(ImageUploadValidationError);
  });

  it("rejects unsupported image MIME types", async () => {
    await expect(
      validateImageUploadFile(imageFile([0x47, 0x49, 0x46, 0x38], "animado.gif", "image/gif")),
    ).rejects.toThrow("Envie uma imagem JPEG, PNG ou WebP.");
  });

  it("rejects empty image files", async () => {
    await expect(validateImageUploadFile(new File([], "vazio.png", { type: "image/png" }))).rejects.toThrow(
      "Envie uma imagem com conteúdo.",
    );
  });

  it("accepts files exactly at the maximum size", async () => {
    await expect(validateImageUploadFile(imageFileAtMaxSize(pngSignature, "limite.png", "image/png"))).resolves.toEqual({
      extension: "png",
      mimeType: "image/png",
      sizeBytes: MAX_IMAGE_UPLOAD_SIZE_BYTES,
    });
  });

  it("rejects files whose bytes do not match the declared MIME type", async () => {
    await expect(
      validateImageUploadFile(imageFile([0x3c, 0x73, 0x76, 0x67], "fake.png", "image/png")),
    ).rejects.toThrow("O arquivo não parece ser uma imagem válida.");
  });

  it("rejects files above the maximum size", async () => {
    const oversizedBytes = new Uint8Array(MAX_IMAGE_UPLOAD_SIZE_BYTES + 1);

    await expect(
      validateImageUploadFile(new File([oversizedBytes], "grande.png", { type: "image/png" })),
    ).rejects.toThrow("A imagem deve ter no máximo 5 MB.");
  });
});

describe("parseImageUploadFormData", () => {
  it("returns a validated file and trimmed alt text", async () => {
    const formData = new FormData();
    const file = imageFile(pngSignature, "../produto.png", "image/png");

    formData.set("file", file);
    formData.set("altText", " Tela do módulo ");

    await expect(parseImageUploadFormData(formData)).resolves.toEqual({
      file,
      altText: "Tela do módulo",
      extension: "png",
      mimeType: "image/png",
      sizeBytes: pngSignature.length,
    });
  });
});

describe("createLandingImageStoragePath", () => {
  it("generates a server-controlled path without using the original filename", () => {
    expect(
      createLandingImageStoragePath({
        landingPageId: "26f7df84-4506-4f89-94cb-99d5b5d2b0ce",
        randomId: "1f3f5a33-1234-4e7d-9e5f-cd2b9aefc001",
        extension: "webp",
      }),
    ).toBe("landing-pages/26f7df84-4506-4f89-94cb-99d5b5d2b0ce/1f3f5a33-1234-4e7d-9e5f-cd2b9aefc001.webp");
  });
});
