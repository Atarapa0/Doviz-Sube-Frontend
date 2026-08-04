export const NEXT_API_ENDPOINTS = {
  dovizler: "/api/dovizler",
  kurlar: "/api/kurlar",
  musteriler: "/api/musteriler",
  musteriAra: "/api/musteriler/ara",
  dovizCevir: "/api/doviz-cevir",
  dovizIslemleri: "/api/doviz-islemleri",
  dovizIslemDetayi: (referansNo: string) =>
    `/api/doviz-islemleri/${encodeURIComponent(referansNo)}`,
  dovizIslemIptal: (referansNo: string) =>
    `/api/doviz-islemleri/${encodeURIComponent(referansNo)}/iptal`,
  subeler: "/api/subeler",
  subeDetayi: (subeKodu: string) =>
    `/api/subeler/${encodeURIComponent(subeKodu)}`,
  musteriHesaplari: (musteriId: string | number) =>
    `/api/hesaplar/${musteriId}`,
  musteriTumHesapHareketleri: (musteriId: string | number) =>
    `/api/hesap-hareketleri/${musteriId}`,
  hesapHareketleri: (
    musteriId: string | number,
    hesapEkNo: string | number,
  ) => `/api/hesap-hareketleri/${musteriId}/${hesapEkNo}`,
} as const;

export const BACKEND_API_ENDPOINTS = {
  dovizler: "/api/v1/dovizleri-getir",
  kurlar: "/api/v1/kur-oku",
  musteriler: "/api/v1/musteriler",
  musteriAra: "/api/v1/musteriler/ara",
  dovizCevir: "/api/v1/doviz-cevir",
  dovizIslemleri: "/api/v1/doviz-islemleri-getir",
  dovizIslemDetayi: (referansNo: string) =>
    `/api/v1/doviz-islemleri/${encodeURIComponent(referansNo)}`,
  dovizIslemIptal: (referansNo: string) =>
    `/api/v1/doviz-islemleri/${encodeURIComponent(referansNo)}/iptal`,
  subeler: "/api/v1/subeler",
  subeDetayi: (subeKodu: string) =>
    `/api/v1/subeler/${encodeURIComponent(subeKodu)}`,
  musteriHesaplari: (musteriId: string | number) =>
    `/api/v1/musteriler/${musteriId}/hesaplar`,
  musteriTumHesapHareketleri: (musteriId: string | number) =>
    `/api/v1/musteriler/${musteriId}/hesap-hareketleri`,
  hesapHareketleri: (
    musteriId: string | number,
    hesapEkNo: string | number,
  ) =>
    `/api/v1/musteriler/${musteriId}/hesaplar/${hesapEkNo}/hareketler`,
} as const;
