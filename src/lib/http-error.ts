import type { ApiHataResponse } from "@/types/error";

function nesneMi(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function htmlIcerigiMi(value: string) {
  return /<(?:!doctype\s+html|html|head|body)(?:\s|>)/i.test(value);
}

function guvenliMetin(value: unknown, maksimumUzunluk = 500) {
  if (typeof value !== "string") return undefined;

  const temizMetin = value.trim();
  if (
    !temizMetin ||
    temizMetin.length > maksimumUzunluk ||
    htmlIcerigiMi(temizMetin)
  ) {
    return undefined;
  }

  return temizMetin;
}

function varsayilanHataKodu(status: number) {
  switch (status) {
    case 400:
      return "ISTEK_GECERSIZ";
    case 404:
      return "KAYNAK_BULUNAMADI";
    case 409:
      return "ISLEM_CAKISMASI";
    case 500:
      return "SUNUCU_HATASI";
    case 502:
      return "API_BAGLANTI_HATASI";
    case 503:
      return "SERVIS_KULLANILAMIYOR";
    case 504:
      return "API_ZAMAN_ASIMI";
    default:
      return status >= 500 ? "SUNUCU_HATASI" : "ISTEK_BASARISIZ";
  }
}

export function varsayilanHataMesaji(status: number) {
  switch (status) {
    case 400:
      return "Gönderilen bilgiler geçersiz. Lütfen alanları kontrol edin.";
    case 404:
      return "İstenen kayıt bulunamadı.";
    case 409:
      return "İşlem mevcut bilgilerle gerçekleştirilemiyor.";
    case 500:
      return "Sunucuda beklenmeyen bir hata oluştu.";
    case 502:
      return "API sunucusuna ulaşılamıyor. Lütfen kısa süre sonra tekrar deneyin.";
    case 503:
      return "Servis geçici olarak kullanılamıyor. Lütfen kısa süre sonra tekrar deneyin.";
    case 504:
      return "API sunucusu zamanında yanıt vermedi. Lütfen tekrar deneyin.";
    default:
      return status >= 500
        ? "Sunucu isteği tamamlayamadı. Lütfen tekrar deneyin."
        : `API isteği başarısız oldu (${status}).`;
  }
}

function validationMesajiniAl(data: Record<string, unknown>) {
  if (!nesneMi(data.errors)) return undefined;

  const mesaj = Object.values(data.errors)
    .flatMap((deger) => (Array.isArray(deger) ? deger : []))
    .map(String)
    .join(" ");

  return guvenliMetin(mesaj);
}

export function apiHatasiniNormalizeEt(
  data: unknown,
  httpStatus: number,
  headers?: Headers,
): ApiHataResponse {
  const veri = nesneMi(data) ? data : {};
  const gelenStatus = Number(veri.status);
  const status =
    Number.isInteger(gelenStatus) && gelenStatus >= 400 && gelenStatus <= 599
      ? gelenStatus
      : httpStatus;

  const mesaj =
    guvenliMetin(veri.mesaj) ??
    guvenliMetin(veri.message) ??
    validationMesajiniAl(veri) ??
    varsayilanHataMesaji(status);

  return {
    status,
    hataKodu:
      guvenliMetin(veri.hataKodu, 100) ?? varsayilanHataKodu(status),
    mesaj,
    hataId: guvenliMetin(veri.hataId, 150),
    correlationId:
      guvenliMetin(veri.correlationId, 200) ??
      headers?.get("X-Correlation-ID") ??
      headers?.get("CF-Ray") ??
      undefined,
    timestamp: guvenliMetin(veri.timestamp, 100),
  };
}
