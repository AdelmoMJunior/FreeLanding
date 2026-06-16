import { describe, expect, it } from "vitest";

import {
  getSafeAdminNextPath,
  resolveAdminAccess,
} from "@/lib/auth/access";

describe("resolveAdminAccess", () => {
  it("allows authenticated users with an admin profile", () => {
    expect(resolveAdminAccess({ userId: "user-1", profileRole: "admin" })).toBe(
      "allowed",
    );
  });

  it("requires authentication before checking profile role", () => {
    expect(resolveAdminAccess({ userId: null, profileRole: "admin" })).toBe(
      "unauthenticated",
    );
  });

  it("forbids authenticated users without the admin role", () => {
    expect(resolveAdminAccess({ userId: "user-1", profileRole: "editor" })).toBe(
      "forbidden",
    );
  });
});

describe("getSafeAdminNextPath", () => {
  it("keeps internal admin paths", () => {
    expect(getSafeAdminNextPath("/admin/modules")).toBe("/admin/modules");
  });

  it("falls back for external URLs", () => {
    expect(getSafeAdminNextPath("https://evil.example/admin")).toBe("/admin");
  });

  it("falls back for non-admin internal URLs", () => {
    expect(getSafeAdminNextPath("/checkout")).toBe("/admin");
  });

  it("falls back for admin-looking paths outside the admin route", () => {
    expect(getSafeAdminNextPath("/administrator")).toBe("/admin");
    expect(getSafeAdminNextPath("/admin.evil")).toBe("/admin");
  });
});
