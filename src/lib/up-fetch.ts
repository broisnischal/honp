import { up } from "up-fetch";

/**
 * Better Auth parses the request body as JSON when `Content-Type: application/json`
 * is present. POST + that header + empty body → "Unexpected end of JSON input".
 *
 * Defaults: `Accept: application/json` only. JSON `Content-Type` and body are set by
 * up-fetch when you pass a serializable `body` (e.g. `{}` for sign-out).
 */
export type UpFetchResult<T = unknown> = {
  response: Response;
  data: T | null;
  text: string;
};

const rawUpfetch = up(fetch, () => ({
  headers: {
    accept: "application/json",
  },
  reject: () => false,
  parseResponse: async (response: Response): Promise<UpFetchResult<unknown>> => {
    const text = await response.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        data = null;
      }
    }
    return { response, data, text };
  },
}));

export async function upfetch<T = unknown>(
  input: string | URL,
  init?: Parameters<typeof rawUpfetch>[1],
): Promise<UpFetchResult<T>> {
  const result = (await rawUpfetch(input, init)) as UpFetchResult<T>;
  return result;
}
