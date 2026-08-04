import { NEXT_API_ENDPOINTS } from "@/constants/api-endpoints";
import { clientApiRequest } from "@/lib/client-api";
import type {
  Doviz,
  DovizCevirRequest,
  DovizIslemi,
  DovizIslemiDetayResponse,
  DovizIslemiIptalResponse,
  DovizIslemiListeParams,
  KurResponse,
  SayfaliResponse,
} from "@/types/api";

export function dovizleriGetir() {
  return clientApiRequest<Doviz[]>(NEXT_API_ENDPOINTS.dovizler);
}

export function kurlariGetir() {
  return clientApiRequest<KurResponse>(NEXT_API_ENDPOINTS.kurlar);
}

export function dovizIslemleriniGetir(params: DovizIslemiListeParams = {}) {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      queryParams.set(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  const query = queryString ? `?${queryString}` : "";

  return clientApiRequest<SayfaliResponse<DovizIslemi>>(
    `${NEXT_API_ENDPOINTS.dovizIslemleri}${query}`,
  );
}

export function dovizIslemDetayiGetir(referansNo: string) {
  return clientApiRequest<DovizIslemiDetayResponse>(
    NEXT_API_ENDPOINTS.dovizIslemDetayi(referansNo),
  );
}

export function dovizIsleminiIptal(referansNo: string, iptalNedeni: string) {
  return clientApiRequest<DovizIslemiIptalResponse>(
    NEXT_API_ENDPOINTS.dovizIslemIptal(referansNo),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ iptalNedeni }),
    },
  );
}

export function dovizCevir(body: DovizCevirRequest) {
  return clientApiRequest<Record<string, unknown>>(NEXT_API_ENDPOINTS.dovizCevir, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
