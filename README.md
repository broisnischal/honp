# Hono CF Worker Template (Vite 8 + D1 + Drizzle + Better Auth + SSR)

A modern Cloudflare Workers starter with:

- `hono` for routing
- `vite@8` for local DX + build
- Cloudflare D1 + `drizzle-orm` for data
- `better-auth` for auth endpoints
- React SSR example route (`renderToString`)

## Quick Start

```bash
bun install
cp .dev.vars.example .dev.vars
bun run dev
```

Open:

- `http://127.0.0.1:5173/`
- `http://127.0.0.1:5173/auth`
- `http://127.0.0.1:5173/react-ssr`
- `http://127.0.0.1:5173/api/health`

## One-Time Cloudflare Setup

1. Create D1 database:

```bash
bun run db:create
```

2. Put returned IDs in `wrangler.jsonc`:

- `database_id`
- `preview_database_id`

3. Generate and apply schema:

```bash
bun run db:generate
bun run db:migrate:local
# then for real environment
bun run db:migrate:remote
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

- `bun run dev` - local dev with Vite + Hono CF adapter
- `bun run dev:wrangler` - run worker with Wrangler directly
- `bun run typecheck` - TypeScript check
- `bun run build` - production build (`dist/_worker.js`)
- `bun run deploy` - build + Cloudflare deploy
- `bun run db:generate` - generate Drizzle SQL migrations
- `bun run db:migrate:local` - apply migrations to local D1
- `bun run db:migrate:remote` - apply migrations to remote D1
- `bun run db:studio` - launch Drizzle Studio
- `bun run cf-typegen` - regenerate Cloudflare binding types

## Deploy

```bash
bun run deploy
```

This deploys `dist/_worker.js` through Wrangler.
