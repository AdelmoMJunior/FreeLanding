create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  seo_title text not null default '',
  seo_description text not null default '',
  seo_image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.landing_settings (
  landing_page_id uuid primary key references public.landing_pages (id) on delete cascade,
  headline text not null default '',
  subheadline text not null default '',
  primary_cta_label text not null default '',
  primary_cta_url text not null default '',
  secondary_cta_label text not null default '',
  secondary_cta_url text not null default '',
  whatsapp_number text not null default '',
  whatsapp_message text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.system_modules (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references public.landing_pages (id) on delete cascade,
  title text not null,
  description text not null,
  image_path text,
  image_alt text not null default '',
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.benefits (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references public.landing_pages (id) on delete cascade,
  title text not null,
  description text not null,
  icon_name text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references public.landing_pages (id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references public.landing_pages (id) on delete restrict,
  name text not null,
  email text not null,
  phone text,
  company text,
  message text not null,
  source text not null default 'landing_page' check (length(trim(source)) > 0),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed', 'spam')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references public.landing_pages (id) on delete cascade,
  bucket text not null default 'landing-images' check (bucket = 'landing-images'),
  path text not null unique check (length(trim(path)) > 0 and position('..' in path) = 0),
  alt_text text not null default '',
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 5242880),
  uploaded_by uuid references auth.users (id) on delete set null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create index landing_pages_status_idx on public.landing_pages (status);
create index system_modules_page_active_order_idx on public.system_modules (landing_page_id, is_active, sort_order);
create index benefits_page_active_order_idx on public.benefits (landing_page_id, is_active, sort_order);
create index faqs_page_active_order_idx on public.faqs (landing_page_id, is_active, sort_order);
create index leads_page_created_idx on public.leads (landing_page_id, created_at desc);
create index leads_status_created_idx on public.leads (status, created_at desc);
create index media_assets_page_public_idx on public.media_assets (landing_page_id, is_public);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.is_published_landing(page_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.landing_pages
    where id = page_id
      and status = 'published'
  );
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_landing_pages_updated_at
before update on public.landing_pages
for each row execute function public.set_updated_at();

create trigger set_landing_settings_updated_at
before update on public.landing_settings
for each row execute function public.set_updated_at();

create trigger set_system_modules_updated_at
before update on public.system_modules
for each row execute function public.set_updated_at();

create trigger set_benefits_updated_at
before update on public.benefits
for each row execute function public.set_updated_at();

create trigger set_faqs_updated_at
before update on public.faqs
for each row execute function public.set_updated_at();

create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.landing_pages enable row level security;
alter table public.landing_settings enable row level security;
alter table public.system_modules enable row level security;
alter table public.benefits enable row level security;
alter table public.faqs enable row level security;
alter table public.leads enable row level security;
alter table public.media_assets enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.landing_pages, public.landing_settings, public.system_modules, public.benefits, public.faqs, public.media_assets to anon;
grant select, insert, update, delete on public.profiles, public.landing_pages, public.landing_settings, public.system_modules, public.benefits, public.faqs, public.leads, public.media_assets to authenticated;

revoke all on function public.is_admin() from public;
revoke all on function public.is_published_landing(uuid) from public;
revoke all on function public.set_updated_at() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_published_landing(uuid) to anon, authenticated;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()) or public.is_admin());

create policy "Admins can manage profiles"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Published landing pages are readable"
on public.landing_pages
for select
to anon, authenticated
using (status = 'published');

create policy "Admins can manage landing pages"
on public.landing_pages
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Published landing settings are readable"
on public.landing_settings
for select
to anon, authenticated
using (public.is_published_landing(landing_page_id));

create policy "Admins can manage landing settings"
on public.landing_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Active modules are readable"
on public.system_modules
for select
to anon, authenticated
using (is_active and public.is_published_landing(landing_page_id));

create policy "Admins can manage modules"
on public.system_modules
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Active benefits are readable"
on public.benefits
for select
to anon, authenticated
using (is_active and public.is_published_landing(landing_page_id));

create policy "Admins can manage benefits"
on public.benefits
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Active FAQs are readable"
on public.faqs
for select
to anon, authenticated
using (is_active and public.is_published_landing(landing_page_id));

create policy "Admins can manage FAQs"
on public.faqs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage leads"
on public.leads
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Published media assets are readable"
on public.media_assets
for select
to anon, authenticated
using (is_public and public.is_published_landing(landing_page_id));

create policy "Admins can manage media assets"
on public.media_assets
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
