import { NEXT_API_ENDPOINTS } from "@/constants/api-endpoints";
import { clientApiRequest } from "@/lib/client-api";
import type {
  ArbitrajHesaplaRequest,
  ArbitrajHesaplaResponse,
} from "@/types/api";

export function arbitrajHesapla(body: ArbitrajHesaplaRequest) {
  return clientApiRequest<ArbitrajHesaplaResponse>(
    NEXT_API_ENDPOINTS.arbitrajHesapla,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}
