import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

export default function AppRoot() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body style={{ fontFamily: "ui-sans-serif,system-ui", margin: 0 }}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
