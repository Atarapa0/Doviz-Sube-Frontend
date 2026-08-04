import { NEXT_API_ENDPOINTS } from "@/constants/api-endpoints";
import { clientApiRequest } from "@/lib/client-api";
import type { Sube, SubeOlusturRequest } from "@/types/api";

export function subeleriGetir() {
  return clientApiRequest<Sube[]>(NEXT_API_ENDPOINTS.subeler);
}

export function subeDetayiGetir(subeKodu: string) {
  return clientApiRequest<Sube>(NEXT_API_ENDPOINTS.subeDetayi(subeKodu));
}

export function subeOlustur(body: SubeOlusturRequest) {
  return clientApiRequest<Sube>(NEXT_API_ENDPOINTS.subeler, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
