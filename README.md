# FreeLanding

FreeLanding is a Next.js application for building and editing professional landing pages. The first landing page serves a commercial automation system, with an editable public page and a protected admin panel.

## Current Scope

- Next.js App Router with TypeScript.
- Tailwind CSS v4 through PostCSS.
- ESLint with Next.js Core Web Vitals and TypeScript rules.
- Public landing page that can load published settings from Supabase with a static fallback.
- Supabase browser, server, and server-only admin client factories.
- Initial Supabase schema migration with RLS for content, leads, admin profiles, and media metadata.
- Initial admin login flow with server-side admin authorization.
- Protected admin settings screen for editing SEO, hero, CTA, contact, WhatsApp, brand color, and lead notification fields.
- Protected admin module management with create, edit, ordering, active status, and removal.
- Protected admin benefit management with create, edit, ordering, active status, and removal.
- Protected admin FAQ management with create, edit, ordering, active status, and removal.
- Secure admin image uploads to Supabase Storage for landing module images.
- Public lead form with server-side validation, honeypot, payload limit, and rate limiting.
- Protected admin lead listing with status/date filters, pagination, internal notes, and status updates for new, contacted, closed, and spam leads.
- Conditional Google Analytics integration through `NEXT_PUBLIC_GA_ID`.
- Vitest coverage for critical validation helpers: leads, CTA URLs, WhatsApp, uploads, and module fields.
- Production hardening for security headers, same-origin admin mutations, upload request limits, accessibility, and database lead constraints.

The first production-ready pass is implemented; keep deployment-specific limits, monitoring, and upstream dependency advisories under review.

## Requirements

- Node.js `>=20.9.0`.
- npm, using the committed `package-lock.json`.

## Setup

```bash
npm install
```

Create a local env file for Supabase, analytics, and server-side integrations.

macOS, Linux, or Git Bash:

```bash
cp .env.example .env.local
```

Windows cmd:

```cmd
copy .env.example .env.local
```

The public landing attempts to read published page settings from Supabase when public environment values are available. If env values, connection, or content are missing, it falls back to the built-in static landing so local builds still work without real secrets.

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm test
npm run typecheck
npm run build
```

`npm run typecheck` runs `next typegen` before `tsc --noEmit` because Next.js 16 generates route types under `.next/`.

`npm test` runs Vitest unit tests for logic that can be checked without binding to Next.js route handlers.

## Docker / Coolify

The app includes a production `Dockerfile` using Next.js standalone output. Coolify can build from this repository with port `3000`.

Required runtime environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional runtime environment variables:

- `NEXT_PUBLIC_GA_ID`
- `LEAD_FORM_TRUST_PROXY_HEADERS`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Set these public values as Docker build arguments in Coolify too, because Next.js uses them during `next build`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GA_ID`

Local Docker build example:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --build-arg NEXT_PUBLIC_GA_ID="$NEXT_PUBLIC_GA_ID" \
  -t freelanding .
```

Local Docker run example:

```bash
docker run --rm -p 3000:3000 --env-file .env.local freelanding
```

Coolify Docker Compose service file is available at `docker-compose.yml`. It uses the public GitHub repository as the remote Docker build context, so you can paste the compose file in Coolify/Docker and it will fetch the source from GitHub. Set the same variables in the environment/secrets screen; do not commit real values.

If Coolify asks for an image name while configuring the domain, use the service image from the compose file: `freelanding:latest`. Keep `pull_policy: build` in place so Compose builds the image from the GitHub context instead of using Docker Hub.

## Environment Variables

The placeholders in `.env.example` configure the current Supabase, analytics, and server-side features. Do not commit real values.

- `NEXT_PUBLIC_SUPABASE_URL`: public Supabase project URL. It must be present at build/deploy time when serving uploaded module images, because `next/image` remote patterns are derived from this value.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public Supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase key; never import into client components.
- `NEXT_PUBLIC_GA_ID`: optional Google Analytics measurement ID. Only GA4 IDs starting with `G-` are rendered.
- `LEAD_FORM_TRUST_PROXY_HEADERS`: optional `true` only when your deployment proxy overwrites client IP headers; otherwise lead rate limiting uses a shared global key to avoid trusting spoofable headers.
- `RESEND_API_KEY`: optional server-only Resend API key used for lead notification e-mails when enabled in admin settings.
- `RESEND_FROM_EMAIL`: optional verified Resend sender address. Required together with `RESEND_API_KEY` for lead notification e-mails.

Supabase clients live under `src/lib/supabase/`:

- `client.ts`: browser client using public env values only.
- `server.ts`: per-request server client using cookies from `next/headers`.
- `admin.ts`: service-role client guarded by `server-only`.

## Database

Database changes are versioned under `supabase/migrations/`. The initial schema is in `20260616000000_initial_schema.sql`, the `landing-images` Storage bucket is created by `20260617000000_create_landing_images_bucket.sql`, lead hardening constraints are in `20260618000000_harden_leads_constraints.sql`, and lead notification/branding/admin-note fields are in `20260619000000_add_lead_notifications_branding_and_notes.sql`.

The initial schema creates:

- `profiles` for admin/editor roles.
- `landing_pages` and `landing_settings` for page-level content and SEO.
- `system_modules`, `benefits`, and `faqs` for ordered public sections.
- `leads` for contact requests, readable only by admins through RLS.
- `media_assets` for uploaded image metadata, restricted to `landing-images` assets and public metadata reads only when `is_public = true`.

The Storage migration creates the public `landing-images` Supabase Storage bucket for JPEG, PNG, and WebP uploads up to 5 MB. Object URLs in this bucket are intentionally public by path; only upload writes are server-controlled, paths are generated with UUIDs, and uploaded assets must not contain sensitive content.

RLS allows public reads only for published/active landing content. Admin writes require an authenticated user with `profiles.role = 'admin'`. The first admin profile must be inserted manually through trusted SQL or a service-role path before the admin UI can authorize users.

Production Supabase checklist:

- Apply all migrations under `supabase/migrations/`, including the Storage bucket and hardening migrations.
- Create the first admin in Supabase Auth, then insert the matching `profiles` row with `role = 'admin'` through trusted SQL or service-role tooling.
- Ensure there is a published `landing_pages` row and matching `landing_settings` row before relying on database-backed public content; otherwise the landing uses static fallback content.
- Keep `SUPABASE_SERVICE_ROLE_KEY` only in server-side deployment secrets.

To lint the database locally, start the Supabase local stack first and then run:

```bash
npx supabase db lint --local
```

## Security Notes

- Admin routes and mutations must verify authorization on the server.
- `/admin` is session-checked by `src/proxy.ts`; protected admin pages still call `requireAdmin()` for role authorization.
- Public forms, uploads, and admin writes must validate input server-side.
- Public lead submissions go through `/api/leads`, which validates JSON payloads, applies a honeypot, rate limits with a shared global key by default or trusted proxy client headers when explicitly enabled, writes with the server-only Supabase service role, and sends optional Resend notifications without exposing secrets to the client.
- The built-in lead rate limiter is in-memory and process-local. Use platform/WAF rules or a shared external limiter when consistent cross-instance spam protection is required.
- Do not allow arbitrary upload paths or unrestricted file types.
- Image uploads must go through `/api/uploads`, which validates MIME type, file signature, size, admin authorization, same-origin request headers, and request size server-side.
- Admin Server Actions enforce same-origin request headers before mutating data.
- Global security headers are configured in `next.config.ts`; add HSTS at the deployment edge only when HTTPS is guaranteed for the target domain.
- Google Analytics scripts render only when `NEXT_PUBLIC_GA_ID` is a valid GA4 measurement ID.
- Avoid rendering editable HTML until sanitization rules are explicitly implemented.

## Known Tooling Note

`npm audit --audit-level=moderate` currently reports a transitive `next`/`postcss` advisory. The npm suggested forced fix downgrades Next.js to 9.x, so it should not be applied blindly; track a safe upstream Next.js update instead.
