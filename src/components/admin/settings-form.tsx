"use client";

import { useActionState, useEffect, useState, type ChangeEvent } from "react";

import {
  saveLandingSettingsAction,
  type LandingSettingsActionState,
} from "@/lib/landing/actions";
import type {
  LandingSettingsField,
  LandingSettingsFieldErrors,
  LandingSettingsFormValues,
} from "@/lib/validations/landing";

type AdminSettingsFormProps = Readonly<{
  initialValues: LandingSettingsFormValues;
}>;

type FieldProps = Readonly<{
  name: LandingSettingsField;
  label: string;
  defaultValue: string;
  errors?: LandingSettingsFieldErrors;
  helper?: string;
  type?: "color" | "email" | "tel" | "text" | "url";
  multiline?: boolean;
}>;

type UploadStatus = "idle" | "uploading" | "success" | "error";

type UploadMessage = Readonly<{
  status: UploadStatus;
  text: string;
}>;

type UploadResponse = Readonly<{
  imagePath?: unknown;
  error?: unknown;
}>;

async function deleteUploadedImage(imagePath: string) {
  if (!imagePath) {
    return;
  }

  await fetch("/api/uploads", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imagePath }),
  }).catch(() => undefined);
}

type AssetUploadFieldProps = Readonly<{
  name: "logoPath" | "faviconPath";
  label: string;
  value: string;
  onChange: (value: string) => void;
  errors?: LandingSettingsFieldErrors;
  helper: string;
  uploadLabel: string;
  altText: string;
}>;

const initialActionState: LandingSettingsActionState = {
  status: "idle",
};

const inputClassName =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 aria-[invalid=true]:border-red-300 aria-[invalid=true]:focus:border-red-600 aria-[invalid=true]:focus:ring-red-100";

function fieldDescriptionIds(name: LandingSettingsField, helper?: string, error?: string) {
  return [helper ? `${name}-helper` : null, error ? `${name}-error` : null]
    .filter(Boolean)
    .join(" ");
}

function SettingsField({
  name,
  label,
  defaultValue,
  errors,
  helper,
  type = "text",
  multiline = false,
}: FieldProps) {
  const error = errors?.[name];
  const describedBy = fieldDescriptionIds(name, helper, error);

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-black text-slate-900">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          rows={4}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy || undefined}
          className={`${inputClassName} min-h-32 resize-y leading-6`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy || undefined}
          className={type === "color" ? `${inputClassName} h-14 p-2` : inputClassName}
        />
      )}
      {helper ? (
        <p id={`${name}-helper`} className="mt-2 text-xs leading-5 text-slate-500">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p id={`${name}-error`} className="mt-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function AssetUploadField({
  name,
  label,
  value,
  onChange,
  errors,
  helper,
  uploadLabel,
  altText,
}: AssetUploadFieldProps) {
  const [uploadMessage, setUploadMessage] = useState<UploadMessage>({ status: "idle", text: "" });
  const error = errors?.[name];
  const describedBy = fieldDescriptionIds(name, helper, error);
  const uploadId = `${name}-upload`;
  const uploadStatusId = `${name}-upload-status`;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadMessage({ status: "uploading", text: "Enviando imagem..." });

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("altText", altText);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: uploadFormData,
      });
      const payload = (await response.json().catch(() => ({}))) as UploadResponse;

      if (!response.ok) {
        const message = typeof payload.error === "string" ? payload.error : "Não foi possível enviar a imagem.";
        setUploadMessage({ status: "error", text: message });
        return;
      }

      if (typeof payload.imagePath !== "string" || !payload.imagePath) {
        setUploadMessage({ status: "error", text: "Upload concluído, mas o caminho não foi retornado." });
        return;
      }

      await deleteUploadedImage(value);
      onChange(payload.imagePath);
      setUploadMessage({ status: "success", text: "Imagem enviada. Salve as configurações para publicar." });
    } catch {
      setUploadMessage({ status: "error", text: "Falha de conexão ao enviar a imagem. Tente novamente." });
    }
  }

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-black text-slate-900">
        {label}
      </label>
      <div className="mt-2 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3">
        <input
          id={name}
          name={name}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy || undefined}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 aria-[invalid=true]:border-red-300 aria-[invalid=true]:focus:border-red-600 aria-[invalid=true]:focus:ring-red-100"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label
            htmlFor={uploadId}
            className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-700 transition hover:border-slate-950 hover:text-slate-950 ${uploadMessage.status === "uploading" ? "pointer-events-none opacity-60" : ""}`}
          >
            {uploadMessage.status === "uploading" ? "Enviando..." : uploadLabel}
          </label>
          <input
            id={uploadId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploadMessage.status === "uploading"}
            aria-describedby={`${name}-helper ${uploadStatusId}`}
            className="sr-only"
          />
          {value ? (
            <button
              type="button"
              onClick={() => {
                void deleteUploadedImage(value);
                onChange("");
              }}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 text-xs font-black uppercase tracking-[0.14em] text-red-700 transition hover:border-red-300 hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600"
            >
              Remover
            </button>
          ) : null}
        </div>
      </div>
      <p id={`${name}-helper`} className="mt-2 text-xs leading-5 text-slate-500">
        {helper}
      </p>
      {error ? (
        <p id={`${name}-error`} className="mt-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <p
        id={uploadStatusId}
        role="status"
        aria-live="polite"
        className={`mt-2 min-h-5 text-sm font-semibold ${
          uploadMessage.status === "success"
            ? "text-emerald-800"
            : uploadMessage.status === "error"
              ? "text-red-700"
              : "text-slate-600"
        }`}
      >
        {uploadMessage.text}
      </p>
    </div>
  );
}

export function AdminSettingsForm({ initialValues }: AdminSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveLandingSettingsAction,
    initialActionState,
  );
  const [logoPath, setLogoPath] = useState(initialValues.logoPath);
  const [faviconPath, setFaviconPath] = useState(initialValues.faviconPath);
  const fieldErrors = state.fieldErrors;

  useEffect(() => {
    if (state.status !== "idle") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.status, state.message]);

  return (
    <form action={formAction} className="grid gap-6" noValidate>
      {state.message ? (
        <div
          role={state.status === "error" ? "alert" : "status"}
          className={`rounded-[1.5rem] border px-5 py-4 text-sm font-semibold ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <section
        aria-labelledby="settings-seo-title"
        className="rounded-[1.75rem] border border-white bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
      >
        <h2 id="settings-seo-title" className="text-xl font-black tracking-tight text-slate-950">
          SEO da página
        </h2>
        <div className="mt-5 grid gap-5">
          <SettingsField
            name="seoTitle"
            label="Título de SEO"
            defaultValue={initialValues.seoTitle}
            errors={fieldErrors}
            helper="Aparece no título da aba e nos resultados de busca. Idealmente até 70 caracteres."
          />
          <SettingsField
            name="seoDescription"
            label="Descrição de SEO"
            defaultValue={initialValues.seoDescription}
            errors={fieldErrors}
            helper="Resumo da landing para buscadores e compartilhamentos."
            multiline
          />
        </div>
      </section>

      <section
        aria-labelledby="settings-brand-assets-title"
        className="rounded-[1.75rem] border border-white bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
              Marca
            </p>
            <h2 id="settings-brand-assets-title" className="mt-2 text-xl font-black tracking-tight text-slate-950">
              Nome, logo e ícone do site
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              O nome aparece no cabeçalho. A logo substitui o ícone padrão e o favicon aparece na aba do navegador.
            </p>
          </div>
          <div className="grid gap-5 rounded-3xl bg-slate-50 p-5">
            <SettingsField
              name="companyName"
              label="Nome da marca"
              defaultValue={initialValues.companyName}
              errors={fieldErrors}
              helper="Use o nome que deve aparecer na landing pública."
            />
            <AssetUploadField
              name="logoPath"
              label="Logo do cabeçalho"
              value={logoPath}
              onChange={setLogoPath}
              errors={fieldErrors}
              helper="Selecione JPEG, PNG ou WebP até 5 MB. O upload começa assim que o arquivo é escolhido."
              uploadLabel="Selecionar logo"
              altText={`Logo ${initialValues.companyName}`}
            />
            <AssetUploadField
              name="faviconPath"
              label="Ícone da aba do navegador"
              value={faviconPath}
              onChange={setFaviconPath}
              errors={fieldErrors}
              helper="Use uma imagem quadrada em PNG, WebP ou JPEG. O upload começa ao selecionar o arquivo."
              uploadLabel="Selecionar ícone"
              altText={`Ícone ${initialValues.companyName}`}
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="settings-brand-title"
        className="rounded-[1.75rem] border border-white bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
              Identidade visual
            </p>
            <h2 id="settings-brand-title" className="mt-2 text-xl font-black tracking-tight text-slate-950">
              Cor principal da landing
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use uma cor que combine com a marca. Ela será aplicada em botões, destaques e detalhes visuais da página pública.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <SettingsField
              name="brandColor"
              label="Cor da marca"
              type="color"
              defaultValue={initialValues.brandColor}
              errors={fieldErrors}
              helper="Formato salvo: hexadecimal, por exemplo #10b981."
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="settings-hero-title"
        className="rounded-[1.75rem] border border-white bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
      >
        <h2 id="settings-hero-title" className="text-xl font-black tracking-tight text-slate-950">
          Chamada principal
        </h2>
        <div className="mt-5 grid gap-5">
          <SettingsField
            name="headline"
            label="Título do hero"
            defaultValue={initialValues.headline}
            errors={fieldErrors}
          />
          <SettingsField
            name="subheadline"
            label="Texto de apoio"
            defaultValue={initialValues.subheadline}
            errors={fieldErrors}
            multiline
          />
        </div>
      </section>

      <section
        aria-labelledby="settings-ctas-title"
        className="rounded-[1.75rem] border border-white bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
      >
        <h2 id="settings-ctas-title" className="text-xl font-black tracking-tight text-slate-950">
          Botões de chamada
        </h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <SettingsField
            name="primaryCtaLabel"
            label="Texto do botão principal"
            defaultValue={initialValues.primaryCtaLabel}
            errors={fieldErrors}
          />
          <SettingsField
            name="primaryCtaUrl"
            label="Link do botão principal"
            defaultValue={initialValues.primaryCtaUrl}
            errors={fieldErrors}
            helper="Use #secao, /rota, http:// ou https://."
          />
          <SettingsField
            name="secondaryCtaLabel"
            label="Texto do botão secundário"
            defaultValue={initialValues.secondaryCtaLabel}
            errors={fieldErrors}
          />
          <SettingsField
            name="secondaryCtaUrl"
            label="Link do botão secundário"
            defaultValue={initialValues.secondaryCtaUrl}
            errors={fieldErrors}
            helper="Use #secao, /rota, http:// ou https://."
          />
        </div>
      </section>

      <section
        aria-labelledby="settings-final-cta-title"
        className="rounded-[1.75rem] border border-white bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
      >
        <h2 id="settings-final-cta-title" className="text-xl font-black tracking-tight text-slate-950">
          Chamada final
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Texto exibido na área de contato da landing, perto do formulário de lead.
        </p>
        <div className="mt-5 grid gap-5">
          <SettingsField
            name="ctaTitle"
            label="Título da área de contato"
            defaultValue={initialValues.ctaTitle}
            errors={fieldErrors}
            helper="Use uma chamada direta para incentivar o visitante a pedir contato."
          />
          <SettingsField
            name="ctaDescription"
            label="Texto da área de contato"
            defaultValue={initialValues.ctaDescription}
            errors={fieldErrors}
            helper="Explique o próximo passo com clareza, sem falar sobre bastidores da página."
            multiline
          />
        </div>
      </section>

      <section
        aria-labelledby="settings-lead-form-title"
        className="rounded-[1.75rem] border border-white bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
      >
        <h2 id="settings-lead-form-title" className="text-xl font-black tracking-tight text-slate-950">
          Textos do formulário público
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Ajuste os textos visíveis no formulário de contato da página pública.
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <SettingsField
            name="leadFormTitle"
            label="Título do formulário"
            defaultValue={initialValues.leadFormTitle}
            errors={fieldErrors}
          />
          <SettingsField
            name="leadFormSubmitLabel"
            label="Texto do botão de envio"
            defaultValue={initialValues.leadFormSubmitLabel}
            errors={fieldErrors}
          />
          <div className="md:col-span-2">
            <SettingsField
              name="leadFormDescription"
              label="Descrição do formulário"
              defaultValue={initialValues.leadFormDescription}
              errors={fieldErrors}
              multiline
            />
          </div>
          <SettingsField
            name="leadFormSuccessTitle"
            label="Título após envio"
            defaultValue={initialValues.leadFormSuccessTitle}
            errors={fieldErrors}
            helper="Pode ficar vazio se você quiser mostrar apenas a mensagem."
          />
          <SettingsField
            name="leadFormSuccessDismissLabel"
            label="Botão após envio"
            defaultValue={initialValues.leadFormSuccessDismissLabel}
            errors={fieldErrors}
          />
          <div className="md:col-span-2">
            <SettingsField
              name="leadFormSuccessMessage"
              label="Mensagem após envio"
              defaultValue={initialValues.leadFormSuccessMessage}
              errors={fieldErrors}
              multiline
            />
          </div>
          <SettingsField
            name="leadFormRequiredLabel"
            label="Texto de obrigatório"
            defaultValue={initialValues.leadFormRequiredLabel}
            errors={fieldErrors}
            helper="Deixe vazio para ocultar o marcador visual de obrigatório."
          />
          <SettingsField
            name="leadFormNameLabel"
            label="Rótulo do campo nome"
            defaultValue={initialValues.leadFormNameLabel}
            errors={fieldErrors}
          />
          <SettingsField
            name="leadFormEmailLabel"
            label="Rótulo do campo e-mail"
            defaultValue={initialValues.leadFormEmailLabel}
            errors={fieldErrors}
          />
          <SettingsField
            name="leadFormPhoneLabel"
            label="Rótulo do campo telefone"
            defaultValue={initialValues.leadFormPhoneLabel}
            errors={fieldErrors}
          />
          <SettingsField
            name="leadFormCompanyLabel"
            label="Rótulo do campo empresa"
            defaultValue={initialValues.leadFormCompanyLabel}
            errors={fieldErrors}
          />
          <SettingsField
            name="leadFormMessageLabel"
            label="Rótulo do campo mensagem"
            defaultValue={initialValues.leadFormMessageLabel}
            errors={fieldErrors}
          />
          <div className="md:col-span-2">
            <SettingsField
              name="leadFormPhoneHelper"
              label="Ajuda do campo telefone"
              defaultValue={initialValues.leadFormPhoneHelper}
              errors={fieldErrors}
            />
          </div>
          <div className="md:col-span-2">
            <SettingsField
              name="leadFormMessageHelper"
              label="Ajuda do campo mensagem"
              defaultValue={initialValues.leadFormMessageHelper}
              errors={fieldErrors}
            />
          </div>
          <div className="md:col-span-2">
            <SettingsField
              name="leadFormMessagePlaceholder"
              label="Placeholder do campo mensagem"
              defaultValue={initialValues.leadFormMessagePlaceholder}
              errors={fieldErrors}
              multiline
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="settings-contact-title"
        className="rounded-[1.75rem] border border-white bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
      >
        <h2 id="settings-contact-title" className="text-xl font-black tracking-tight text-slate-950">
          Contatos
        </h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <SettingsField
            name="whatsappNumber"
            label="Número de WhatsApp"
            type="tel"
            defaultValue={initialValues.whatsappNumber}
            errors={fieldErrors}
            helper="Informe com DDD. Pode usar máscara; salvaremos apenas os números."
          />
          <SettingsField
            name="contactPhone"
            label="Telefone de contato"
            type="tel"
            defaultValue={initialValues.contactPhone}
            errors={fieldErrors}
          />
          <div className="md:col-span-2">
            <SettingsField
              name="whatsappMessage"
              label="Mensagem padrão do WhatsApp"
              defaultValue={initialValues.whatsappMessage}
              errors={fieldErrors}
              multiline
            />
          </div>
          <div className="md:col-span-2">
            <SettingsField
              name="contactEmail"
              label="E-mail de contato"
              type="email"
              defaultValue={initialValues.contactEmail}
              errors={fieldErrors}
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="settings-notifications-title"
        className="rounded-[1.75rem] border border-white bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
              Notificações
            </p>
            <h2 id="settings-notifications-title" className="mt-2 text-xl font-black tracking-tight text-slate-950">
              Envio de leads por e-mail
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Quando ativado, cada novo lead válido salvo no banco também gera uma notificação pelo Resend.
            </p>
          </div>

          <div className="grid gap-5 rounded-3xl bg-slate-50 p-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <label htmlFor="notifyLeadsByEmail" className="flex items-start gap-3">
                <input
                  id="notifyLeadsByEmail"
                  name="notifyLeadsByEmail"
                  type="checkbox"
                  defaultChecked={initialValues.notifyLeadsByEmail}
                  className="mt-1 size-5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                />
                <span>
                  <span className="block text-sm font-black text-slate-950">Enviar novos leads por e-mail</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">
                    O envio depende de <code className="font-bold text-slate-900">RESEND_API_KEY</code> e{" "}
                    <code className="font-bold text-slate-900">RESEND_FROM_EMAIL</code> configurados no ambiente do servidor.
                  </span>
                </span>
              </label>
            </div>

            <SettingsField
              name="leadNotificationEmail"
              label="E-mail que receberá os leads"
              type="email"
              defaultValue={initialValues.leadNotificationEmail}
              errors={fieldErrors}
              helper="Obrigatório quando a notificação por e-mail estiver ativada."
            />
          </div>
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-[1.5rem] border border-white bg-white/90 p-4 shadow-[0_20px_55px_rgba(15,23,42,0.14)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold leading-6 text-slate-600">
          Revise os campos antes de salvar. A publicação é aplicada na landing principal.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-black uppercase tracking-[0.14em] text-emerald-300 transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-slate-100"
        >
          {isPending ? "Salvando..." : "Salvar configurações"}
        </button>
      </div>
    </form>
  );
}
