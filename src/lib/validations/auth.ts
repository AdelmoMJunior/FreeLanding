import { z } from "zod";

export type LoginCredentials = Readonly<{
  email: string;
  password: string;
}>;

const loginCredentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
    .max(128, "A senha não pode passar de 128 caracteres."),
});

function getStringField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

export function parseLoginCredentials(formData: FormData): LoginCredentials {
  const result = loginCredentialsSchema.safeParse({
    email: getStringField(formData, "email"),
    password: getStringField(formData, "password"),
  });

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Dados de login inválidos.");
  }

  return result.data;
}
