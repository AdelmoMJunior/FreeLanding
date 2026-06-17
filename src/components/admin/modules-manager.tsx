"use client";

import { useActionState, useState, type ChangeEvent, type ReactNode } from "react";

import {
  deleteModuleAction,
  moveModuleAction,
  saveModuleAction,
  toggleModuleStatusAction,
  type ModuleActionState,
} from "@/lib/landing/module-actions";
import type { AdminModule } from "@/lib/landing/module-types";
import type { ModuleField, ModuleFieldErrors } from "@/lib/validations/module";

type AdminModulesManagerProps = Readonly<{
  modules: readonly AdminModule[];
  nextSortOrder: number;
}>;

type ModuleFormProps = Readonly<{
  module?: AdminModule;
  nextSortOrder?: number;
  legend: string;
  submitLabel: string;
}>;

type ModuleFieldProps = Readonly<{
  formId: string;
  name: ModuleField;
  label: string;
  defaultValue: string | number;
  value?: string | number;
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors?: ModuleFieldErrors;
  helper?: string;
  type?: "number" | "text" | "url";
  multiline?: boolean;
}>;

const initialActionState: ModuleActionState = { status: "idle" };

const inputClassName =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 aria-[invalid=true]:border-red-300 aria-[invalid=true]:focus:border-red-600 aria-[invalid=true]:focus:ring-red-100";

const secondaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-700 transition hover:border-slate-950 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-50";

function fieldDescriptionIds(formId: string, name: ModuleField, helper?: string, error?: string) {
  return [helper ? `${formId}-${name}-helper` : null, error ? `${formId}-${name}-error` : null]
    .filter(Boolean)
    .join(" ");
}

function ModuleTextField({
  formId,
  name,
  label,
  defaultValue,
  value,
  onChange,
  errors,
  helper,
  type = "text",
  multiline = false,
}: ModuleFieldProps) {
  const error = errors?.[name];
  const describedBy = fieldDescriptionIds(formId, name, helper, error);
  const id = `${formId}-${name}`;
  const valueProps = value === undefined ? { defaultValue } : { value, onChange };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-black text-slate-900">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          {...valueProps}
          rows={4}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy || undefined}
          className={`${inputClassName} min-h-32 resize-y leading-6`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          {...valueProps}
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

type UploadStatus = "idle" | "uploading" | "success" | "error";

type UploadMessage = Readonly<{
  status: UploadStatus;
  text: string;
}>;

type UploadResponse = Readonly<{
  imagePath?: unknown;
  error?: unknown;
}>;

function ModuleForm({ module, nextSortOrder = 0, legend, submitLabel }: ModuleFormProps) {
  const [state, formAction, isPending] = useActionState(saveModuleAction, initialActionState);
  const [imagePath, setImagePath] = useState(module?.imagePath ?? "");
  const [imageAlt, setImageAlt] = useState(module?.imageAlt ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<UploadMessage>({ status: "idle", text: "" });
  const formId = module ? `module-${module.id}` : "module-new";
  const fieldErrors = state.fieldErrors;
  const uploadStatusId = `${formId}-image-upload-status`;

  async function handleImageUpload() {
    if (!selectedFile) {
      setUploadMessage({ status: "error", text: "Selecione uma imagem antes de enviar." });
      return;
    }

    setUploadMessage({ status: "uploading", text: "Enviando imagem..." });

    const uploadFormData = new FormData();
    uploadFormData.append("file", selectedFile);
    uploadFormData.append("altText", imageAlt.trim());

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: uploadFormData,
      });
      const payload = (await response.json().catch(() => ({}))) as UploadResponse;

      if (!response.ok) {
        const errorMessage = typeof payload.error === "string" ? payload.error : "Não foi possível enviar a imagem.";
        setUploadMessage({ status: "error", text: errorMessage });
        return;
      }

      if (typeof payload.imagePath !== "string" || !payload.imagePath) {
        setUploadMessage({ status: "error", text: "Upload concluído, mas o caminho da imagem não foi retornado." });
        return;
      }

      setImagePath(payload.imagePath);
      setUploadMessage({
        status: "success",
        text: "Imagem enviada. O caminho foi preenchido automaticamente; salve o módulo para publicar a alteração.",
      });
    } catch {
      setUploadMessage({ status: "error", text: "Falha de conexão ao enviar a imagem. Tente novamente." });
    }
  }

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <fieldset className="grid gap-5">
        <legend className="sr-only">{legend}</legend>
        {module ? <input type="hidden" name="id" value={module.id} /> : null}

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
          <ModuleTextField
            formId={formId}
            name="title"
            label="Título do módulo"
            defaultValue={module?.title ?? ""}
            errors={fieldErrors}
          />
          <ModuleTextField
            formId={formId}
            name="sortOrder"
            label="Ordem"
            type="number"
            defaultValue={module?.sortOrder ?? nextSortOrder}
            errors={fieldErrors}
            helper="Menores números aparecem primeiro."
          />
          <div className="md:col-span-2">
            <ModuleTextField
              formId={formId}
              name="description"
              label="Descrição"
              defaultValue={module?.description ?? ""}
              errors={fieldErrors}
              multiline
            />
          </div>
          <ModuleTextField
            formId={formId}
            name="imagePath"
            label="Caminho da imagem"
            type="url"
            defaultValue={module?.imagePath ?? ""}
            value={imagePath}
            onChange={(event) => setImagePath(event.target.value)}
            errors={fieldErrors}
            helper="Use um caminho relativo seguro ou o caminho preenchido pelo upload abaixo."
          />
          <div>
            <ModuleTextField
              formId={formId}
              name="imageAlt"
              label="Texto alternativo da imagem"
              defaultValue={module?.imageAlt ?? ""}
              value={imageAlt}
              onChange={(event) => setImageAlt(event.target.value)}
              errors={fieldErrors}
              helper="Usado também como texto alternativo no registro do upload."
            />
          </div>
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label htmlFor={`${formId}-image-upload`} className="block text-sm font-black text-slate-900">
              Enviar imagem do módulo
            </label>
            <p id={`${formId}-image-upload-helper`} className="mt-2 text-xs leading-5 text-slate-500">
              Formatos aceitos: JPEG, PNG ou WebP até 5 MB. Após o envio, confira o caminho e salve o módulo.
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                id={`${formId}-image-upload`}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  setSelectedFile(event.target.files?.[0] ?? null);
                  setUploadMessage({ status: "idle", text: "" });
                }}
                aria-describedby={`${formId}-image-upload-helper ${uploadStatusId}`}
                className="block w-full text-sm font-semibold text-slate-700 file:mr-4 file:min-h-10 file:rounded-full file:border-0 file:bg-white file:px-4 file:text-xs file:font-black file:uppercase file:tracking-[0.14em] file:text-slate-700 file:shadow-sm hover:file:bg-slate-100 sm:max-w-md"
              />
              <button
                type="button"
                onClick={handleImageUpload}
                disabled={!selectedFile || uploadMessage.status === "uploading"}
                className={secondaryButtonClassName}
              >
                {uploadMessage.status === "uploading" ? "Enviando..." : "Enviar imagem"}
              </button>
            </div>
            <p
              id={uploadStatusId}
              role="status"
              aria-live="polite"
              className={`mt-3 min-h-5 text-sm font-semibold ${
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
        </div>

        <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label htmlFor={`${formId}-isActive`} className="flex items-center gap-3 text-sm font-bold text-slate-800">
            <input
              id={`${formId}-isActive`}
              name="isActive"
              type="checkbox"
              defaultChecked={module?.isActive ?? true}
              className="size-5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
            />
            Publicar módulo na landing
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

export function AdminModulesManager({ modules, nextSortOrder }: AdminModulesManagerProps) {
  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] bg-white/90 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] ring-1 ring-white sm:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-800">Módulos</p>
        <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Módulos do sistema comercial
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Cadastre, ordene e publique os blocos de funcionalidades exibidos na landing page.
        </p>
      </section>

      <section
        aria-labelledby="module-create-title"
        className="rounded-[1.75rem] border border-white bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
      >
        <h2 id="module-create-title" className="text-xl font-black tracking-tight text-slate-950">
          Novo módulo
        </h2>
        <div className="mt-5">
          <ModuleForm legend="Criar novo módulo" submitLabel="Criar módulo" nextSortOrder={nextSortOrder} />
        </div>
      </section>

      <section aria-labelledby="module-list-title" className="grid gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="module-list-title" className="text-xl font-black tracking-tight text-slate-950">
              Módulos cadastrados
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              Lista ordenada pela ordem atual de publicação.
            </p>
          </div>
          <span className="text-sm font-black text-emerald-800">
            {modules.length} {modules.length === 1 ? "módulo" : "módulos"}
          </span>
        </div>

        {modules.length ? (
          <div className="grid gap-4">
            {modules.map((module, index) => (
              <article
                key={module.id}
                className="rounded-[1.75rem] border border-white bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
              >
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                      Ordem {module.sortOrder}
                    </p>
                    <h3 className="mt-2 text-lg font-black tracking-tight text-slate-950">
                      {module.title || "Módulo sem título"}
                    </h3>
                    <span
                      className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${
                        module.isActive
                          ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                      }`}
                    >
                      {module.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label={`Ações rápidas para ${module.title || "módulo sem título"}`}
                  >
                    <form action={moveModuleAction}>
                      <input type="hidden" name="id" value={module.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button
                        type="submit"
                        disabled={index === 0}
                        aria-label={`Subir ${module.title || "módulo sem título"}`}
                        className={secondaryButtonClassName}
                      >
                        Subir
                      </button>
                    </form>
                    <form action={moveModuleAction}>
                      <input type="hidden" name="id" value={module.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        type="submit"
                        disabled={index === modules.length - 1}
                        aria-label={`Descer ${module.title || "módulo sem título"}`}
                        className={secondaryButtonClassName}
                      >
                        Descer
                      </button>
                    </form>
                    <SmallActionForm action={toggleModuleStatusAction} id={module.id}>
                      <button
                        type="submit"
                        aria-label={`${module.isActive ? "Desativar" : "Ativar"} ${module.title || "módulo sem título"}`}
                        className={secondaryButtonClassName}
                      >
                        {module.isActive ? "Desativar" : "Ativar"}
                      </button>
                    </SmallActionForm>
                    <SmallActionForm action={deleteModuleAction} id={module.id}>
                      <button
                        type="submit"
                        aria-label={`Remover ${module.title || "módulo sem título"}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 text-xs font-black uppercase tracking-[0.14em] text-red-700 transition hover:border-red-300 hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600"
                      >
                        Remover
                      </button>
                    </SmallActionForm>
                  </div>
                </div>

                <ModuleForm module={module} legend={`Editar módulo ${module.title || "sem título"}`} submitLabel="Salvar módulo" />
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center">
            <h3 className="text-lg font-black text-slate-950">Nenhum módulo cadastrado ainda.</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use o formulário de criação para adicionar o primeiro bloco de funcionalidades da landing.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
