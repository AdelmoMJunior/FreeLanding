# FreeLanding

FreeLanding is a Next.js application for building and editing professional landing pages. The first landing page will serve a commercial automation system, with an editable public page and a protected admin panel in later stages.

## Current Scope

- Next.js App Router with TypeScript.
- Tailwind CSS v4 through PostCSS.
- ESLint with Next.js Core Web Vitals and TypeScript rules.
- Minimal public home page.

Supabase, admin authentication, editable content, uploads, leads, Google Analytics, and WhatsApp integration are planned but not implemented yet.

## Requirements

- Node.js `>=20.9.0`.
- npm, using the committed `package-lock.json`.

## Setup

```bash
npm install
```

Create a local env file when integrations are added.

macOS, Linux, or Git Bash:

```bash
cp .env.example .env.local
```

Windows cmd:

```cmd
copy .env.example .env.local
```

The current app shell does not require environment variables to run or build.

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

`npm run typecheck` runs `next typegen` before `tsc --noEmit` because Next.js 16 generates route types under `.next/`.

There is no test command yet. Add one when validation, data access, authentication, forms, or other testable logic is introduced.

## Environment Variables

The placeholders in `.env.example` are for upcoming Supabase, analytics, and server-side features. Do not commit real values.

- `NEXT_PUBLIC_SUPABASE_URL`: public Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public Supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase key; never import into client components.
- `NEXT_PUBLIC_GA_ID`: optional Google Analytics measurement ID.

## Security Notes

- Admin routes and mutations must verify authorization on the server.
- Public forms, uploads, and admin writes must validate input server-side.
- Do not allow arbitrary upload paths or unrestricted file types.
- Avoid rendering editable HTML until sanitization rules are explicitly implemented.

## Known Tooling Note

`npm audit --audit-level=moderate` currently reports a transitive `next`/`postcss` advisory. The npm suggested forced fix downgrades Next.js to 9.x, so it should not be applied blindly; track a safe upstream Next.js update instead.
