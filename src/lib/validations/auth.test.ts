import { describe, expect, it } from "vitest";

import { parseLoginCredentials } from "@/lib/validations/auth";

function formData(values: Record<string, string>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    data.set(key, value);
  });

  return data;
}

describe("parseLoginCredentials", () => {
  it("normalizes a valid email and keeps the password unchanged", () => {
    const credentials = parseLoginCredentials(
      formData({ email: " ADMIN@Example.COM ", password: "validPass123" }),
    );

    expect(credentials).toEqual({
      email: "admin@example.com",
      password: "validPass123",
    });
  });

  it("rejects invalid email addresses", () => {
    expect(() =>
      parseLoginCredentials(formData({ email: "admin", password: "validPass123" })),
    ).toThrow("Informe um e-mail válido.");
  });

  it("rejects short passwords", () => {
    expect(() =>
      parseLoginCredentials(formData({ email: "admin@example.com", password: "short" })),
    ).toThrow("A senha precisa ter pelo menos 8 caracteres.");
  });
});
