import { NEXT_API_ENDPOINTS } from "@/constants/api-endpoints";
import { clientApiRequest } from "@/lib/client-api";
import type {
  Musteri,
  MusteriAramaSonucu,
  MusteriHesapResponse,
  MusteriListeParams,
  MusteriOlusturRequest,
  SayfaliResponse,
} from "@/types/api";

function queryOlustur(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export function musterileriGetir(params: MusteriListeParams = {}) {
  const query = queryOlustur(params);
  return clientApiRequest<SayfaliResponse<Musteri>>(
    `${NEXT_API_ENDPOINTS.musteriler}${query}`,
  );
}

export function musteriAra(q: string, limit = 10) {
  const query = queryOlustur({ q, limit });
  return clientApiRequest<MusteriAramaSonucu[]>(
    `${NEXT_API_ENDPOINTS.musteriAra}${query}`,
  );
}

export function musteriHesaplariniGetir(musteriId: string | number) {
  return clientApiRequest<MusteriHesapResponse>(
    NEXT_API_ENDPOINTS.musteriHesaplari(musteriId),
  );
}

export function musteriOlustur(body: MusteriOlusturRequest) {
  return clientApiRequest<unknown>(NEXT_API_ENDPOINTS.musteriler, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
