import { describe, expect, it } from "vitest";

import { PayloadTooLargeError, readLimitedTextBody } from "@/lib/http/limited-body";

describe("readLimitedTextBody", () => {
  it("reads text bodies within the limit", async () => {
    const request = new Request("https://example.com/api/leads", {
      method: "POST",
      body: "{\"name\":\"Maria\"}",
    });

    await expect(readLimitedTextBody(request, 64)).resolves.toBe("{\"name\":\"Maria\"}");
  });

  it("rejects early when content-length is above the limit", async () => {
    const request = new Request("https://example.com/api/leads", {
      method: "POST",
      headers: { "content-length": "65" },
      body: "small",
    });

    await expect(readLimitedTextBody(request, 64)).rejects.toBeInstanceOf(PayloadTooLargeError);
  });

  it("rejects streamed bodies that exceed the limit", async () => {
    const request = new Request("https://example.com/api/leads", {
      method: "POST",
      body: "123456789",
    });

    await expect(readLimitedTextBody(request, 8)).rejects.toBeInstanceOf(PayloadTooLargeError);
  });
});
