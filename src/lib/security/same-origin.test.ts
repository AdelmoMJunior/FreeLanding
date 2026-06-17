import { describe, expect, it } from "vitest";

import { isSameOriginRequest } from "@/lib/security/same-origin";

describe("isSameOriginRequest", () => {
  it("allows matching origin and host", () => {
    const headers = new Headers({
      host: "example.com",
      origin: "https://example.com",
    });

    expect(isSameOriginRequest(headers)).toBe(true);
  });

  it("rejects cross-origin mutation attempts", () => {
    const headers = new Headers({
      host: "example.com",
      origin: "https://evil.example",
    });

    expect(isSameOriginRequest(headers)).toBe(false);
  });

  it("rejects explicit cross-site fetch metadata when origin is absent", () => {
    const headers = new Headers({
      host: "example.com",
      "sec-fetch-site": "cross-site",
    });

    expect(isSameOriginRequest(headers)).toBe(false);
  });

  it("allows missing origin for non-cross-site requests", () => {
    const headers = new Headers({
      host: "example.com",
      "sec-fetch-site": "same-origin",
    });

    expect(isSameOriginRequest(headers)).toBe(true);
  });
});
