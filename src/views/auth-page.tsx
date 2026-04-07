/** @jsxImportSource react */
import { FormEvent, useMemo, useState } from "react";

import { Button } from "../components/ui/button";
import { upFetch } from "../lib/up-fetch";

type AuthPageProps = {
  signUpApiPath: string;
  signInApiPath: string;
  signOutApiPath: string;
  sessionApiPath: string;
  initialSession?: SessionShape;
};

type AuthMode = "sign-in" | "sign-up";

export type SessionShape = {
  user?: {
    email?: string;
    name?: string;
  };
} | null;

export const AuthPage = ({
  signUpApiPath,
  signInApiPath,
  signOutApiPath,
  sessionApiPath,
  initialSession = null,
}: AuthPageProps) => {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Ready");
  const [session, setSession] = useState<SessionShape>(initialSession);

  const submitPath = useMemo(
    () => (mode === "sign-up" ? signUpApiPath : signInApiPath),
    [mode, signInApiPath, signUpApiPath],
  );

  const loadSession = async () => {
    setLoading(true);
    setMessage("Loading session...");
    try {
      const { response, json } = await upFetch<SessionShape>(sessionApiPath);
      setSession((json as SessionShape) ?? null);
      setMessage(response.ok ? "Session loaded" : "Session request failed");
    } catch {
      setMessage("Session request failed");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(mode === "sign-up" ? "Creating account..." : "Signing in...");
    try {
      const payload: Record<string, string> = { email, password };
      if (mode === "sign-up") {
        payload.name = name || email.split("@")[0] || "user";
      }

      const { response, text } = await upFetch(submitPath, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        setMessage(`Auth failed: ${text || response.statusText}`);
        return;
      }

      setMessage(mode === "sign-up" ? "Account created" : "Signed in");
      await loadSession();
    } catch {
      setMessage("Network request failed");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setMessage("Signing out...");
    try {
      const { response } = await upFetch(signOutApiPath, {
        method: "POST",
      });
      setMessage(response.ok ? "Signed out" : "Sign out failed");
      setSession(null);
    } catch {
      setMessage("Sign out failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto my-10 max-w-lg px-4 font-sans">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Auth</h1>
        <p className="mt-2 text-sm text-slate-600">
          SSR + hydrated React auth flow using Better Auth endpoints.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button disabled={loading} onClick={() => setMode("sign-in")} type="button" variant="outline">
          Sign in
          </Button>
          <Button disabled={loading} onClick={() => setMode("sign-up")} type="button" variant="outline">
          Sign up
          </Button>
          <Button disabled={loading} onClick={loadSession} type="button" variant="ghost">
          Refresh session
          </Button>
        </div>

        <form className="mt-5 grid gap-3" onSubmit={submit}>
          {mode === "sign-up" ? (
            <label className="grid gap-1 text-sm">
            Name
            <input
              autoComplete="name"
              className="h-10 rounded-md border border-slate-200 px-3"
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
              required
              value={name}
            />
            </label>
          ) : null}
          <label className="grid gap-1 text-sm">
            Email
            <input
              autoComplete="email"
              className="h-10 rounded-md border border-slate-200 px-3"
              onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Password
            <input
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              className="h-10 rounded-md border border-slate-200 px-3"
              minLength={8}
              onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
              required
              type="password"
              value={password}
            />
          </label>
          <Button disabled={loading} type="submit">
            {loading ? "Working..." : mode === "sign-up" ? "Create account" : "Sign in"}
          </Button>
        </form>

        <div className="mt-4">
          <Button disabled={loading} onClick={signOut} type="button" variant="outline">
            Sign out
          </Button>
        </div>

        <p className="mt-4 text-sm">
          <span className="font-semibold">Status:</span> {message}
        </p>

        <pre className="mt-3 overflow-x-auto rounded-md bg-slate-100 p-3 text-xs">
          {JSON.stringify(session, null, 2)}
        </pre>

        <a className="mt-4 inline-block text-sm text-slate-700 underline" href="/">
          Back to home
        </a>
      </section>
    </main>
  );
};
