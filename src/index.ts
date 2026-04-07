import type { D1Database } from "@cloudflare/workers-types";
import { Hono } from "hono";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

import { createAuth } from "./lib/auth";
import { AuthPage, type SessionShape } from "./views/auth-page";
import { HonoShowcase } from "./views/hono-showcase";
import { ReactAuthPanel } from "./views/react-auth-panel";

type Bindings = {
  DB: D1Database;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_TRUSTED_ORIGINS?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.html(
    HonoShowcase({
      title: "Hono Worker Template",
      description: "Hono + Cloudflare Workers + D1 + Drizzle + Better Auth + React SSR",
      links: [
        { href: "/auth", label: "Auth page (React state + client render)" },
        { href: "/react-ssr", label: "SSR page (React renderToString)" },
        { href: "/api/health", label: "Health endpoint" },
        { href: "/api/session", label: "Current Better Auth session" },
      ],
    }),
  );
});

app.get("/auth", async (c) => {
  const auth = createAuth(c.env, c.req.url);
  const serverSession = (await auth.api.getSession({
    headers: c.req.raw.headers,
  })) as SessionShape;

  const markup = renderToString(
    createElement(AuthPage, {
      signUpApiPath: "/api/auth/sign-up/email",
      signInApiPath: "/api/auth/sign-in/email",
      signOutApiPath: "/api/auth/sign-out",
      sessionApiPath: "/api/session",
      initialSession: serverSession ?? null,
    }),
  );
  const safeConfig = JSON.stringify({
    initialSession: serverSession ?? null,
  }).replaceAll("<", "\\u003c");

  return c.html(`<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link href="/src/styles.css" rel="stylesheet" />
      <title>Auth</title>
    </head>
    <body class="bg-white text-slate-900">
      <div id="root">${markup}</div>
      <script>window.__AUTH_PAGE_CONFIG__=${safeConfig};</script>
      <script type="module" src="/src/auth-hydrate.tsx"></script>
    </body>
  </html>`);
});

app.get("/hono-jsx", (c) => {
  return c.html(
    HonoShowcase({
      title: "Hono JSX Page",
      description:
        "This page is returned by Hono using JSX from src/views/hono-showcase.tsx.",
      links: [
        { href: "/react-ssr", label: "See React SSR example" },
        { href: "/auth", label: "Open signup/login demo" },
        { href: "/api/session", label: "Better Auth session endpoint (API)" },
        { href: "/", label: "Back to home" },
      ],
    }),
  );
});

app.get("/react-ssr", (c) => {
  const markup = renderToString(
    createElement(ReactAuthPanel, {
      authApiPath: "/api/auth/sign-in/email",
      sessionApiPath: "/api/session",
    }),
  );

  return c.html(`<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link href="/src/styles.css" rel="stylesheet" />
      <title>React SSR</title>
    </head>
    <body class="bg-white text-slate-900">${markup}</body>
  </html>`);
});

app.on(["GET", "POST"], "/api/auth/*", async (c) => {
  try {
    const auth = createAuth(c.env, c.req.url);
    return auth.handler(c.req.raw);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Auth config error";
    return c.json({ error: message }, 500);
  }
});

app.get("/api/health", (c) => {
  return c.json({ ok: true, runtime: "cloudflare-workers", framework: "hono" });
});

app.get("/api/session", async (c) => {
  try {
    const auth = createAuth(c.env, c.req.url);
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    return c.json(session ?? null);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Session fetch failed";
    return c.json({ error: message }, 500);
  }
});

export default app;
