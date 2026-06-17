import type { LeadStatus } from "@/types/database";

export type LeadAdminStatusFilter = LeadStatus | "all";
export type LeadAdminPageSize = 20 | "all";

export type LeadAdminFilters = Readonly<{
  status: LeadAdminStatusFilter;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: LeadAdminPageSize;
}>;

type SearchParamsInput = Record<string, string | string[] | undefined>;

const leadStatuses = new Set<LeadAdminStatusFilter>(["all", "new", "contacted", "closed", "spam"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function getFirstParam(searchParams: SearchParamsInput, key: string) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(value: string | undefined): LeadAdminStatusFilter {
  return value && leadStatuses.has(value as LeadAdminStatusFilter) ? (value as LeadAdminStatusFilter) : "all";
}

function parseDate(value: string | undefined) {
  return value && datePattern.test(value) ? value : "";
}

function parsePage(value: string | undefined) {
  const page = Number(value);

  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function parsePageSize(value: string | undefined): LeadAdminPageSize {
  return value === "all" ? "all" : 20;
}

export function parseLeadAdminFilters(searchParams: SearchParamsInput): LeadAdminFilters {
  const pageSize = parsePageSize(getFirstParam(searchParams, "pageSize"));

  return {
    status: parseStatus(getFirstParam(searchParams, "status")),
    dateFrom: parseDate(getFirstParam(searchParams, "dateFrom")),
    dateTo: parseDate(getFirstParam(searchParams, "dateTo")),
    page: parsePage(getFirstParam(searchParams, "page")),
    pageSize,
  };
}

export function buildLeadPageHref(filters: LeadAdminFilters, page: number) {
  const params = new URLSearchParams();

  if (filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  params.set("pageSize", String(filters.pageSize));
  params.set("page", String(page));

  return `/admin/leads?${params.toString()}`;
}
