import { Form, Link, data, redirect, useActionData, useLoaderData } from "react-router";
import type { Route } from "./+types/orders";

import { createApi } from "../lib/upfetch.server";

type SessionResponse = {
  user?: { id: string; email: string };
};

type Product = {
  id: string;
  name: string;
  priceCents: number;
};

type OrderRow = {
  orderId: string;
  status: string;
  totalCents: number;
  productName: string | null;
  quantity: number | null;
};

export async function loader({ request }: Route.LoaderArgs) {
  const api = createApi(request);
  const session = (await api("/api/session")) as SessionResponse | null;
  if (!session?.user) {
    throw redirect("/auth");
  }

  const [products, rows] = await Promise.all([
    api("/api/products") as Promise<Product[]>,
    api("/api/orders") as Promise<OrderRow[]>,
  ]);

  return { session, products, rows };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const api = createApi(request);

  await api("/api/orders", {
    method: "POST",
    body: {
      productId: String(form.get("productId") ?? ""),
      quantity: Number(form.get("quantity") ?? 1),
    },
  });

  return data({ ok: true, message: "Order created" });
}

export default function OrdersPage() {
  const { session, products, rows } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();

  return (
    <main style={{ maxWidth: 860, margin: "40px auto", padding: "0 16px" }}>
      <h1>Orders</h1>
      <p>
        Signed in as <strong>{session.user?.email}</strong>
      </p>
      {result?.message ? <p>{result.message}</p> : null}

      <Form method="post" style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
        <h3>Create Order</h3>
        <select name="productId" required>
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (${(p.priceCents / 100).toFixed(2)})
            </option>
          ))}
        </select>
        <input name="quantity" type="number" min={1} defaultValue={1} />
        <button type="submit">Create</button>
      </Form>

      <h3 style={{ marginTop: 24 }}>Your Orders</h3>
      <ul>
        {rows.map((row) => (
          <li key={`${row.orderId}-${row.productName ?? "item"}`}>
            #{row.orderId.slice(0, 8)} - {row.status} - {row.productName ?? "item"} x
            {row.quantity ?? 0} (${(row.totalCents / 100).toFixed(2)})
          </li>
        ))}
      </ul>

      <p>
        <Link to="/auth">Back to auth</Link>
      </p>
    </main>
  );
}
