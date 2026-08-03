import { NEXT_API_ENDPOINTS } from "@/constants/api-endpoints";
import { clientApiRequest } from "@/lib/client-api";
import type {
  Doviz,
  DovizCevirRequest,
  DovizIslemi,
  KurResponse,
} from "@/types/api";

export function dovizleriGetir() {
  return clientApiRequest<Doviz[]>(NEXT_API_ENDPOINTS.dovizler);
}

export function kurlariGetir() {
  return clientApiRequest<KurResponse>(NEXT_API_ENDPOINTS.kurlar);
}

export function dovizIslemleriniGetir(subeKodu?: string) {
  const query = subeKodu ? `?subeKodu=${encodeURIComponent(subeKodu)}` : "";
  return clientApiRequest<DovizIslemi[]>(
    `${NEXT_API_ENDPOINTS.dovizIslemleri}${query}`,
  );
}

export function dovizCevir(body: DovizCevirRequest) {
  return clientApiRequest<Record<string, unknown>>(NEXT_API_ENDPOINTS.dovizCevir, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
