export type Sube = {
  id: number;
  kod: string;
  ad: string;
  aktifMi?: boolean;
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

type DovizBilgisi = {
  kod: string;
  ad: string;
};

type IslemHesabi = {
  dovizKodu: string;
  miktar: number;
  kur: number;
};

export type DovizIslemi = {
  id: number;
  referansNo: string;
  musteriId: number;
  musteri: { id: number; ad: string; soyad: string };
  odenenDoviz: DovizBilgisi & { odenenDovizId: number };
  alinanDoviz: DovizBilgisi & { alinanDovizId: number };
  borcluHesap: IslemHesabi & { borcluHesapEkNo: number };
  alacakliHesap: IslemHesabi & { alacakliHesapEkNo: number };
  tlKarsiligi: number;
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
