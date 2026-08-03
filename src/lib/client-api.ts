export async function clientApiRequest<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, init);
  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "mesaj" in data
        ? String(data.mesaj)
        : typeof data === "object" && data !== null && "message" in data
          ? String(data.message)
          : `API isteği başarısız: ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}
