export const NEXT_API_ENDPOINTS = {
  dovizler: "/api/dovizler",
  kurlar: "/api/kurlar",
  musteriler: "/api/musteriler",
  dovizCevir: "/api/doviz-cevir",
  dovizIslemleri: "/api/doviz-islemleri",
  subeler: "/api/subeler",
  musteriHesaplari: (musteriId: string | number) =>
    `/api/hesaplar/${musteriId}`,
  hesapHareketleri: (
    musteriId: string | number,
    hesapEkNo: string | number,
  ) => `/api/hesap-hareketleri/${musteriId}/${hesapEkNo}`,
} as const;

export const BACKEND_API_ENDPOINTS = {
  dovizler: "/api/v1/dovizleri-getir",
  kurlar: "/api/v1/kur-oku",
  musteriler: "/api/v1/musteriler",
  dovizCevir: "/api/v1/doviz-cevir",
  dovizIslemleri: "/api/v1/doviz-islemleri-getir",
  subeler: "/api/v1/subeler",
  musteriHesaplari: (musteriId: string | number) =>
    `/api/v1/musteriler/${musteriId}/hesaplar`,
  hesapHareketleri: (
    musteriId: string | number,
    hesapEkNo: string | number,
  ) =>
    `/api/v1/musteriler/${musteriId}/hesaplar/${hesapEkNo}/hareketler`,
} as const;
