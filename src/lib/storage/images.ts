import "server-only";

import { randomUUID } from "node:crypto";

import { ensureEditableLandingPage } from "@/lib/landing/admin-page";
import { createLandingImageStoragePath } from "@/lib/storage/image-path";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ParsedImageUpload } from "@/lib/validations/upload";

export const LANDING_IMAGE_BUCKET = "landing-images";
const landingImagesPublicPath = `/storage/v1/object/public/${LANDING_IMAGE_BUCKET}/`;

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

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;

function getConfiguredSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function getStoragePathFromPublicUrl(value: string | null | undefined) {
  const trimmed = value?.trim();
  const supabaseUrl = getConfiguredSupabaseUrl();

  if (!trimmed || !supabaseUrl) {
    return null;
  }

  try {
    const url = new URL(trimmed);

    if (
      url.protocol !== supabaseUrl.protocol ||
      url.hostname !== supabaseUrl.hostname ||
      url.port !== supabaseUrl.port ||
      url.username !== "" ||
      url.password !== "" ||
      !url.pathname.startsWith(landingImagesPublicPath)
    ) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(landingImagesPublicPath.length));
  } catch {
    return null;
  }
}

async function hasLandingImageReference(supabase: SupabaseAdminClient, value: string) {
  const [logoResult, faviconResult, moduleResult] = await Promise.all([
    supabase.from("landing_settings").select("landing_page_id").eq("logo_path", value).limit(1),
    supabase.from("landing_settings").select("landing_page_id").eq("favicon_path", value).limit(1),
    supabase.from("system_modules").select("id").eq("image_path", value).limit(1),
  ]);

  return Boolean(logoResult.data?.length || faviconResult.data?.length || moduleResult.data?.length);
}

export async function deleteLandingImageByPublicUrl(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  const path = getStoragePathFromPublicUrl(value);

  if (!path || path.includes("..") || path.includes("\\")) {
    return;
  }

  const supabase = createSupabaseAdminClient();

  if (await hasLandingImageReference(supabase, trimmed)) {
    return;
  }

  await supabase.storage.from(LANDING_IMAGE_BUCKET).remove([path]);
  await supabase.from("media_assets").delete().eq("bucket", LANDING_IMAGE_BUCKET).eq("path", path);
}
