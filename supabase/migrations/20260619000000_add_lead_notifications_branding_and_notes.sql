alter table public.landing_settings
  add column if not exists brand_color text not null default '#10b981',
  add column if not exists notify_leads_by_email boolean not null default false,
  add column if not exists lead_notification_email text not null default '';

alter table public.leads
  add column if not exists admin_notes text not null default '';

do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'leads_message_length_check'
  ) then
    alter table public.leads drop constraint leads_message_length_check;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'leads_message_optional_length_check'
  ) then
    alter table public.leads
      add constraint leads_message_optional_length_check
      check (length(trim(message)) <= 1000)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'leads_admin_notes_length_check'
  ) then
    alter table public.leads
      add constraint leads_admin_notes_length_check
      check (length(trim(admin_notes)) <= 2000)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'landing_settings_brand_color_check'
  ) then
    alter table public.landing_settings
      add constraint landing_settings_brand_color_check
      check (brand_color ~ '^#[0-9a-f]{6}$')
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'landing_settings_lead_notification_email_length_check'
  ) then
    alter table public.landing_settings
      add constraint landing_settings_lead_notification_email_length_check
      check (length(trim(lead_notification_email)) <= 254)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'landing_settings_lead_notification_email_format_check'
  ) then
    alter table public.landing_settings
      add constraint landing_settings_lead_notification_email_format_check
      check (
        lead_notification_email = ''
        or lead_notification_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
      )
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'landing_settings_lead_notification_enabled_email_check'
  ) then
    alter table public.landing_settings
      add constraint landing_settings_lead_notification_enabled_email_check
      check (notify_leads_by_email = false or length(trim(lead_notification_email)) > 0)
      not valid;
  end if;
end $$;

create index if not exists leads_status_created_id_idx on public.leads (status, created_at desc, id desc);
create index if not exists leads_created_id_idx on public.leads (created_at desc, id desc);
