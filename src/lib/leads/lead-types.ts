import type { LeadStatus } from "@/types/database";

export type AdminLead = Readonly<{
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  source: string;
  status: LeadStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}>;

export type AdminLeadList = Readonly<{
  leads: readonly AdminLead[];
  total: number;
  page: number;
  pageSize: 20 | "all";
  totalPages: number;
  showingFrom: number;
  showingTo: number;
}>;

export const leadStatusLabels = {
  new: "Novo",
  contacted: "Contatado",
  closed: "Fechado",
  spam: "Spam",
} as const satisfies Record<LeadStatus, string>;

export const leadStatusOptions = [
  { value: "new", label: leadStatusLabels.new },
  { value: "contacted", label: leadStatusLabels.contacted },
  { value: "closed", label: leadStatusLabels.closed },
  { value: "spam", label: leadStatusLabels.spam },
] as const satisfies readonly Readonly<{ value: LeadStatus; label: string }>[];
