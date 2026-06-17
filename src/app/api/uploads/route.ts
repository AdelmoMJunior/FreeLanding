import { NextResponse } from "next/server";

import { resolveAdminAccess } from "@/lib/auth/access";
import { isContentLengthWithinLimit } from "@/lib/http/content-length";
import { isSameOriginRequest } from "@/lib/security/same-origin";
import { uploadLandingImage } from "@/lib/storage/images";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ImageUploadValidationError,
  MAX_IMAGE_UPLOAD_SIZE_BYTES,
  parseImageUploadFormData,
} from "@/lib/validations/upload";

export const runtime = "nodejs";

const MAX_UPLOAD_REQUEST_BYTES = MAX_IMAGE_UPLOAD_SIZE_BYTES + 64 * 1024;

async function getUploadAdminUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, status: 401 } as const;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const access = resolveAdminAccess({
    userId: user.id,
    profileRole: profile?.role,
  });

  if (access !== "allowed") {
    return { user: null, status: 403 } as const;
  }

  return { user, status: 200 } as const;
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request.headers)) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 403 });
  }

  if (!isContentLengthWithinLimit(request.headers, MAX_UPLOAD_REQUEST_BYTES)) {
    return NextResponse.json({ error: "Envie uma imagem com tamanho declarado de até 5 MB." }, { status: 413 });
  }

  const { user, status } = await getUploadAdminUser();

  if (!user) {
    return NextResponse.json(
      { error: status === 401 ? "Faça login para enviar imagens." : "Sem permissão para enviar imagens." },
      { status },
    );
  }

  let upload;

  try {
    upload = await parseImageUploadFormData(await request.formData());
  } catch (error) {
    const message =
      error instanceof ImageUploadValidationError
        ? error.message
        : "Não foi possível ler a imagem enviada.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const image = await uploadLandingImage({
      ...upload,
      uploadedBy: user.id,
    });

    return NextResponse.json(
      {
        altText: upload.altText,
        bucket: image.bucket,
        imagePath: image.publicUrl,
        path: image.path,
        publicUrl: image.publicUrl,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Não foi possível enviar a imagem agora." },
      { status: 500 },
    );
  }
}
