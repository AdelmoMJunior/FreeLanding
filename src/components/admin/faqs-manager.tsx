"use client";

import { useActionState, type ReactNode } from "react";

import {
  deleteFaqAction,
  moveFaqAction,
  saveFaqAction,
  toggleFaqStatusAction,
  type FaqActionState,
} from "@/lib/landing/faq-actions";
import type { AdminFaq } from "@/lib/landing/faq-types";
import type { FaqField, FaqFieldErrors } from "@/lib/validations/faq";

type AdminFaqsManagerProps = Readonly<{
  faqs: readonly AdminFaq[];
  nextSortOrder: number;
}>;

type FaqFormProps = Readonly<{
  faq?: AdminFaq;
  nextSortOrder?: number;
  legend: string;
  submitLabel: string;
}>;

type FaqFieldProps = Readonly<{
  formId: string;
  name: FaqField;
  label: string;
  defaultValue: string | number;
  errors?: FaqFieldErrors;
  helper?: string;
  type?: "number" | "text";
  multiline?: boolean;
}>;

const initialActionState: FaqActionState = { status: "idle" };

const inputClassName =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 aria-[invalid=true]:border-red-300 aria-[invalid=true]:focus:border-red-600 aria-[invalid=true]:focus:ring-red-100";

const secondaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-700 transition hover:border-slate-950 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-50";

function fieldDescriptionIds(formId: string, name: FaqField, helper?: string, error?: string) {
  return [helper ? `${formId}-${name}-helper` : null, error ? `${formId}-${name}-error` : null]
    .filter(Boolean)
    .join(" ");
}

function FaqTextField({
  formId,
  name,
  label,
  defaultValue,
  errors,
  helper,
  type = "text",
  multiline = false,
}: FaqFieldProps) {
  const error = errors?.[name];
  const describedBy = fieldDescriptionIds(formId, name, helper, error);
  const id = `${formId}-${name}`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-black text-slate-900">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          defaultValue={defaultValue}
          rows={5}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy || undefined}
          className={`${inputClassName} min-h-36 resize-y leading-6`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          defaultValue={defaultValue}
          min={type === "number" ? 0 : undefined}
          max={type === "number" ? 9999 : undefined}
          step={type === "number" ? 1 : undefined}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy || undefined}
          className={inputClassName}
        />
      )}
      {helper ? (
        <p id={`${formId}-${name}-helper`} className="mt-2 text-xs leading-5 text-slate-500">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p id={`${formId}-${name}-error`} className="mt-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function FaqForm({ faq, nextSortOrder = 0, legend, submitLabel }: FaqFormProps) {
  const [state, formAction, isPending] = useActionState(saveFaqAction, initialActionState);
  const formId = faq ? `faq-${faq.id}` : "faq-new";
  const fieldErrors = state.fieldErrors;

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <fieldset className="grid gap-5">
        <legend className="sr-only">{legend}</legend>
        {faq ? <input type="hidden" name="id" value={faq.id} /> : null}

        {state.message ? (
          <div
            role={state.status === "error" ? "alert" : "status"}
            className={`rounded-[1.25rem] border px-4 py-3 text-sm font-semibold ${
              state.status === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          <FaqTextField
            formId={formId}
            name="question"
            label="Pergunta"
            defaultValue={faq?.question ?? ""}
            errors={fieldErrors}
          />
          <FaqTextField
            formId={formId}
            name="sortOrder"
            label="Ordem"
            type="number"
            defaultValue={faq?.sortOrder ?? nextSortOrder}
            errors={fieldErrors}
            helper="Menores números aparecem primeiro."
          />
          <div className="md:col-span-2">
            <FaqTextField
              formId={formId}
              name="answer"
              label="Resposta"
              defaultValue={faq?.answer ?? ""}
              errors={fieldErrors}
              multiline
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label htmlFor={`${formId}-isActive`} className="flex items-center gap-3 text-sm font-bold text-slate-800">
            <input
              id={`${formId}-isActive`}
              name="isActive"
              type="checkbox"
              defaultChecked={faq?.isActive ?? true}
              className="size-5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
            />
            Publicar FAQ na landing
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-xs font-black uppercase tracking-[0.14em] text-emerald-300 transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-slate-100"
          >
            {isPending ? "Salvando..." : submitLabel}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

function SmallActionForm({
  action,
  id,
  children,
}: Readonly<{
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  children: ReactNode;
}>) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {children}
    </form>
  );
}

export function AdminFaqsManager({ faqs, nextSortOrder }: AdminFaqsManagerProps) {
  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] bg-white/90 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] ring-1 ring-white sm:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-800">FAQ</p>
        <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Perguntas frequentes da landing
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Cadastre, ordene e publique respostas para as dúvidas mais comuns de visitantes.
        </p>
      </section>

      <section
        aria-labelledby="faq-create-title"
        className="rounded-[1.75rem] border border-white bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
      >
        <h2 id="faq-create-title" className="text-xl font-black tracking-tight text-slate-950">
          Nova FAQ
        </h2>
        <div className="mt-5">
          <FaqForm legend="Criar nova FAQ" submitLabel="Criar FAQ" nextSortOrder={nextSortOrder} />
        </div>
      </section>

      <section aria-labelledby="faq-list-title" className="grid gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="faq-list-title" className="text-xl font-black tracking-tight text-slate-950">
              FAQs cadastradas
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              Lista ordenada pela ordem atual de publicação.
            </p>
          </div>
          <span className="text-sm font-black text-emerald-800">
            {faqs.length} {faqs.length === 1 ? "FAQ" : "FAQs"}
          </span>
        </div>

        {faqs.length ? (
          <div className="grid gap-4">
            {faqs.map((faq, index) => (
              <article
                key={faq.id}
                className="rounded-[1.75rem] border border-white bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
              >
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                      Ordem {faq.sortOrder}
                    </p>
                    <h3 className="mt-2 text-lg font-black tracking-tight text-slate-950">
                      {faq.question || "FAQ sem pergunta"}
                    </h3>
                    <span
                      className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${
                        faq.isActive
                          ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                      }`}
                    >
                      {faq.isActive ? "Ativa" : "Inativa"}
                    </span>
                  </div>

                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label={`Ações rápidas para ${faq.question || "FAQ sem pergunta"}`}
                  >
                    <form action={moveFaqAction}>
                      <input type="hidden" name="id" value={faq.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button
                        type="submit"
                        disabled={index === 0}
                        aria-label={`Subir ${faq.question || "FAQ sem pergunta"}`}
                        className={secondaryButtonClassName}
                      >
                        Subir
                      </button>
                    </form>
                    <form action={moveFaqAction}>
                      <input type="hidden" name="id" value={faq.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        type="submit"
                        disabled={index === faqs.length - 1}
                        aria-label={`Descer ${faq.question || "FAQ sem pergunta"}`}
                        className={secondaryButtonClassName}
                      >
                        Descer
                      </button>
                    </form>
                    <SmallActionForm action={toggleFaqStatusAction} id={faq.id}>
                      <button
                        type="submit"
                        aria-label={`${faq.isActive ? "Desativar" : "Ativar"} ${faq.question || "FAQ sem pergunta"}`}
                        className={secondaryButtonClassName}
                      >
                        {faq.isActive ? "Desativar" : "Ativar"}
                      </button>
                    </SmallActionForm>
                    <SmallActionForm action={deleteFaqAction} id={faq.id}>
                      <button
                        type="submit"
                        aria-label={`Remover ${faq.question || "FAQ sem pergunta"}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 text-xs font-black uppercase tracking-[0.14em] text-red-700 transition hover:border-red-300 hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600"
                      >
                        Remover
                      </button>
                    </SmallActionForm>
                  </div>
                </div>

                <FaqForm faq={faq} legend={`Editar FAQ ${faq.question || "sem pergunta"}`} submitLabel="Salvar FAQ" />
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center">
            <h3 className="text-lg font-black text-slate-950">Nenhuma FAQ cadastrada ainda.</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use o formulário de criação para adicionar a primeira pergunta frequente da landing.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
