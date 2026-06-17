import "server-only";

import type { LeadSubmissionValues } from "@/lib/validations/lead";

type LeadNotificationInput = Readonly<{
  to: string;
  leadId: string;
  createdAt: string;
  values: LeadSubmissionValues;
}>;

const resendApiUrl = "https://api.resend.com/emails";
const resendTimeoutMs = 5_000;

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    return null;
  }

  return { apiKey, from };
}

function optionalText(value: string | null) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : "Não informado";
}

function formatLeadDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function buildLeadEmailText({ leadId, createdAt, values }: LeadNotificationInput) {
  return [
    "Novo lead recebido pela landing.",
    "",
    `Nome: ${values.name}`,
    `E-mail: ${values.email}`,
    `Telefone: ${optionalText(values.phone)}`,
    `Empresa: ${optionalText(values.company)}`,
    `Recebido em: ${formatLeadDate(createdAt)}`,
    `ID do lead: ${leadId}`,
    "",
    "Mensagem:",
    values.message.trim() || "Lead enviado sem mensagem.",
  ].join("\n");
}

export async function sendLeadNotificationEmail(input: LeadNotificationInput) {
  const config = getResendConfig();

  if (!config) {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), resendTimeoutMs);

  try {
    const response = await fetch(resendApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [input.to],
        subject: `Novo lead: ${input.values.name}`.slice(0, 120),
        text: buildLeadEmailText(input),
        reply_to: input.values.email,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Não foi possível enviar a notificação do lead.");
    }
  } finally {
    clearTimeout(timeout);
  }
}
