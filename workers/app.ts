import type { D1Database } from "@cloudflare/workers-types";
import { and, desc, eq } from "drizzle-orm";
import { createRequestHandler } from "react-router";

import { getDb } from "../src/db/client";
import { orderItems, orders, products } from "../src/db/schema";
import { createAuth, type AuthEnv } from "../src/lib/auth";

type Bindings = AuthEnv & {
  DB: D1Database;
};

declare module "react-router" {
  interface AppLoadContext {
    cloudflare: {
      env: Bindings;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json; charset=utf-8" },
    ...init,
  });

const handleApi = async (request: Request, env: Bindings): Promise<Response | null> => {
  const url = new URL(request.url);
  const auth = createAuth(env, request.url);
  const db = getDb(env.DB);

  if (url.pathname.startsWith("/api/auth/")) return auth.handler(request);
  if (url.pathname === "/api/health") {
    return json({ ok: true, runtime: "cloudflare-workers", framework: "react-router" });
  }

  if (url.pathname === "/api/session") {
    const session = await auth.api.getSession({ headers: request.headers });
    return json(session ?? null);
  }

  if (url.pathname === "/api/products" && request.method === "GET") {
    const list = await db.select().from(products).where(eq(products.isActive, true));
    return json(list);
  }

  if (url.pathname === "/api/orders" && request.method === "GET") {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return json({ error: "Unauthorized" }, { status: 401 });

    const rows = await db
      .select({
        orderId: orders.id,
        status: orders.status,
        totalCents: orders.totalCents,
        createdAt: orders.createdAt,
        productName: products.name,
        quantity: orderItems.quantity,
        lineTotalCents: orderItems.lineTotalCents,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .leftJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orders.userId, session.user.id))
      .orderBy(desc(orders.createdAt));

    return json(rows);
  }

  if (url.pathname === "/api/orders" && request.method === "POST") {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json()) as { productId?: string; quantity?: number };
    const quantity = Number(body.quantity ?? 1);
    if (!body.productId || !Number.isFinite(quantity) || quantity < 1) {
      return json({ error: "Invalid payload" }, { status: 400 });
    }

    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, body.productId), eq(products.isActive, true)))
      .limit(1);
    if (!product) return json({ error: "Product not found" }, { status: 404 });

    const orderId = crypto.randomUUID();
    const itemId = crypto.randomUUID();
    const lineTotalCents = product.priceCents * quantity;

    await db.insert(orders).values({
      id: orderId,
      userId: session.user.id,
      status: "pending",
      totalCents: lineTotalCents,
    });

    await db.insert(orderItems).values({
      id: itemId,
      orderId,
      productId: product.id,
      quantity,
      unitPriceCents: product.priceCents,
      lineTotalCents,
    });

    return json({ ok: true, orderId }, { status: 201 });
  }

  return null;
};

export default {
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext) {
    const apiResponse = await handleApi(request, env);
    if (apiResponse) return apiResponse;
    return requestHandler(request, { cloudflare: { env, ctx } });
  },
} satisfies ExportedHandler<Bindings>;
