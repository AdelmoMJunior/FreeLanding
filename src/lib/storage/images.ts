import "server-only";

import { randomUUID } from "node:crypto";

import { ensureEditableLandingPage } from "@/lib/landing/admin-page";
import { createLandingImageStoragePath } from "@/lib/storage/image-path";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ParsedImageUpload } from "@/lib/validations/upload";

export const LANDING_IMAGE_BUCKET = "landing-images";

type UploadLandingImageInput = ParsedImageUpload &
  Readonly<{
    uploadedBy: string;
  }>;

export async function uploadLandingImage({
  altText,
  extension,
  file,
  mimeType,
  sizeBytes,
  uploadedBy,
}: UploadLandingImageInput) {
  const supabase = createSupabaseAdminClient();
  const { pageId, error: pageError } = await ensureEditableLandingPage(supabase);

  if (pageError || !pageId) {
    throw new Error("Não foi possível localizar a landing principal.");
  }

  const path = createLandingImageStoragePath({
    landingPageId: pageId,
    randomId: randomUUID(),
    extension,
  });

  const { error: uploadError } = await supabase.storage
    .from(LANDING_IMAGE_BUCKET)
    .upload(path, file, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error("Não foi possível enviar a imagem.");
  }

  const { error: assetError } = await supabase.from("media_assets").insert({
    landing_page_id: pageId,
    bucket: LANDING_IMAGE_BUCKET,
    path,
    alt_text: altText,
    mime_type: mimeType,
    size_bytes: sizeBytes,
    uploaded_by: uploadedBy,
    is_public: true,
  });

  if (assetError) {
    await supabase.storage.from(LANDING_IMAGE_BUCKET).remove([path]);
    throw new Error("Não foi possível registrar a imagem.");
  }

  const { data } = supabase.storage.from(LANDING_IMAGE_BUCKET).getPublicUrl(path);

  return {
    bucket: LANDING_IMAGE_BUCKET,
    path,
    publicUrl: data.publicUrl,
  };
}
