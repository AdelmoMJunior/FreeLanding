import { describe, expect, it } from "vitest";

import { isSafeLandingHref, safeLandingHrefOrFallback } from "@/lib/landing/safe-url";

describe("isSafeLandingHref", () => {
  it("accepts anchors, relative paths and http URLs", () => {
    ["#contato", "/#modulos", "/recursos", "http://example.com", "https://example.com/path"].forEach((href) => {
      expect(isSafeLandingHref(href)).toBe(true);
    });
  });

  it("rejects unsafe or unsupported URLs", () => {
    ["", "relative-path", "//example.com", "javascript:alert(1)", "data:text/html,<svg>", "mailto:contato@example.com", "tel:+5511999999999"].forEach((href) => {
      expect(isSafeLandingHref(href)).toBe(false);
    });
  });
});

describe("safeLandingHrefOrFallback", () => {
  it("trims safe internal URLs", () => {
    expect(safeLandingHrefOrFallback("  #contato  ", "#fallback")).toBe("#contato");
    expect(safeLandingHrefOrFallback("  /#modulos  ", "#fallback")).toBe("/#modulos");
  });

  it("normalizes safe absolute URLs", () => {
    expect(safeLandingHrefOrFallback(" https://example.com/contato ", "#fallback")).toBe("https://example.com/contato");
    expect(safeLandingHrefOrFallback("http://example.com", "#fallback")).toBe("http://example.com/");
  });

  it("returns fallback for unsafe URLs", () => {
    expect(safeLandingHrefOrFallback("javascript:alert(1)", "#fallback")).toBe("#fallback");
    expect(safeLandingHrefOrFallback(null, "#fallback")).toBe("#fallback");
  });
});
