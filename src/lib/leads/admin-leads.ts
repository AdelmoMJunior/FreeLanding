import "server-only";

import type { LeadAdminFilters } from "@/lib/leads/admin-filters";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LeadStatus } from "@/types/database";
import type { AdminLead, AdminLeadList } from "@/lib/leads/lead-types";

function mapAdminLead(row: Readonly<{
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  source: string;
  status: LeadStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}>): AdminLead {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    message: row.message,
    source: row.source,
    status: row.status,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function emptyLeadList(filters: LeadAdminFilters): AdminLeadList {
  return {
    leads: [],
    total: 0,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: 1,
    showingFrom: 0,
    showingTo: 0,
  };
}

function nextDateStart(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  value.setUTCDate(value.getUTCDate() + 1);

  return value.toISOString();
}

function dateStart(date: string) {
  return `${date}T00:00:00.000Z`;
}

export async function getLeadsForAdmin(filters: LeadAdminFilters) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("leads")
    .select("id, name, email, phone, company, message, source, status, admin_notes, created_at, updated_at", {
      count: "exact",
    });

  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", dateStart(filters.dateFrom));
  }

  if (filters.dateTo) {
    query = query.lt("created_at", nextDateStart(filters.dateTo));
  }

  query = query.order("created_at", { ascending: false }).order("id", { ascending: false });

  if (filters.pageSize !== "all") {
    const from = (filters.page - 1) * filters.pageSize;
    query = query.range(from, from + filters.pageSize - 1);
  }

  const { data: leads, error, count } = await query;

  if (error) {
    return emptyLeadList(filters);
  }

  const rows = leads ?? [];
  const total = count ?? rows.length;
  const totalPages = filters.pageSize === "all" ? 1 : Math.max(1, Math.ceil(total / filters.pageSize));

  if (filters.pageSize !== "all" && total > 0 && filters.page > totalPages) {
    return getLeadsForAdmin({ ...filters, page: totalPages });
  }

  const showingFrom = total === 0 ? 0 : filters.pageSize === "all" ? 1 : (filters.page - 1) * filters.pageSize + 1;
  const showingTo = total === 0 ? 0 : filters.pageSize === "all" ? total : Math.min(showingFrom + rows.length - 1, total);

  return {
    leads: rows.map(mapAdminLead),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages,
    showingFrom,
    showingTo,
  };
}

export async function updateLeadAdminFields(id: string, status: LeadStatus, adminNotes: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("leads").update({ status, admin_notes: adminNotes }).eq("id", id);

  if (error) {
    throw new Error("Não foi possível atualizar o lead.");
  }
}
