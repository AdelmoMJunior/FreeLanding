import { describe, expect, it } from "vitest";

import { checkRateLimit, createRateLimitStore } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests until the configured limit", () => {
    const store = createRateLimitStore();
    const options = { limit: 2, windowMs: 60_000, now: 1_000, store };

    expect(checkRateLimit("lead:127.0.0.1", options)).toEqual({ allowed: true, remaining: 1 });
    expect(checkRateLimit("lead:127.0.0.1", options)).toEqual({ allowed: true, remaining: 0 });
    expect(checkRateLimit("lead:127.0.0.1", options)).toEqual({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
    });
  });

  it("resets after the window expires", () => {
    const store = createRateLimitStore();

    expect(checkRateLimit("lead:ip", { limit: 1, windowMs: 1_000, now: 1_000, store }).allowed).toBe(true);
    expect(checkRateLimit("lead:ip", { limit: 1, windowMs: 1_000, now: 1_999, store }).allowed).toBe(false);
    expect(checkRateLimit("lead:ip", { limit: 1, windowMs: 1_000, now: 2_001, store })).toEqual({
      allowed: true,
      remaining: 0,
    });
  });

  it("keeps separate counters per key", () => {
    const store = createRateLimitStore();

    expect(checkRateLimit("lead:a", { limit: 1, windowMs: 1_000, now: 1_000, store }).allowed).toBe(true);
    expect(checkRateLimit("lead:b", { limit: 1, windowMs: 1_000, now: 1_000, store }).allowed).toBe(true);
  });

  it("bounds the store size when many keys are used", () => {
    const store = createRateLimitStore();
    const options = { limit: 1, windowMs: 60_000, now: 1_000, store, maxEntries: 2 };

    checkRateLimit("lead:a", options);
    checkRateLimit("lead:b", options);
    checkRateLimit("lead:c", options);

    expect(store.size).toBeLessThanOrEqual(2);
  });
});
