do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_name_length_check'
  ) then
    alter table public.leads
      add constraint leads_name_length_check
      check (length(trim(name)) between 1 and 80)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'leads_email_length_check'
  ) then
    alter table public.leads
      add constraint leads_email_length_check
      check (length(trim(email)) between 3 and 254)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'leads_phone_length_check'
  ) then
    alter table public.leads
      add constraint leads_phone_length_check
      check (phone is null or length(trim(phone)) <= 40)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'leads_company_length_check'
  ) then
    alter table public.leads
      add constraint leads_company_length_check
      check (company is null or length(trim(company)) <= 100)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'leads_message_length_check'
  ) then
    alter table public.leads
      add constraint leads_message_length_check
      check (length(trim(message)) between 20 and 1000)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'leads_metadata_size_check'
  ) then
    alter table public.leads
      add constraint leads_metadata_size_check
      check (octet_length(metadata::text) <= 8192)
      not valid;
  end if;
end $$;
