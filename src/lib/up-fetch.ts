type UpFetchOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: Record<string, string>;
};

type UpFetchResult<T> = {
  response: Response;
  text: string;
  json: T | null;
};

const hasBodyMethod = (method?: string) => {
  if (!method) {
    return false;
  }

  return method !== "GET" && method !== "HEAD";
};

export const upFetch = async <T = unknown>(
  path: string,
  options: UpFetchOptions = {},
): Promise<UpFetchResult<T>> => {
  const method = options.method?.toUpperCase();
  const headers = new Headers(options.headers);

  if (!headers.has("accept")) {
    headers.set("accept", "application/json");
  }

  const shouldSendJson = options.body !== undefined || hasBodyMethod(method);

  if (shouldSendJson && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const body =
    options.body === undefined
      ? shouldSendJson
        ? "{}"
        : undefined
      : typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);

  const response = await fetch(path, {
    ...options,
    headers,
    body,
  });
  const text = await response.text();

  let json: T | null = null;
  if (text) {
    try {
      json = JSON.parse(text) as T;
    } catch {
      json = null;
    }
  }

  return { response, text, json };
};
