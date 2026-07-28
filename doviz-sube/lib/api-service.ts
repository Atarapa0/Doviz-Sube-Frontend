type QueryValue = string | number | boolean;

type ApiRequestOptions = {
  params?: Record<string, QueryValue>;
  body?: unknown;
};

export class ApiServiceError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(`API isteği başarısız: ${status}`);
    this.name = "ApiServiceError";
    this.status = status;
    this.data = data;
  }
}

async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST",
  options: ApiRequestOptions = {},
): Promise<T> {
  const apiUrl = process.env.API_BASE_URL;

  if (!apiUrl) {
    throw new Error("API_BASE_URL tanımlı değil.");
  }

  const url = new URL(endpoint, apiUrl);

  Object.entries(options.params ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const response = await fetch(url, {
    method,
    headers: options.body === undefined
      ? undefined
      : { "Content-Type": "application/json" },
    body: options.body === undefined
      ? undefined
      : JSON.stringify(options.body),
    cache: "no-store",
  });

  const responseText = await response.text();
  let data: unknown = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }
  }

  if (!response.ok) {
    throw new ApiServiceError(
      response.status,
      data ?? { message: `API isteği başarısız: ${response.status}` },
    );
  }

  return data as T;
}

export function apiGet<T>(
  endpoint: string,
  params?: Record<string, QueryValue>,
) {
  return apiRequest<T>(endpoint, "GET", { params });
}

export function apiPost<T>(endpoint: string, body: unknown) {
  return apiRequest<T>(endpoint, "POST", { body });
}
