import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { D1Database } from "@cloudflare/workers-types";

import { getDb } from "../db/client";
import { schema } from "../db/schema";

export type AuthEnv = {
  DB: D1Database;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_TRUSTED_ORIGINS?: string;
};

const parseTrustedOrigins = (value?: string) => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const createAuth = (env: AuthEnv, requestUrl: string) => {
  const db = getDb(env.DB);
  const fallbackBaseUrl = new URL(requestUrl).origin;

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL ?? fallbackBaseUrl,
    trustedOrigins: parseTrustedOrigins(env.BETTER_AUTH_TRUSTED_ORIGINS),
    emailAndPassword: {
      enabled: true,
    },
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
  });
};
