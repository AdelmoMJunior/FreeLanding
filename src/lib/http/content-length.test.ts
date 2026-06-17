import { describe, expect, it } from "vitest";

import { isContentLengthWithinLimit } from "@/lib/http/content-length";

describe("isContentLengthWithinLimit", () => {
  it("allows bounded content length", () => {
    expect(isContentLengthWithinLimit(new Headers({ "content-length": "10" }), 10)).toBe(true);
  });

  it("rejects missing content length", () => {
    expect(isContentLengthWithinLimit(new Headers(), 10)).toBe(false);
  });

  it("rejects content length above the limit", () => {
    expect(isContentLengthWithinLimit(new Headers({ "content-length": "11" }), 10)).toBe(false);
  });

  it("rejects malformed content length", () => {
    ["not-a-number", "1e1", "0x10", "+10", "10.0", " 10", "10 ", "-1"].forEach((contentLength) => {
      expect(isContentLengthWithinLimit({ get: () => contentLength }, 10)).toBe(false);
    });
  });
});
