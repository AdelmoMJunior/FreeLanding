alter table public.landing_settings
  add column if not exists cta_title text not null default '',
  add column if not exists cta_description text not null default '';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'landing_settings_cta_title_length_check'
  ) then
    alter table public.landing_settings
      add constraint landing_settings_cta_title_length_check
      check (length(trim(cta_title)) <= 140)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'landing_settings_cta_description_length_check'
  ) then
    alter table public.landing_settings
      add constraint landing_settings_cta_description_length_check
      check (length(trim(cta_description)) <= 360)
      not valid;
  end if;
end $$;
