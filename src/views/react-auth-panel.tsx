/** @jsxImportSource react */

type ReactAuthPanelProps = {
  authApiPath: string;
  sessionApiPath: string;
};

export const ReactAuthPanel = ({ authApiPath, sessionApiPath }: ReactAuthPanelProps) => {
  return (
    <main className="mx-auto my-10 max-w-3xl px-4">
      <h1 className="text-3xl font-semibold tracking-tight">React SSR Component</h1>
      <p className="mt-3 text-slate-700">
        This section is rendered using <code>react</code> + <code>react-dom/server</code> in a Hono route.
      </p>
      <p className="mt-2">
        Better Auth sign-in endpoint: <code>{authApiPath}</code>
      </p>
      <p className="mt-2">
        Session path: <code>{sessionApiPath}</code>
      </p>
      <p className="mt-2 text-slate-700">
        This route proves SSR works through Vite + Hono while auth runs on <code>/api/auth/*</code>.
      </p>
      <a className="mt-4 inline-block underline underline-offset-4" href="/">
        Back to home
      </a>
    </main>
  );
};
