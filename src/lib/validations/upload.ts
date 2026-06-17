import type { LandingImageExtension } from "@/lib/storage/image-path";

export const MAX_IMAGE_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

type AcceptedImageMimeType = "image/jpeg" | "image/png" | "image/webp";

type ValidatedImageUpload = Readonly<{
  extension: LandingImageExtension;
  mimeType: AcceptedImageMimeType;
  sizeBytes: number;
}>;

export type ParsedImageUpload = ValidatedImageUpload &
  Readonly<{
    file: File;
    altText: string;
  }>;

export class ImageUploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageUploadValidationError";
  }
}

const acceptedImages = {
  "image/jpeg": {
    extension: "jpg",
    matches(bytes: Uint8Array) {
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    },
  },
  "image/png": {
    extension: "png",
    matches(bytes: Uint8Array) {
      return (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      );
    },
  },
  "image/webp": {
    extension: "webp",
    matches(bytes: Uint8Array) {
      return (
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
      );
    },
  },
} satisfies Record<AcceptedImageMimeType, Readonly<{
  extension: LandingImageExtension;
  matches(bytes: Uint8Array): boolean;
}>>;

function getStringField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

function getAcceptedImage(type: string) {
  return acceptedImages[type as AcceptedImageMimeType];
}

export async function validateImageUploadFile(file: File): Promise<ValidatedImageUpload> {
  const acceptedImage = getAcceptedImage(file.type);

  if (!acceptedImage) {
    throw new ImageUploadValidationError("Envie uma imagem JPEG, PNG ou WebP.");
  }

  if (file.size <= 0) {
    throw new ImageUploadValidationError("Envie uma imagem com conteúdo.");
  }

  if (file.size > MAX_IMAGE_UPLOAD_SIZE_BYTES) {
    throw new ImageUploadValidationError("A imagem deve ter no máximo 5 MB.");
  }

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (!acceptedImage.matches(header)) {
    throw new ImageUploadValidationError("O arquivo não parece ser uma imagem válida.");
  }

  return {
    extension: acceptedImage.extension,
    mimeType: file.type as AcceptedImageMimeType,
    sizeBytes: file.size,
  };
}

export async function parseImageUploadFormData(formData: FormData): Promise<ParsedImageUpload> {
  const file = formData.get("file");

  if (!isUploadFile(file)) {
    throw new ImageUploadValidationError("Selecione uma imagem para enviar.");
  }

  const validation = await validateImageUploadFile(file);
  const altText = getStringField(formData, "altText").trim().slice(0, 120);

  return {
    file,
    altText,
    ...validation,
  };
}
