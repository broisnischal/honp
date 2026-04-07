/** @jsxImportSource react */

type ReactAuthPanelProps = {
  authApiPath: string;
  sessionApiPath: string;
};

export const ReactAuthPanel = ({ authApiPath, sessionApiPath }: ReactAuthPanelProps) => {
  return (
    <main style={{ fontFamily: "ui-sans-serif, system-ui", margin: "40px auto", maxWidth: 860, padding: "0 16px" }}>
      <h1>React SSR Component</h1>
      <p>
        This section is rendered using <code>react</code> + <code>react-dom/server</code> in a Hono route.
      </p>
      <p>
        Better Auth sign-in endpoint: <code>{authApiPath}</code>
      </p>
      <p>
        Session path: <code>{sessionApiPath}</code>
      </p>
      <p>
        This route proves SSR works through Vite + Hono while auth runs on <code>/api/auth/*</code>.
      </p>
      <a href="/">Back to home</a>
    </main>
  );
};
