alter table public.landing_settings
  alter column company_name set default 'Sua Empresa';

update public.landing_settings
set company_name = 'Sua Empresa'
where trim(company_name) = 'FreeLanding';

alter table public.landing_settings
  add column if not exists lead_form_title text not null default 'Fale com a equipe',
  add column if not exists lead_form_description text not null default 'Envie seus dados para receber um retorno objetivo sobre sua necessidade.',
  add column if not exists lead_form_submit_label text not null default 'Enviar contato',
  add column if not exists lead_form_success_title text not null default 'Mensagem enviada',
  add column if not exists lead_form_success_message text not null default 'Recebemos seus dados. Em breve alguém entra em contato pelo canal informado.',
  add column if not exists lead_form_success_dismiss_label text not null default 'OK',
  add column if not exists lead_form_required_label text not null default 'obrigatório',
  add column if not exists lead_form_name_label text not null default 'Nome',
  add column if not exists lead_form_email_label text not null default 'E-mail',
  add column if not exists lead_form_phone_label text not null default 'WhatsApp ou telefone',
  add column if not exists lead_form_phone_helper text not null default 'Opcional, mas ajuda no retorno rápido.',
  add column if not exists lead_form_company_label text not null default 'Empresa',
  add column if not exists lead_form_message_label text not null default 'Mensagem',
  add column if not exists lead_form_message_helper text not null default 'Opcional. Use se quiser adiantar o principal ponto da conversa.',
  add column if not exists lead_form_message_placeholder text not null default 'Ex.: quero entender valores, prazos ou como a solução se aplica ao meu caso.';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'landing_settings_lead_form_copy_length_check'
  ) then
    alter table public.landing_settings
      add constraint landing_settings_lead_form_copy_length_check
      check (
        length(trim(lead_form_title)) between 1 and 80
        and length(trim(lead_form_description)) between 1 and 220
        and length(trim(lead_form_submit_label)) between 1 and 48
        and length(trim(lead_form_success_title)) <= 80
        and length(trim(lead_form_success_message)) between 1 and 220
        and length(trim(lead_form_success_dismiss_label)) between 1 and 24
        and length(trim(lead_form_required_label)) <= 32
        and length(trim(lead_form_name_label)) between 1 and 48
        and length(trim(lead_form_email_label)) between 1 and 48
        and length(trim(lead_form_phone_label)) between 1 and 48
        and length(trim(lead_form_phone_helper)) <= 140
        and length(trim(lead_form_company_label)) between 1 and 48
        and length(trim(lead_form_message_label)) between 1 and 48
        and length(trim(lead_form_message_helper)) <= 160
        and length(trim(lead_form_message_placeholder)) <= 180
      )
      not valid;
  end if;
end $$;
