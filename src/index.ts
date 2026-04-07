import type { D1Database } from "@cloudflare/workers-types";
import { Hono } from "hono";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

import { createAuth } from "./lib/auth";
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
        { href: "/react-ssr", label: "SSR page (React renderToString)" },
        { href: "/api/health", label: "Health endpoint" },
        { href: "/api/session", label: "Current Better Auth session" },
      ],
    }),
  );
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

  return c.html(`<!doctype html><html><body>${markup}</body></html>`);
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
