"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import type { PublicLandingContent } from "@/lib/landing/content";
import type { LeadSubmissionField, LeadSubmissionFieldErrors } from "@/lib/validations/lead";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

type LeadApiResponse = Readonly<{
  status?: unknown;
  message?: unknown;
  error?: unknown;
  fieldErrors?: unknown;
}>;

type LeadFieldProps = Readonly<{
  formId: string;
  name: LeadSubmissionField;
  label: string;
  autoComplete: string;
  errors: LeadSubmissionFieldErrors;
  helper?: string;
  placeholder?: string;
  requiredLabel: string;
  required?: boolean;
  type?: "email" | "tel" | "text";
  multiline?: boolean;
  maxLength: number;
}>;

const leadFields = ["name", "email", "phone", "company", "message"] as const satisfies readonly LeadSubmissionField[];

const inputClassName =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-[var(--brand-color)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-soft)] aria-[invalid=true]:border-red-300 aria-[invalid=true]:focus:border-red-600 aria-[invalid=true]:focus:ring-red-100";

function getStringField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

function getResponseMessage(payload: LeadApiResponse, fallback: string) {
  return typeof payload.message === "string"
    ? payload.message
    : typeof payload.error === "string"
      ? payload.error
      : fallback;
}

function getResponseFieldErrors(value: unknown): LeadSubmissionFieldErrors {
  if (!value || typeof value !== "object") {
    return {};
  }

  return leadFields.reduce<LeadSubmissionFieldErrors>((errors, field) => {
    const message = (value as Record<string, unknown>)[field];

    if (typeof message === "string") {
      errors[field] = message;
    }

    return errors;
  }, {});
}

function fieldDescriptionIds(formId: string, name: LeadSubmissionField, helper?: string, error?: string) {
  return [helper ? `${formId}-${name}-helper` : null, error ? `${formId}-${name}-error` : null]
    .filter(Boolean)
    .join(" ");
}

function LeadField({
  formId,
  name,
  label,
  autoComplete,
  errors,
  helper,
  placeholder,
  requiredLabel,
  required = false,
  type = "text",
  multiline = false,
  maxLength,
}: LeadFieldProps) {
  const id = `${formId}-${name}`;
  const error = errors[name];
  const describedBy = fieldDescriptionIds(formId, name, helper, error);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-black text-slate-950">
        {label} {required && requiredLabel ? <span className="font-semibold text-slate-600">({requiredLabel})</span> : null}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={5}
          maxLength={maxLength}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy || undefined}
          placeholder={placeholder}
          className={`${inputClassName} min-h-36 resize-y leading-6`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          maxLength={maxLength}
          required={required}
          autoComplete={autoComplete}
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

type LeadFormProps = Readonly<{
  copy: PublicLandingContent["leadForm"];
}>;

export function LeadForm({ copy }: LeadFormProps) {
  const reactId = useId();
  const formId = `lead-form-${reactId}`;
  const successPanelRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LeadSubmissionFieldErrors>({});

  useEffect(() => {
    if (status === "success") {
      successPanelRef.current?.focus();
    }
  }, [status]);

  function dismissSuccess() {
    setStatus("idle");
    setMessage("");
    setFieldErrors({});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("submitting");
    setMessage(`${copy.submitLabel}...`);
    setFieldErrors({});

    const payload = {
      name: getStringField(formData, "name"),
      email: getStringField(formData, "email"),
      phone: getStringField(formData, "phone"),
      company: getStringField(formData, "company"),
      message: getStringField(formData, "message"),
      website: getStringField(formData, "website"),
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responsePayload = (await response.json().catch(() => ({}))) as LeadApiResponse;

      if (!response.ok) {
        setStatus("error");
        setMessage(getResponseMessage(responsePayload, "Não foi possível enviar agora. Confira os campos e tente novamente."));
        setFieldErrors(getResponseFieldErrors(responsePayload.fieldErrors));
        return;
      }

      form.reset();
      setStatus("success");
      setMessage(copy.successMessage || getResponseMessage(responsePayload, ""));
    } catch {
      setStatus("error");
      setMessage("Falha de conexão ao enviar. Tente novamente em alguns minutos.");
    }
  }

  return (
    <form
      action="/api/leads"
      method="post"
      onSubmit={handleSubmit}
      className="relative rounded-[1.75rem] bg-white p-5 text-slate-950 shadow-2xl shadow-slate-950/20 sm:p-6"
      noValidate
    >
      {status === "success" ? (
        <div
          ref={successPanelRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className="grid min-h-[30rem] place-items-center rounded-[1.5rem] bg-slate-50 p-6 text-center outline-none"
        >
          <div className="max-w-sm">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-[var(--brand-color)] text-3xl font-black text-[var(--brand-contrast)] shadow-[0_18px_40px_var(--brand-shadow)]">
              ✓
            </span>
            {copy.successTitle ? (
              <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-950">
                {copy.successTitle}
              </h3>
            ) : null}
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {message || copy.successMessage}
            </p>
            <button
              type="button"
              onClick={dismissSuccess}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-slate-950 px-5 text-xs font-black uppercase tracking-[0.14em] text-[var(--brand-accent-on-dark)] transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-color)]"
            >
              {copy.successDismissLabel}
            </button>
          </div>
        </div>
      ) : (
        <>
      <div>
        <h3 className="text-2xl font-black tracking-tight">{copy.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {copy.description}
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <LeadField
          formId={formId}
          name="name"
          label={copy.nameLabel}
          autoComplete="name"
          errors={fieldErrors}
          requiredLabel={copy.requiredLabel}
          required
          maxLength={80}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <LeadField
            formId={formId}
            name="email"
            label={copy.emailLabel}
            type="email"
            autoComplete="email"
            errors={fieldErrors}
            requiredLabel={copy.requiredLabel}
            required
            maxLength={254}
          />
          <LeadField
            formId={formId}
            name="phone"
            label={copy.phoneLabel}
            type="tel"
            autoComplete="tel"
            errors={fieldErrors}
            helper={copy.phoneHelper}
            requiredLabel={copy.requiredLabel}
            maxLength={40}
          />
        </div>
        <LeadField
          formId={formId}
          name="company"
          label={copy.companyLabel}
          autoComplete="organization"
          errors={fieldErrors}
          requiredLabel={copy.requiredLabel}
          maxLength={100}
        />
        <LeadField
          formId={formId}
          name="message"
          label={copy.messageLabel}
          autoComplete="off"
          errors={fieldErrors}
          helper={copy.messageHelper}
          placeholder={copy.messagePlaceholder}
          requiredLabel={copy.requiredLabel}
          multiline
          maxLength={1000}
        />
      </div>

      <div className="pointer-events-none absolute left-[-10000px] top-auto size-px overflow-hidden" aria-hidden="true">
        <label htmlFor={`${formId}-website`}>Site</label>
        <input id={`${formId}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {message ? (
        <p
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            status === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-slate-950 px-5 text-xs font-black uppercase tracking-[0.14em] text-[var(--brand-accent-on-dark)] transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-color)] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-slate-100"
      >
        {status === "submitting" ? `${copy.submitLabel}...` : copy.submitLabel}
      </button>
        </>
      )}
    </form>
  );
}
