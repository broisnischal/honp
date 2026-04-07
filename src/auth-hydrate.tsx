/** @jsxImportSource react */
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";

import { AuthPage, type SessionShape } from "./views/auth-page";

type AuthHydrateConfig = {
  initialSession: SessionShape;
};

declare global {
  interface Window {
    __AUTH_PAGE_CONFIG__?: AuthHydrateConfig;
  }
}

const rootNode = document.getElementById("root");
const config = window.__AUTH_PAGE_CONFIG__;

if (rootNode) {
  hydrateRoot(
    rootNode,
    createElement(AuthPage, {
      signUpApiPath: "/api/auth/sign-up/email",
      signInApiPath: "/api/auth/sign-in/email",
      signOutApiPath: "/api/auth/sign-out",
      sessionApiPath: "/api/session",
      initialSession: config?.initialSession ?? null,
    }),
  );
}
