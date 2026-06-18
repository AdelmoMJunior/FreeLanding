alter table public.landing_settings
  add column if not exists company_name text not null default 'Sua Empresa',
  add column if not exists logo_path text,
  add column if not exists favicon_path text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'landing_settings_company_name_length_check'
  ) then
    alter table public.landing_settings
      add constraint landing_settings_company_name_length_check
      check (length(trim(company_name)) between 1 and 80)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'landing_settings_logo_path_length_check'
  ) then
    alter table public.landing_settings
      add constraint landing_settings_logo_path_length_check
      check (logo_path is null or length(trim(logo_path)) <= 512)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'landing_settings_favicon_path_length_check'
  ) then
    alter table public.landing_settings
      add constraint landing_settings_favicon_path_length_check
      check (favicon_path is null or length(trim(favicon_path)) <= 512)
      not valid;
  end if;
end $$;
