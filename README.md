# React Router v7 + Cloudflare Workers Template

A modern Cloudflare Workers starter with:

- `react-router@7` in framework mode (SSR)
- `vite@8` + `@cloudflare/vite-plugin`
- Cloudflare D1 + `drizzle-orm`
- `better-auth` email/password flow
- `up-fetch` API client pattern in loaders/actions
- simple product/order pattern (create + list)

## Quick Start

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Open:

- `http://127.0.0.1:5173/`
- `http://127.0.0.1:5173/auth`
- `http://127.0.0.1:5173/orders`
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

## Pattern Routes

- pages:
  - `/auth` (sign-up/sign-in/sign-out)
  - `/orders` (protected page, create + list orders)
- APIs:
  - `/api/auth/*`
  - `/api/session`
  - `/api/products`
  - `/api/orders` (GET, POST)

## Scripts

- `npm run dev` - React Router dev server
- `npm run dev:wrangler` - run worker with Wrangler directly
- `npm run typecheck` - TypeScript check
- `npm run build` - production build (`build/client`, `build/server`)
- `npm run preview` - preview production build
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

Deploy uses `workers/app.ts` as the Worker entrypoint.
