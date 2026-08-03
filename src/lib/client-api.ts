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
    const validationMessage =
      typeof data === "object" &&
      data !== null &&
      "errors" in data &&
      typeof data.errors === "object" &&
      data.errors !== null
        ? Object.values(data.errors)
            .flatMap((messages) => (Array.isArray(messages) ? messages : []))
            .map(String)
            .join(" ")
        : "";
    const message =
      typeof data === "object" && data !== null && "mesaj" in data
        ? String(data.mesaj)
        : typeof data === "object" && data !== null && "message" in data
          ? String(data.message)
          : validationMessage
            ? validationMessage
          : `API isteği başarısız: ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}
