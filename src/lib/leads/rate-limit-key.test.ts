import { describe, expect, it } from "vitest";

import { getLeadRateLimitKey } from "@/lib/leads/rate-limit-key";

describe("getLeadRateLimitKey", () => {
  it("uses a global key unless proxy headers are explicitly trusted", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10",
      "x-real-ip": "203.0.113.11",
    });

    expect(getLeadRateLimitKey(headers, false)).toBe("lead:global");
  });

  it("uses the first forwarded IP only when proxy headers are trusted", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
    });

    expect(getLeadRateLimitKey(headers, true)).toBe("lead:203.0.113.10");
  });

  it("falls back safely when trusted proxy headers are missing", () => {
    expect(getLeadRateLimitKey(new Headers(), true)).toBe("lead:unknown");
  });
});
