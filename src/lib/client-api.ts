import {
  ClientApiError,
  hataSayfasindaGosterilmeli,
  hataSayfasinaGit,
} from "@/lib/api-error";
import type { ApiHataResponse } from "@/types/error";

export async function clientApiRequest<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, init);
  } catch {
    const baglantiHatasi = new ClientApiError({
      status: 502,
      hataKodu: "API_BAGLANTI_HATASI",
      mesaj: "API sunucusuna bağlanılamadı.",
    });
    hataSayfasinaGit(baglantiHatasi);
    throw baglantiHatasi;
  }

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
    const mesaj =
      typeof data === "object" && data !== null && "mesaj" in data
        ? String(data.mesaj)
        : typeof data === "object" && data !== null && "message" in data
          ? String(data.message)
          : validationMessage
            ? validationMessage
          : `API isteği başarısız: ${response.status}`;

    const apiHatasi = new ClientApiError({
      status:
        typeof data === "object" &&
        data !== null &&
        "status" in data &&
        Number.isInteger(Number(data.status))
          ? Number(data.status)
          : response.status,
      hataKodu:
        typeof data === "object" && data !== null && "hataKodu" in data
          ? String(data.hataKodu)
          : response.status === 404
            ? "KAYNAK_BULUNAMADI"
            : response.status >= 500
              ? "API_BAGLANTI_HATASI"
              : "ISTEK_BASARISIZ",
      mesaj,
      hataId:
        typeof data === "object" && data !== null && "hataId" in data
          ? String(data.hataId)
          : undefined,
      correlationId:
        typeof data === "object" && data !== null && "correlationId" in data
          ? String(data.correlationId)
          : response.headers.get("X-Correlation-ID") || undefined,
      timestamp:
        typeof data === "object" && data !== null && "timestamp" in data
          ? String(data.timestamp)
          : undefined,
    } satisfies ApiHataResponse);

    if (hataSayfasindaGosterilmeli(apiHatasi.status)) {
      hataSayfasinaGit(apiHatasi);
    }

    throw apiHatasi;
  }

  return data as T;
}
