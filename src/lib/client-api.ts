import {
  ClientApiError,
  hataSayfasindaGosterilmeli,
  hataSayfasinaGit,
} from "@/lib/api-error";
import { apiHatasiniNormalizeEt } from "@/lib/http-error";

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
  let jsonCozumlendi = false;

  if (text) {
    try {
      data = JSON.parse(text);
      jsonCozumlendi = true;
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const apiHatasi = new ClientApiError(
      apiHatasiniNormalizeEt(data, response.status, response.headers),
    );

    if (hataSayfasindaGosterilmeli(apiHatasi.status)) {
      hataSayfasinaGit(apiHatasi);
    }

    throw apiHatasi;
  }

  if (text && !jsonCozumlendi) {
    const apiHatasi = new ClientApiError(
      apiHatasiniNormalizeEt(null, 502, response.headers),
    );
    hataSayfasinaGit(apiHatasi);
    throw apiHatasi;
  }

  return data as T;
}
