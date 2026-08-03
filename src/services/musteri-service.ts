import { NEXT_API_ENDPOINTS } from "@/constants/api-endpoints";
import { clientApiRequest } from "@/lib/client-api";
import type {
  Musteri,
  MusteriHesapResponse,
  MusteriOlusturRequest,
} from "@/types/api";

export function musterileriGetir() {
  return clientApiRequest<Musteri[]>(NEXT_API_ENDPOINTS.musteriler);
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
