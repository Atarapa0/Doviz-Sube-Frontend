import { NEXT_API_ENDPOINTS } from "@/constants/api-endpoints";
import { clientApiRequest } from "@/lib/client-api";
import type { HesapHareketleriResponse } from "@/types/api";

export function hesapAc(musteriId: string | number, dovizKodu: string) {
  return clientApiRequest<unknown>(NEXT_API_ENDPOINTS.musteriHesaplari(musteriId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dovizKodu }),
  });
}

export function hesapHareketleriniGetir(
  musteriId: string | number,
  hesapEkNo: string | number,
) {
  return clientApiRequest<HesapHareketleriResponse>(
    NEXT_API_ENDPOINTS.hesapHareketleri(musteriId, hesapEkNo),
  );
}
