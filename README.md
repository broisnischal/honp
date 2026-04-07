# Hono CF Worker Template (Vite 8 + D1 + Drizzle + Better Auth + SSR)

A modern Cloudflare Workers starter with:

- `hono` for routing
- `vite@8` for local DX + build
- Cloudflare D1 + `drizzle-orm` for data
- `better-auth` for auth endpoints
- React SSR example route (`renderToString`)

## Quick Start

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Open:

- `http://127.0.0.1:5173/`
- `http://127.0.0.1:5173/react-ssr`
- `http://127.0.0.1:5173/api/health`

## One-Time Cloudflare Setup

1. Create D1 database:

```bash
npm run db:create
```

2. Put returned IDs in `wrangler.jsonc`:

- `database_id`
- `preview_database_id`

3. Generate and apply schema:

```bash
npm run db:generate
npm run db:migrate:local
# then for real environment
npm run db:migrate:remote
```

## Local Auth Config

Set `.dev.vars`:

```env
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://127.0.0.1:5173
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Auth endpoints are mounted at:

- `/api/auth/*`
- session helper route: `/api/session`

## Scripts

- `npm run dev` - local dev with Vite + Hono CF adapter
- `npm run dev:wrangler` - run worker with Wrangler directly
- `npm run typecheck` - TypeScript check
- `npm run build` - production build (`dist/_worker.js`)
- `npm run deploy` - build + Cloudflare deploy
- `npm run db:generate` - generate Drizzle SQL migrations
- `npm run db:migrate:local` - apply migrations to local D1
- `npm run db:migrate:remote` - apply migrations to remote D1
- `npm run db:studio` - launch Drizzle Studio
- `npm run cf-typegen` - regenerate Cloudflare binding types

## Deploy

```bash
npm run deploy
```

This deploys `dist/_worker.js` through Wrangler.
