import type { ApiHataResponse } from "@/types/error";

export class ClientApiError extends Error {
  status: number;
  hataKodu: string;
  hataId?: string;
  correlationId?: string;
  timestamp?: string;

  constructor(response: ApiHataResponse) {
    super(response.mesaj);
    this.name = "ClientApiError";
    this.status = response.status;
    this.hataKodu = response.hataKodu;
    this.hataId = response.hataId || undefined;
    this.correlationId = response.correlationId || undefined;
    this.timestamp = response.timestamp;
  }
}

export function hataSayfasindaGosterilmeli(status: number) {
  return status === 404 || status >= 500;
}

export function hataSayfasinaGit(error: ClientApiError) {
  if (typeof window === "undefined" || window.location.pathname === "/hata") {
    return;
  }

  const query = new URLSearchParams({
    status: String(error.status),
    hataKodu: error.hataKodu,
    mesaj: error.message,
    donusAdresi: `${window.location.pathname}${window.location.search}${window.location.hash}`,
  });

  if (error.hataId) query.set("hataId", error.hataId);
  if (error.correlationId) query.set("correlationId", error.correlationId);

  window.location.assign(`/hata?${query.toString()}`);
}
