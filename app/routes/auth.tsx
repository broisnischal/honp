import { Form, Link, data, useActionData, useLoaderData } from "react-router";
import type { Route } from "./+types/auth";

import { createApi } from "../lib/upfetch.server";

type SessionResponse = {
  user?: { id: string; email: string; name?: string | null };
};

export async function loader({ request }: Route.LoaderArgs) {
  const api = createApi(request);
  const session = (await api("/api/session")) as SessionResponse | null;
  return { session };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const origin = new URL(request.url).origin;

  if (intent === "sign-up") {
    const response = await fetch(`${origin}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: request.headers.get("cookie") ?? "" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      }),
    });

    return data(
      { ok: response.ok, message: response.ok ? "Account created" : "Sign up failed" },
      { status: response.ok ? 200 : 400, headers: { "set-cookie": response.headers.get("set-cookie") ?? "" } },
    );
  }

  if (intent === "sign-in") {
    const response = await fetch(`${origin}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: request.headers.get("cookie") ?? "" },
      body: JSON.stringify({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      }),
    });

    return data(
      { ok: response.ok, message: response.ok ? "Signed in" : "Sign in failed" },
      { status: response.ok ? 200 : 400, headers: { "set-cookie": response.headers.get("set-cookie") ?? "" } },
    );
  }

  if (intent === "sign-out") {
    const response = await fetch(`${origin}/api/auth/sign-out`, {
      method: "POST",
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });

    return data(
      { ok: response.ok, message: response.ok ? "Signed out" : "Sign out failed" },
      { status: response.ok ? 200 : 400, headers: { "set-cookie": response.headers.get("set-cookie") ?? "" } },
    );
  }

  return data({ ok: false, message: "Unknown action" }, { status: 400 });
}

export default function AuthPage() {
  const { session } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();

  return (
    <main style={{ maxWidth: 860, margin: "40px auto", padding: "0 16px" }}>
      <h1>Auth</h1>
      <p>Simple email/password auth flow pattern.</p>
      <p>
        Session user: <strong>{session?.user?.email ?? "Not signed in"}</strong>
      </p>
      {result?.message ? <p>{result.message}</p> : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Form method="post" style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h3>Sign Up</h3>
          <input type="hidden" name="intent" value="sign-up" />
          <input name="name" placeholder="Name" required />
          <br />
          <input name="email" type="email" placeholder="Email" required />
          <br />
          <input name="password" type="password" placeholder="Password" required />
          <br />
          <button type="submit">Create account</button>
        </Form>

        <Form method="post" style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h3>Sign In</h3>
          <input type="hidden" name="intent" value="sign-in" />
          <input name="email" type="email" placeholder="Email" required />
          <br />
          <input name="password" type="password" placeholder="Password" required />
          <br />
          <button type="submit">Sign in</button>
        </Form>
      </div>

      <Form method="post" style={{ marginTop: 12 }}>
        <input type="hidden" name="intent" value="sign-out" />
        <button type="submit">Sign out</button>
      </Form>

      <p>
        <Link to="/orders">Go to orders</Link>
      </p>
    </main>
  );
}
