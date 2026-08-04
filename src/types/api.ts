export type Sube = {
  id: number;
  kod: string;
  ad: string;
  aktifMi?: boolean;
  musteriSayisi?: number;
  olusturmaTarihi?: string;
};

export type SubeOlusturRequest = {
  kod: string;
  ad: string;
};

export type SayfaliResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type MusteriListeParams = {
  page?: number;
  pageSize?: number;
  arama?: string;
  subeKodu?: string;
};

export type MusteriAramaParams = {
  q: string;
  limit?: number;
};

export type Musteri = {
  id: number;
  ad: string;
  soyad: string;
  aktifMi: boolean;
  sube: Sube;
  hesapSayisi: number;
  olusturmaTarihi: string;
  guncellemeTarihi: string;
};

export type MusteriAramaSonucu = {
  id: number;
  ad: string;
  soyad: string;
  aktifMi: boolean;
  sube: Pick<Sube, "id" | "kod" | "ad">;
  hesapSayisi: number;
};

export type Hesap = {
  hesapEkNo: number;
  dovizId: number;
  dovizKodu: string;
  dovizAdi: string;
  bakiye: number;
  aktifMi: boolean;
  olusturmaTarihi: string;
  guncellemeTarihi: string;
};

export type MusteriHesapResponse = {
  id: number;
  ad: string;
  soyad: string;
  aktifMi: boolean;
  sube: Sube;
  hesaplar: Hesap[];
};

export type Doviz = {
  id: number;
  kod: string;
  name: string;
  birim: number;
};

export type Kur = {
  kod: string;
  isim: string;
  birim: number;
  dovizAlis: number | null;
  dovizSatis: number | null;
};

export type KurResponse = {
  tarih: string;
  kurlar: Kur[];
};

export type DovizIslemiListeParams = {
  page?: number;
  pageSize?: number;
  subeKodu?: string;
};

type DovizBilgisi = {
  id: number;
  kod: string;
  ad: string;
};

type IslemHesabi = {
  hesapEkNo: number;
  dovizKodu: string;
  miktar: number;
  kur: number;
};

export type DovizIslemi = {
  id: number;
  referansNo: string;
  musteriId: number;
  musteri: {
    id: number;
    ad: string;
    soyad: string;
    sube: Pick<Sube, "id" | "kod" | "ad">;
  };
  odenenDoviz: DovizBilgisi;
  alinanDoviz: DovizBilgisi;
  borcluHesap: IslemHesabi;
  alacakliHesap: IslemHesabi;
  tlKarsiligi: number;
  islemTarihi: string;
  tersKayitMi: boolean;
  tersKayitOlusturulduMu: boolean;
  orijinalReferansNo: string | null;
  tersKayitReferansNo: string | null;
  iptalNedeni: string | null;
};

export type DovizIslemiIptalRequest = {
  iptalNedeni: string;
};

export type DovizIslemiIptalResponse = {
  islemId: number;
  orijinalReferansNo: string;
  tersKayitReferansNo: string;
  iptalNedeni: string;
  islemTarihi: string;
};

export type HesapHareketi = {
  id: number;
  dovizIslemId: number;
  referansNo: string;
  hareketTuru: "BORC" | "ALACAK" | string;
  dovizMiktari: number;
  tlKarsiligi: number;
  islemTarihi: string;
};

export type DovizIslemiDetayResponse = {
  islem: DovizIslemi;
  hesapHareketleri: HesapHareketi[];
};

export type HesapHareketleriResponse = {
  hesap: {
    musteriId: number;
    hesapEkNo: number;
    dovizKodu: string;
    dovizAdi: string;
    bakiye: number;
    aktifMi: boolean;
  };
  hareketler: HesapHareketi[];
};

export type MusteriHesapHareketiHesabi = {
  hesapEkNo: number;
  dovizId: number;
  dovizKodu: string;
  dovizAdi: string;
  bakiye: number;
  aktifMi: boolean;
  hareketler: HesapHareketi[];
};

export type MusteriTumHesapHareketleriResponse = {
  musteriId: number;
  ad: string;
  soyad: string;
  hesaplar: MusteriHesapHareketiHesabi[];
};

export type MusteriOlusturRequest = {
  ad: string;
  soyad: string;
  subeKodu: string;
  baslangicTryBakiyesi: number;
};

export type DovizCevirRequest = {
  musteriId: number;
  borcluHesapEkNo: number;
  alacakliHesapEkNo: number;
  odenecekDovizMiktari: number;
};
