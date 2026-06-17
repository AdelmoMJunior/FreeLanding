import { describe, expect, it } from "vitest";

import { getGoogleAnalyticsId } from "@/lib/analytics/google";

describe("getGoogleAnalyticsId", () => {
  it("returns a normalized GA4 measurement id", () => {
    expect(getGoogleAnalyticsId(" g-abc123def4 ")).toBe("G-ABC123DEF4");
  });

  it("returns null when the id is missing", () => {
    expect(getGoogleAnalyticsId(undefined)).toBeNull();
    expect(getGoogleAnalyticsId(" ")).toBeNull();
  });

  it("rejects unsafe or unsupported ids", () => {
    expect(getGoogleAnalyticsId("UA-123456-1")).toBeNull();
    expect(getGoogleAnalyticsId("G-TEST")).toBeNull();
    expect(getGoogleAnalyticsId("G-ABC123\";alert(1)//")).toBeNull();
    expect(getGoogleAnalyticsId("https://example.com/tag.js")).toBeNull();
  });
});
