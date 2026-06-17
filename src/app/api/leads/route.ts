import { NextResponse } from "next/server";

import { readLimitedTextBody, PayloadTooLargeError } from "@/lib/http/limited-body";
import { createPublicLead } from "@/lib/leads/create-lead";
import { getLeadRateLimitKey } from "@/lib/leads/rate-limit-key";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  LeadValidationError,
  parseLeadSubmission,
} from "@/lib/validations/lead";
import type { Json } from "@/types/database";

export const runtime = "nodejs";

const MAX_LEAD_PAYLOAD_BYTES = 16 * 1024;
const LEAD_RATE_LIMIT = {
  limit: 5,
  maxEntries: 2_000,
  windowMs: 15 * 60 * 1000,
} as const;

class InvalidLeadPayloadError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "InvalidLeadPayloadError";
    this.status = status;
  }
}

const successResponse = {
  status: "success",
  message: "Recebemos seu pedido. Em breve alguém entra em contato pelo canal informado.",
} as const;

function parseUrlEncodedBody(body: string) {
  return Object.fromEntries(new URLSearchParams(body));
}

function parseLeadPayload(body: string, contentType: string) {
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(body) as unknown;
    } catch {
      throw new InvalidLeadPayloadError("Não foi possível ler os dados enviados.", 400);
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return parseUrlEncodedBody(body);
  }

  throw new InvalidLeadPayloadError("Formato de envio inválido.", 415);
}

function buildLeadMetadata(request: Request): Json {
  const userAgent = request.headers.get("user-agent")?.slice(0, 240) ?? null;

  return {
    user_agent: userAgent,
  };
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(getLeadRateLimitKey(request.headers), LEAD_RATE_LIMIT);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  let body: string;

  try {
    body = await readLimitedTextBody(request, MAX_LEAD_PAYLOAD_BYTES);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json({ error: "A mensagem enviada está muito grande." }, { status: 413 });
    }

    return NextResponse.json({ error: "Não foi possível ler os dados enviados." }, { status: 400 });
  }

  let payload: unknown;

  try {
    payload = parseLeadPayload(body, request.headers.get("content-type") ?? "");
  } catch (error) {
    const message = error instanceof InvalidLeadPayloadError ? error.message : "Não foi possível ler os dados enviados.";
    const status = error instanceof InvalidLeadPayloadError ? error.status : 400;

    return NextResponse.json({ error: message }, { status });
  }

  let submission;

  try {
    submission = parseLeadSubmission(payload);
  } catch (error) {
    if (error instanceof LeadValidationError) {
      return NextResponse.json(
        {
          error: "Confira os campos e tente novamente.",
          fieldErrors: error.fieldErrors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Não foi possível validar os dados enviados." }, { status: 400 });
  }

  if (submission.status === "spam") {
    return NextResponse.json(successResponse, { status: 202 });
  }

  try {
    await createPublicLead(submission.values, buildLeadMetadata(request));
  } catch {
    return NextResponse.json(
      { error: "Não foi possível receber seu pedido agora. Tente novamente em alguns minutos." },
      { status: 503 },
    );
  }

  return NextResponse.json(successResponse, { status: 201 });
}
