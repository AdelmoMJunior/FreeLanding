import Link from "next/link";

import { buildLeadPageHref, type LeadAdminFilters } from "@/lib/leads/admin-filters";
import { updateLeadStatusAction } from "@/lib/leads/lead-actions";
import {
  leadStatusLabels,
  leadStatusOptions,
  type AdminLead,
  type AdminLeadList,
} from "@/lib/leads/lead-types";

type AdminLeadsManagerProps = Readonly<{
  filters: LeadAdminFilters;
  leadList: AdminLeadList;
}>;

const secondaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-700 transition hover:border-slate-950 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700";

const primaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700";

const inputClassName =
  "min-h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 shadow-sm transition focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100";

const textareaClassName =
  "min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100";

const statusBadgeClassName = {
  new: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  contacted: "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
  closed: "bg-slate-950 text-emerald-300 ring-1 ring-slate-900",
  spam: "bg-red-50 text-red-700 ring-1 ring-red-200",
} as const;

function formatLeadDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data indisponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function statusLabel(status: AdminLead["status"]) {
  return leadStatusLabels[status];
}

function sourceLabel(source: string) {
  return source === "landing_page" ? "Formulário da landing" : source;
}

function StatusBadge({ status }: Readonly<{ status: AdminLead["status"] }>) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${statusBadgeClassName[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function LeadFilters({ filters }: Readonly<{ filters: LeadAdminFilters }>) {
  return (
    <form
      action="/admin/leads"
      className="rounded-[1.75rem] border border-white bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
      method="get"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.1fr_1fr_1fr_0.9fr_auto] xl:items-end">
        <div>
          <label htmlFor="lead-status-filter" className="block text-sm font-black text-slate-950">
            Status
          </label>
          <select
            id="lead-status-filter"
            name="status"
            defaultValue={filters.status}
            className={`${inputClassName} mt-2 w-full`}
          >
            <option value="all">Todos os status</option>
            {leadStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="lead-date-from" className="block text-sm font-black text-slate-950">
            Data inicial
          </label>
          <input
            id="lead-date-from"
            name="dateFrom"
            type="date"
            defaultValue={filters.dateFrom}
            className={`${inputClassName} mt-2 w-full`}
          />
        </div>

        <div>
          <label htmlFor="lead-date-to" className="block text-sm font-black text-slate-950">
            Data final
          </label>
          <input
            id="lead-date-to"
            name="dateTo"
            type="date"
            defaultValue={filters.dateTo}
            className={`${inputClassName} mt-2 w-full`}
          />
        </div>

        <div>
          <label htmlFor="lead-page-size" className="block text-sm font-black text-slate-950">
            Visualização
          </label>
          <select
            id="lead-page-size"
            name="pageSize"
            defaultValue={String(filters.pageSize)}
            className={`${inputClassName} mt-2 w-full`}
          >
            <option value="20">20 por página</option>
            <option value="all">Todos</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row md:col-span-2 xl:col-span-1">
          <button type="submit" className={`${primaryButtonClassName} w-full`}>
            Filtrar
          </button>
          <Link href="/admin/leads" className={`${secondaryButtonClassName} w-full`}>
            Limpar
          </Link>
        </div>
      </div>
    </form>
  );
}

function LeadPagination({ filters, leadList }: Readonly<{ filters: LeadAdminFilters; leadList: AdminLeadList }>) {
  if (leadList.pageSize === "all" || leadList.totalPages <= 1) {
    return null;
  }

  const previousPage = Math.max(1, leadList.page - 1);
  const nextPage = Math.min(leadList.totalPages, leadList.page + 1);
  const hasPrevious = leadList.page > 1;
  const hasNext = leadList.page < leadList.totalPages;

  return (
    <nav
      aria-label="Paginação de leads"
      className="flex flex-col gap-3 rounded-[1.5rem] bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm font-bold text-slate-600">
        Página {leadList.page} de {leadList.totalPages}
      </p>
      <div className="flex gap-2">
        {hasPrevious ? (
          <Link href={buildLeadPageHref(filters, previousPage)} className={secondaryButtonClassName}>
            Anterior
          </Link>
        ) : (
          <span className={`${secondaryButtonClassName} pointer-events-none opacity-45`} aria-disabled="true">Anterior</span>
        )}
        {hasNext ? (
          <Link href={buildLeadPageHref(filters, nextPage)} className={secondaryButtonClassName}>
            Próxima
          </Link>
        ) : (
          <span className={`${secondaryButtonClassName} pointer-events-none opacity-45`} aria-disabled="true">Próxima</span>
        )}
      </div>
    </nav>
  );
}

function LeadStatusForm({ lead }: Readonly<{ lead: AdminLead }>) {
  const selectId = `lead-${lead.id}-status`;
  const notesId = `lead-${lead.id}-notes`;

  return (
    <form action={updateLeadStatusAction} className="rounded-2xl bg-slate-50 p-4">
      <fieldset className="grid gap-4">
        <legend className="sr-only">Atualizar lead de {lead.name}</legend>
        <input type="hidden" name="id" value={lead.id} />

        <div className="grid gap-4 md:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)]">
          <div>
            <label htmlFor={selectId} className="block text-sm font-black text-slate-900">
              Status do lead
            </label>
            <select id={selectId} name="status" defaultValue={lead.status} className={`${inputClassName} mt-2 w-full`}>
              {leadStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={notesId} className="block text-sm font-black text-slate-900">
              Anotação interna
            </label>
            <textarea
              id={notesId}
              name="adminNotes"
              defaultValue={lead.adminNotes}
              maxLength={2000}
              placeholder="Ex.: pediu retorno no fim do mês, prefere WhatsApp, orçamento enviado..."
              className={`${textareaClassName} mt-2`}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className={`${secondaryButtonClassName} w-full sm:w-auto`}>
            Salvar lead
          </button>
        </div>
      </fieldset>
    </form>
  );
}

function LeadCard({ lead }: Readonly<{ lead: AdminLead }>) {
  const receivedAt = formatLeadDate(lead.createdAt);
  const updatedAt = formatLeadDate(lead.updatedAt);
  const company = lead.company?.trim();
  const phone = lead.phone?.trim();
  const message = lead.message.trim();

  return (
    <article className="rounded-[1.75rem] border border-white bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Recebido em {receivedAt}</p>
          <h3 className="mt-2 break-words text-xl font-black tracking-tight text-slate-950">
            {lead.name || "Lead sem nome"}
          </h3>
          {company ? <p className="mt-1 break-words text-sm font-bold text-slate-600">{company}</p> : null}
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <dl className="mt-5 grid gap-3 rounded-2xl bg-white/70 p-4 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="font-black text-slate-950">E-mail</dt>
          <dd className="mt-1 break-all font-semibold text-slate-700">{lead.email}</dd>
        </div>
        <div className="min-w-0">
          <dt className="font-black text-slate-950">Telefone</dt>
          <dd className="mt-1 break-words font-semibold text-slate-700">{phone || "Não informado"}</dd>
        </div>
        <div className="min-w-0">
          <dt className="font-black text-slate-950">Origem</dt>
          <dd className="mt-1 break-words font-semibold text-slate-700">{sourceLabel(lead.source)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="font-black text-slate-950">Última atualização</dt>
          <dd className="mt-1 break-words font-semibold text-slate-700">{updatedAt}</dd>
        </div>
      </dl>

      <div className="mt-5">
        <h4 className="text-sm font-black text-slate-950">Mensagem</h4>
        <p className="mt-2 whitespace-pre-wrap break-words rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {message || "Lead enviado sem mensagem."}
        </p>
      </div>

      <div className="mt-5">
        <LeadStatusForm lead={lead} />
      </div>
    </article>
  );
}

export function AdminLeadsManager({ filters, leadList }: AdminLeadsManagerProps) {
  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:p-9">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-300">Leads</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Leads recebidos pela landing</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Acompanhe contatos comerciais, filtre por período e status, registre anotações internas e mantenha o retorno organizado.
          </p>
        </div>
      </section>

      <LeadFilters filters={filters} />

      <section aria-labelledby="lead-list-title" className="grid gap-4">
        <div className="flex flex-col gap-2 rounded-[1.5rem] bg-white/70 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="lead-list-title" className="text-xl font-black tracking-tight text-slate-950">
              Contatos recebidos
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              {leadList.total
                ? `Mostrando ${leadList.showingFrom}-${leadList.showingTo} de ${leadList.total} leads.`
                : "Nenhum lead encontrado para os filtros atuais."}
            </p>
          </div>
          <span className="text-sm font-black text-emerald-800">
            {leadList.total} {leadList.total === 1 ? "lead" : "leads"}
          </span>
        </div>

        {leadList.leads.length ? (
          <div className="grid gap-4">
            {leadList.leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
            <LeadPagination filters={filters} leadList={leadList} />
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center">
            <h3 className="text-lg font-black text-slate-950">Nenhum lead encontrado.</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ajuste os filtros ou aguarde novos envios do formulário da landing.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
