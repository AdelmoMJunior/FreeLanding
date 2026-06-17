import { describe, expect, it } from "vitest";

import { buildLeadPageHref, parseLeadAdminFilters } from "@/lib/leads/admin-filters";

describe("parseLeadAdminFilters", () => {
  it("uses safe defaults", () => {
    expect(parseLeadAdminFilters({})).toEqual({
      status: "all",
      dateFrom: "",
      dateTo: "",
      page: 1,
      pageSize: 20,
    });
  });

  it("parses valid filters", () => {
    expect(
      parseLeadAdminFilters({
        status: "contacted",
        dateFrom: "2026-06-01",
        dateTo: "2026-06-30",
        page: "3",
        pageSize: "all",
      }),
    ).toEqual({
      status: "contacted",
      dateFrom: "2026-06-01",
      dateTo: "2026-06-30",
      page: 3,
      pageSize: "all",
    });
  });

  it("falls back from invalid filters", () => {
    expect(
      parseLeadAdminFilters({
        status: "ignored",
        dateFrom: "01/06/2026",
        dateTo: "amanha",
        page: "0",
        pageSize: "100",
      }),
    ).toEqual({
      status: "all",
      dateFrom: "",
      dateTo: "",
      page: 1,
      pageSize: 20,
    });
  });
});

describe("buildLeadPageHref", () => {
  it("preserves filters while changing page", () => {
    expect(
      buildLeadPageHref(
        {
          status: "spam",
          dateFrom: "2026-06-01",
          dateTo: "2026-06-30",
          page: 2,
          pageSize: 20,
        },
        3,
      ),
    ).toBe("/admin/leads?status=spam&dateFrom=2026-06-01&dateTo=2026-06-30&pageSize=20&page=3");
  });
});
