import { up } from "up-fetch";

export const createApi = (request: Request) => {
  const baseUrl = new URL(request.url).origin;

  return up(fetch, () => ({
    baseUrl,
    headers: {
      cookie: request.headers.get("cookie") ?? "",
      "content-type": "application/json",
    },
  }));
};
