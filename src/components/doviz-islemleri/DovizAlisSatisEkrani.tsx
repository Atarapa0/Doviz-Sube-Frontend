"use client";

import AppShell from "@/components/layout/AppShell";
import { publicDegiskenler } from "@/lib/public-degiskenler";
import { useMusteri } from "@/components/providers/MusteriProvider";
import {
  dovizCevir,
  dovizleriGetir,
  kurlariGetir,
} from "@/services/doviz-service";
import { musteriHesaplariniGetir } from "@/services/musteri-service";
import {
  dovizFormReducer,
  initialDovizFormState,
} from "@/reducers/doviz-form-reducer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MusteriCombobox from "@/components/ui/musteri-bilgileri";
import { ArrowRightLeft, Banknote, WalletCards } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FormEvent,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

type Doviz = {
  id: number;
  kod: string;
  name: string;
  birim: number;
};

type Kur = {
  kod: string;
  isim: string;
  birim: number;
  dovizAlis: number | null;
  dovizSatis: number | null;
};
type Musteri = {
  id: number;
  ad: string;
  soyad: string;
  aktifMi: boolean;
  sube: {
    id: number;
    kod: string;
    ad: string;
    aktifMi?: boolean;
  };
  hesapSayisi: number;
  olusturmaTarihi: string;
  guncellemeTarihi: string;
};

type ApiHesap = {
  hesapEkNo: number;
  dovizId: number;
  dovizKodu: string;
  dovizAdi: string;
  bakiye: number;
  aktifMi: boolean;
  olusturmaTarihi: string;
  guncellemeTarihi: string;
};

type Hesap = ApiHesap & {
  hesapAnahtari: string;
  musteriId: number;
  musteriAdi: string;
  musteriSoyadi: string;
  subeKodu: string;
  subeAdi: string;
};

type HesapResponse = {
  id: number;
  ad: string;
  soyad: string;
  aktifMi: boolean;
  sube: Musteri["sube"];
  hesaplar: ApiHesap[];
};
type DovizCevirRequest = {
  musteriId: number;
  borcluHesapEkNo: number;
  alacakliHesapEkNo: number;
  odenecekDovizMiktari: number;
};

function hesapCevabiniDonustur(hesapCevabi: HesapResponse): Hesap[] {
  return hesapCevabi.hesaplar.map((hesap) => ({
    ...hesap,
    hesapAnahtari: `${hesapCevabi.id}-${hesap.hesapEkNo}`,
    musteriId: hesapCevabi.id,
    musteriAdi: hesapCevabi.ad,
    musteriSoyadi: hesapCevabi.soyad,
    subeKodu: hesapCevabi.sube.kod,
    subeAdi: hesapCevabi.sube.ad,
  }));
}

function dovizeUygunHesapAnahtari(
  dovizKodu: string,
  hesaplar: Hesap[],
  mevcutHesapAnahtari: string,
) {
  if (!dovizKodu) return "";

  const mevcutHesap = hesaplar.find(
    (hesap) => hesap.hesapAnahtari === mevcutHesapAnahtari,
  );

  if (mevcutHesap?.dovizKodu === dovizKodu) {
    return mevcutHesapAnahtari;
  }

  const uygunHesaplar = hesaplar.filter(
    (hesap) => hesap.aktifMi && hesap.dovizKodu === dovizKodu,
  );

  return uygunHesaplar.length === 1
    ? uygunHesaplar[0].hesapAnahtari
    : "";
}

function dovizHesapEslesmeUyarisi(
  taraf: "borclu" | "alacakli",
  dovizKodu: string,
  hesaplar: Hesap[],
  secilenHesapAnahtari: string,
) {
  if (!dovizKodu || hesaplar.length === 0) return "";

  const secilenHesap = hesaplar.find(
    (hesap) => hesap.hesapAnahtari === secilenHesapAnahtari,
  );
  const tarafAdi = taraf === "borclu" ? "borçlu" : "alacaklı";
  const alanAdi = taraf === "borclu" ? "Ödenecek" : "Alınacak";

  if (secilenHesap && secilenHesap.dovizKodu !== dovizKodu) {
    return `${alanAdi} döviz ${dovizKodu}, fakat seçilen ${tarafAdi} hesap ${secilenHesap.dovizKodu}.`;
  }

  if (secilenHesap) return "";

  const uygunHesapSayisi = hesaplar.filter(
    (hesap) => hesap.aktifMi && hesap.dovizKodu === dovizKodu,
  ).length;

  if (uygunHesapSayisi === 0) {
    return `Müşterinin aktif ${dovizKodu} ${tarafAdi} hesabı bulunmuyor.`;
  }

  if (uygunHesapSayisi > 1) {
    return `${dovizKodu} için ${uygunHesapSayisi} hesap bulundu. Lütfen kullanılacak ek noyu seçin.`;
  }

  return "";
}

function birimKurunuBul(
  dovizKodu: string,
  kurTuru: "alis" | "satis",
  kurlar: Kur[],
) {
  if (dovizKodu === "TRY") return 1;

  const kur = kurlar.find((item) => item.kod === dovizKodu);
  const deger = kurTuru === "alis" ? kur?.dovizAlis : kur?.dovizSatis;

  if (!kur || deger == null) return null;
  return deger / kur.birim;
}

function miktariHesapla(
  kaynak: "alinacak" | "odenecek",
  miktar: number,
  alinacakDoviz: string,
  odenecekDoviz: string,
  kurlar: Kur[],
) {
  const alisKuru = birimKurunuBul(alinacakDoviz, "alis", kurlar);
  const satisKuru = birimKurunuBul(odenecekDoviz, "satis", kurlar);

  if (alisKuru == null || satisKuru == null) return null;

  return kaynak === "alinacak"
    ? (miktar * alisKuru) / satisKuru
    : (miktar * satisKuru) / alisKuru;
}

function miktariYaz(value: number) {
  return Number(value.toFixed(4)).toString();
}

function miktarGirdisiniNormalizeEt(value: string) {
  const temizDeger = value.replace(/\s/g, "").replace(/[^\d.,]/g, "");

  if (!temizDeger) return "";

  const standartDeger = temizDeger.includes(",")
    ? temizDeger.replace(/\./g, "").replace(",", ".")
    : temizDeger;
  const [tamKisim, ...ondalikParcalari] = standartDeger.split(".");
  const ondalikKisim = ondalikParcalari.join("").slice(0, 4);
  const normalizeTamKisim = tamKisim.replace(/^0+(?=\d)/, "") || "0";

  return standartDeger.includes(".")
    ? `${normalizeTamKisim}.${ondalikKisim}`
    : normalizeTamKisim;
}

function miktariTurkceGoster(value: string) {
  if (!value) return "";

  const sayi = Number(value);
  if (!Number.isFinite(sayi)) return value;

  const ondalikBasamakSayisi = value.includes(".")
    ? Math.min(value.split(".")[1]?.length ?? 0, 4)
    : 0;

  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: ondalikBasamakSayisi,
    maximumFractionDigits: 4,
  }).format(sayi);
}

function bakiyeYaz(value: number, dovizKodu: string) {
  return `${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} ${dovizKodu}`;
}

const ISLEM_KODLARI: Record<string, string> = {
  alis: "DOVA",
  satis: "DOVS",
  arbitraj: "DOVR",
};

function referansOnizlemesiOlustur(subeKodu: string, islemTipi: string) {
  const islemKodu = ISLEM_KODLARI[islemTipi];

  if (!subeKodu || !islemKodu) return "";

  const yil = new Date().getFullYear().toString().slice(-2);
  return `${subeKodu}${islemKodu}${yil}XXXXXX`;
}

export function DovizAlisSatisEkrani() {
  const router = useRouter();
  const { musteriSec: headerMusteriSec } = useMusteri();
  const [dovizler, setDovizler] = useState<Doviz[]>([]);
  const [kurlar, setKurlar] = useState<Kur[]>([]); 
  //let kurlar: Kur[] = [];
  const [kurTarihi, setKurTarihi] = useState("");
  const [dovizFormu, dovizFormDispatch] = useReducer(
    dovizFormReducer,
    { ...initialDovizFormState, odenecekDoviz: "TRY" },
  );
  const {
    alinacakDoviz,
    odenecekDoviz,
    alinacakMiktar,
    odenecekMiktar,
    sonMiktarAlani,
    hesaplamaHatasi,
  } = dovizFormu;
  const [islemTipi, setIslemTipi] = useState("satis");
  const [odaktakiMiktar, setOdaktakiMiktar] = useState<
    "alinacak" | "odenecek" | null
  >(null);
  const [gercekReferans, setGercekReferans] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");
  const [secilenMusteri, setSecilenMusteri] = useState("");
  const [hesaplar, setHesaplar] = useState<Hesap[]>([]);
  const [subeKodu, setSubeKodu] = useState("");
  const [subeAdi, setSubeAdi] = useState("");
  const [musteriAdi, setMusteriAdi] = useState("");
  const [borçluHesap, setBorçluHesap] = useState("");
  const [tumHesaplar, setTumHesaplar] = useState<Hesap[]>([]);
  const [ekNolariDropdown, setEkNolariDropdown] = useState<Hesap[]>([]);
  const [secilenEkNo, setSecilenEkNo] = useState("");
  const [alacakliHesapId, setAlacakliHesapId] = useState("");
  const [hesapAramaMesaji, setHesapAramaMesaji] = useState("");
  const hesapAramaIdRef = useRef(0);
  const referansOnizleme =
    gercekReferans || referansOnizlemesiOlustur(subeKodu, islemTipi);

  useEffect(() => {
    async function dovizVeKurlariGetir() {
      try {
        setHata("");
        const [dovizData, kurSonucu] = await Promise.all([
          dovizleriGetir(),
          kurlariGetir(),
        ]);

        if (!Array.isArray(dovizData)) {
          throw new Error("API beklenen döviz listesini döndürmedi.");
        }

        if (!Array.isArray(kurSonucu.kurlar)) {
          throw new Error("API beklenen kur listesini döndürmedi.");
        }

        setDovizler(dovizData);
        setKurlar(kurSonucu.kurlar);
        setKurTarihi(kurSonucu.tarih);
      } catch (error) {
        console.error("Döviz veya kurlar alınamadı:", error);
        setHata("Döviz ve kur bilgileri getirilemedi. API'nin çalıştığını kontrol edin.");
      } finally {
        setYukleniyor(false);
      }
    }

    void dovizVeKurlariGetir();
  }, []);

  useEffect(() => {
    publicDegiskenler.islemReferansi = referansOnizleme;
    console.log("Dinamik olarak izlenen işlem referansı:", referansOnizleme);
  }, [referansOnizleme]);

  function karsiligiGuncelle(
    kaynak: "alinacak" | "odenecek",
    miktarDegeri: string,
    yeniAlinacakDoviz = alinacakDoviz,
    yeniOdenecekDoviz = odenecekDoviz,
  ) {
    if (!miktarDegeri || !yeniAlinacakDoviz || !yeniOdenecekDoviz) {
      dovizFormDispatch({
        type: kaynak === "alinacak"
          ? "ODENECEK_MIKTAR_HESAPLA"
          : "ALINACAK_MIKTAR_HESAPLA",
        payload: "",
      });
      return;
    }

    const sonuc = miktariHesapla(
      kaynak,
      Number(miktarDegeri),
      yeniAlinacakDoviz,
      yeniOdenecekDoviz,
      kurlar,
    );

    if (sonuc == null) {
      dovizFormDispatch({
        type: "HESAPLAMA_HATASI_GUNCELLE",
        payload: "Seçilen döviz için alış veya satış kuru bulunamadı.",
      });
      return;
    }

    dovizFormDispatch({ type: "HESAPLAMA_HATASI_GUNCELLE", payload: "" });
    dovizFormDispatch({
      type: kaynak === "alinacak"
        ? "ODENECEK_MIKTAR_HESAPLA"
        : "ALINACAK_MIKTAR_HESAPLA",
      payload: miktariYaz(sonuc),
    });
  }

  function alinacakDoviziDegistir(yeniDoviz: string) {
    dovizFormDispatch({ type: "ALINACAK_DOVIZ_DEGISTIR", payload: yeniDoviz });
    setAlacakliHesapId((mevcutHesapAnahtari) =>
      dovizeUygunHesapAnahtari(
        yeniDoviz,
        tumHesaplar,
        mevcutHesapAnahtari,
      ),
    );
    const kaynakMiktar = sonMiktarAlani === "alinacak" ? alinacakMiktar : odenecekMiktar;
    karsiligiGuncelle(sonMiktarAlani, kaynakMiktar, yeniDoviz, odenecekDoviz);
  }

  function odenecekDoviziDegistir(yeniDoviz: string) {
    dovizFormDispatch({ type: "ODENECEK_DOVIZ_DEGISTIR", payload: yeniDoviz });
    setSecilenEkNo((mevcutHesapAnahtari) =>
      dovizeUygunHesapAnahtari(
        yeniDoviz,
        tumHesaplar,
        mevcutHesapAnahtari,
      ),
    );
    const kaynakMiktar = sonMiktarAlani === "alinacak" ? alinacakMiktar : odenecekMiktar;
    karsiligiGuncelle(sonMiktarAlani, kaynakMiktar, alinacakDoviz, yeniDoviz);
  }

  function alinacakMiktariDegistir(yeniMiktar: string) {
    const normalizeMiktar = miktarGirdisiniNormalizeEt(yeniMiktar);
    dovizFormDispatch({
      type: "ALINACAK_MIKTAR_GIR",
      payload: normalizeMiktar,
    });
    karsiligiGuncelle("alinacak", normalizeMiktar);
  }

  function odenecekMiktariDegistir(yeniMiktar: string) {
    const normalizeMiktar = miktarGirdisiniNormalizeEt(yeniMiktar);
    dovizFormDispatch({
      type: "ODENECEK_MIKTAR_GIR",
      payload: normalizeMiktar,
    });
    karsiligiGuncelle("odenecek", normalizeMiktar);
  }

  function islemTipiniDegistir(yeniIslemTipi: string) {
    if (yeniIslemTipi === "arbitraj") {
      router.push("/arbitraj");
      return;
    }

    setGercekReferans("");
    setIslemTipi(yeniIslemTipi);
    setOdaktakiMiktar(null);
    dovizFormDispatch({ type: "FORMU_TEMIZLE" });

    if (yeniIslemTipi === "alis") {
      dovizFormDispatch({ type: "ALINACAK_DOVIZ_DEGISTIR", payload: "TRY" });
      setSecilenEkNo("");
      setAlacakliHesapId(
        dovizeUygunHesapAnahtari("TRY", tumHesaplar, ""),
      );
      return;
    }

    dovizFormDispatch({ type: "ODENECEK_DOVIZ_DEGISTIR", payload: "TRY" });
    setSecilenEkNo(
      dovizeUygunHesapAnahtari("TRY", tumHesaplar, ""),
    );
    setAlacakliHesapId("");
  }

  function hesapCevabiniStateIcineYaz(hesapCevabi: HesapResponse) {
    const musteriHesaplari = hesapCevabiniDonustur(hesapCevabi);

    headerMusteriSec(hesapCevabi);
    setSecilenMusteri(hesapCevabi.id.toString());
    setTumHesaplar(musteriHesaplari);
    setHesaplar(musteriHesaplari);
    setEkNolariDropdown(musteriHesaplari);
    setSecilenEkNo(
      dovizeUygunHesapAnahtari(odenecekDoviz, musteriHesaplari, ""),
    );
    setAlacakliHesapId(
      dovizeUygunHesapAnahtari(alinacakDoviz, musteriHesaplari, ""),
    );
    setMusteriAdi(`${hesapCevabi.ad} ${hesapCevabi.soyad}`);
    setSubeKodu(hesapCevabi.sube.kod);
    setSubeAdi(hesapCevabi.sube.ad);

    return musteriHesaplari;
  }

  async function hesapBilgisiGetir(girilenMusteriId: string) {
    const aramaId = ++hesapAramaIdRef.current;

    setBorçluHesap(girilenMusteriId);
    setSecilenEkNo("");
    setAlacakliHesapId("");
    setGercekReferans("");
    setEkNolariDropdown([]);
    setHesaplar([]);
    setTumHesaplar([]);

    if (!girilenMusteriId.trim()) {
      setSecilenMusteri("");
      setMusteriAdi("");
      setSubeKodu("");
      setSubeAdi("");
      setHesapAramaMesaji("");
      return;
    }

    if (!/^\d{6}$/.test(girilenMusteriId)) {
      setMusteriAdi("");
      setSubeKodu("");
      setSubeAdi("");
      setSecilenMusteri("");
      setHesapAramaMesaji("");
      return;
    }

    const musteriId = Number(girilenMusteriId);

    if (!Number.isInteger(musteriId) || musteriId < 1) {
      setMusteriAdi("");
      setSubeKodu("");
      setSubeAdi("");
      setSecilenMusteri("");
      setHesapAramaMesaji("Müşteri ID pozitif bir tam sayı olmalıdır.");
      return;
    }

    setHesapAramaMesaji("Müşteri bilgileri getiriliyor...");

    try {
      const data = await musteriHesaplariniGetir(musteriId);

      if (aramaId !== hesapAramaIdRef.current) return;

      if (!Array.isArray(data.hesaplar)) {
        throw new Error("Müşteri hesap cevabı beklenen formatta değil.");
      }

      const hesapCevabi = data as HesapResponse;
      const musteriHesaplari = hesapCevabiniStateIcineYaz(hesapCevabi);
      setHesapAramaMesaji(
        musteriHesaplari.length > 0
          ? ""
          : "Bu müşteriye ait hesap bulunamadı.",
      );
    } catch (error) {
      if (aramaId !== hesapAramaIdRef.current) return;

      setSecilenMusteri("");
      setMusteriAdi("");
      setSubeKodu("");
      setSubeAdi("");
      setHesapAramaMesaji(
        error instanceof Error ? error.message : "Müşteri bilgileri alınamadı.",
      );
    }
  }

  function hesapSec(hesapAnahtari: string) {
    setSecilenEkNo(hesapAnahtari);
    const hesap = tumHesaplar.find(
      (item) => item.hesapAnahtari === hesapAnahtari,
    );

    if (!hesap) return;

    const musteriHesaplari = tumHesaplar.filter(
      (item) => item.musteriId === hesap.musteriId,
    );

    setSecilenMusteri(hesap.musteriId.toString());
    setHesaplar(musteriHesaplari);
    setEkNolariDropdown(musteriHesaplari);
    setMusteriAdi(`${hesap.musteriAdi} ${hesap.musteriSoyadi}`);
    setSubeKodu(hesap.subeKodu);
    setSubeAdi(hesap.subeAdi);
    setHesapAramaMesaji("");

    const yeniOdenecekDoviz = islemTipi === "satis" ? "TRY" : hesap.dovizKodu;
    dovizFormDispatch({
      type: "ODENECEK_DOVIZ_DEGISTIR",
      payload: yeniOdenecekDoviz,
    });
    const kaynakMiktar =
      sonMiktarAlani === "alinacak" ? alinacakMiktar : odenecekMiktar;
    karsiligiGuncelle(
      sonMiktarAlani,
      kaynakMiktar,
      alinacakDoviz,
      yeniOdenecekDoviz,
    );
  }

  function alacakliHesapSec(hesapAnahtari: string) {
    setAlacakliHesapId(hesapAnahtari);

    const hesap = tumHesaplar.find(
      (item) => item.hesapAnahtari === hesapAnahtari,
    );

    if (!hesap) return;

    const yeniAlinacakDoviz = islemTipi === "alis" ? "TRY" : hesap.dovizKodu;
    dovizFormDispatch({
      type: "ALINACAK_DOVIZ_DEGISTIR",
      payload: yeniAlinacakDoviz,
    });
    const kaynakMiktar =
      sonMiktarAlani === "alinacak" ? alinacakMiktar : odenecekMiktar;
    karsiligiGuncelle(
      sonMiktarAlani,
      kaynakMiktar,
      yeniAlinacakDoviz,
      odenecekDoviz,
    );
  }

  function formTemizle() {
    dovizFormDispatch({ type: "FORMU_TEMIZLE" });
    dovizFormDispatch({
      type:
        islemTipi === "alis"
          ? "ALINACAK_DOVIZ_DEGISTIR"
          : "ODENECEK_DOVIZ_DEGISTIR",
      payload: "TRY",
    });
    publicDegiskenler.islemReferansi = "";
    setGercekReferans("");
    setOdaktakiMiktar(null);
    setBorçluHesap("");
    setMusteriAdi("");
    setSubeKodu("");
    setSubeAdi("");
    setEkNolariDropdown([]);
    setHesaplar([]);
    setSecilenMusteri("");
    setSecilenEkNo("");
    setAlacakliHesapId("");
    setHesapAramaMesaji("");
  }

async function islemYap(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const borcluHesap = tumHesaplar.find(
    (hesap) => hesap.hesapAnahtari === secilenEkNo,
  );
  const alacakliHesap = tumHesaplar.find(
    (hesap) => hesap.hesapAnahtari === alacakliHesapId,
  );
  const miktar = Number(odenecekMiktar);

  if (!borcluHesap || !alacakliHesap || !secilenMusteri) {
    alert("Borçlu ve alacaklı hesap ek numaralarını seçin.");
    return;
  }

  if (!Number.isFinite(miktar) || miktar < 1) {
    alert("Ödenecek miktar en az 1 olmalıdır.");
    return;
  }

  if (borcluHesap.musteriId !== alacakliHesap.musteriId) {
    alert("Borçlu ve alacaklı hesap aynı müşteriye ait olmalıdır.");
    return;
  }

  if (
    borcluHesap.dovizKodu !== odenecekDoviz ||
    alacakliHesap.dovizKodu !== alinacakDoviz
  ) {
    alert(
      "Seçilen döviz cinsleri ile borçlu/alacaklı hesapların döviz cinsleri eşleşmiyor.",
    );
    return;
  }

  const payload: DovizCevirRequest = {
    musteriId: Number(secilenMusteri),
    borcluHesapEkNo: borcluHesap.hesapEkNo,
    alacakliHesapEkNo: alacakliHesap.hesapEkNo,
    odenecekDovizMiktari: miktar,
  };

  try {
    const result = await dovizCevir(payload);

    const gercekReferans =
      typeof result === "object" && result !== null && "referansNo" in result
        ? String(result.referansNo)
        : "";

    if (gercekReferans) {
      publicDegiskenler.islemReferansi = gercekReferans;
      setGercekReferans(gercekReferans);
    }

    try {
      const hesapData = await musteriHesaplariniGetir(secilenMusteri);

      if (
        !Array.isArray(hesapData.hesaplar)
      ) {
        throw new Error("Güncel hesap cevabı beklenen formatta değil.");
      }

      hesapCevabiniStateIcineYaz(hesapData as HesapResponse);
    } catch (yenilemeHatasi) {
      console.error("İşlem başarılı fakat bakiyeler yenilenemedi:", yenilemeHatasi);
      alert("İşlem başarılı, ancak güncel bakiyeler ekrana getirilemedi.");
      return;
    }

    alert("Döviz işlemi başarıyla gerçekleştirildi.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu.";
    alert(message);
  }
}

  const secilenBorcluHesap = tumHesaplar.find(
    (hesap) => hesap.hesapAnahtari === secilenEkNo,
  );
  const secilenAlacakliHesap = tumHesaplar.find(
    (hesap) => hesap.hesapAnahtari === alacakliHesapId,
  );
  const borcluDovizUyarisi = dovizHesapEslesmeUyarisi(
    "borclu",
    odenecekDoviz,
    tumHesaplar,
    secilenEkNo,
  );
  const alacakliDovizUyarisi = dovizHesapEslesmeUyarisi(
    "alacakli",
    alinacakDoviz,
    tumHesaplar,
    alacakliHesapId,
  );
  const borcluHesapSecenekleri = ekNolariDropdown.filter((hesap) =>
    islemTipi === "satis"
      ? hesap.dovizKodu === "TRY"
      : hesap.dovizKodu !== "TRY",
  );
  const alacakliHesapSecenekleri = hesaplar.filter((hesap) =>
    islemTipi === "alis"
      ? hesap.dovizKodu === "TRY"
      : hesap.dovizKodu !== "TRY",
  );

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1600px] min-w-0 flex-col gap-4">


          {yukleniyor && <p>Dövizler yükleniyor...</p>}
          {hata && <p style={{ color: "#b42318", fontWeight: "bold" }}>{hata}</p>}

          {!yukleniyor && !hata && (
            <form className="flex min-w-0 flex-col rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <h1 style={{ marginTop: 0, marginBottom: "20px", fontWeight: "bold", color: "#5a62d4", fontSize: "24px" }}>İşlem Bilgisi</h1>
                <span className="text-xs text-[#667085]">Kur tarihi: {kurTarihi}</span>
              </div>

              <input type="hidden" name="islemTipi" value={islemTipi} />

              <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:flex-wrap">
                <div className="w-full md:w-[280px]">
                  <label htmlFor="islem-referansi" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>İşlem Referansı:</label>
                  <input
                    id="islem-referansi"
                    type="text"
                    readOnly
                    value={referansOnizleme}
                    placeholder="Seçimlere Bağlı Otomatik Oluşur"
                    style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                  />
                  
                </div>

                <Tabs
                  value={islemTipi}
                  onValueChange={islemTipiniDegistir}
                  className="w-full md:w-auto"
                >
                  <TabsList className="grid h-auto w-full grid-cols-3 gap-2 bg-transparent p-0 group-data-horizontal/tabs:h-auto md:w-[450px]">
                    <TabsTrigger
                      value="alis"
                      className="h-14 flex-col gap-1 whitespace-normal rounded-lg border border-slate-300 bg-blue-50 px-2 py-1.5 text-center text-[11px] font-bold leading-tight text-slate-700 shadow-sm hover:bg-blue-100 data-active:border-blue-700 data-active:bg-blue-700 data-active:text-white data-active:shadow-md"
                    >
                      <WalletCards className="size-4" />
                      Döviz / Efektif Alış
                    </TabsTrigger>

                    <TabsTrigger
                      value="satis"
                      className="h-14 flex-col gap-1 whitespace-normal rounded-lg border border-slate-300 bg-blue-50 px-2 py-1.5 text-center text-[11px] font-bold leading-tight text-slate-700 shadow-sm hover:bg-blue-100 data-active:border-blue-700 data-active:bg-blue-700 data-active:text-white data-active:shadow-md"
                    >
                      <Banknote className="size-4" />
                      Döviz / Efektif Satış
                    </TabsTrigger>

                    <TabsTrigger
                      value="arbitraj"
                      className="h-14 flex-col gap-1 whitespace-normal rounded-lg border border-slate-300 bg-blue-50 px-2 py-1.5 text-center text-[11px] font-bold leading-tight text-slate-700 shadow-sm hover:bg-blue-100 data-active:border-blue-700 data-active:bg-blue-700 data-active:text-white data-active:shadow-md"
                    >
                      <ArrowRightLeft className="size-4" />
                      Arbitraj
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>İşlem Kaynağı:</label>
                  <input
                    type="text"
                    readOnly
                    value="Hesaptan Hesaba"
                    style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Alınacak Döviz Cinsi:</label>
                  <select value={alinacakDoviz} onChange={(e) => alinacakDoviziDegistir(e.target.value)} disabled={islemTipi === "alis"} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: islemTipi === "alis" ? "#f5f5f5" : "white" }} required>
                    <option value="">Seçiniz</option>
                    {islemTipi === "alis" && !dovizler.some((doviz) => doviz.kod === "TRY") && (
                      <option value="TRY">TRY - Türk Lirası</option>
                    )}
                    {dovizler.filter((doviz) => islemTipi === "alis" ? doviz.kod === "TRY" : doviz.kod !== "TRY").map((doviz) => (
                      <option key={doviz.id} value={doviz.kod}>
                        {doviz.kod} - {doviz.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Ödenecek Döviz Cinsi:</label>
                  <select value={odenecekDoviz} onChange={(e) => odenecekDoviziDegistir(e.target.value)} disabled={islemTipi === "satis"} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: islemTipi === "satis" ? "#f5f5f5" : "white" }} required>
                    <option value="">Seçiniz</option>
                    {islemTipi === "satis" && !dovizler.some((doviz) => doviz.kod === "TRY") && (
                      <option value="TRY">TRY - Türk Lirası</option>
                    )}
                    {dovizler.filter((doviz) => islemTipi === "satis" ? doviz.kod === "TRY" : doviz.kod !== "TRY").map((doviz) => (
                      <option key={doviz.id} value={doviz.kod}>
                        {doviz.kod} - {doviz.name}
                      </option>
                    ))}
                  </select>
                </div>


                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Alınacak Miktar:</label>
                  <input type="text" inputMode="decimal" value={odaktakiMiktar === "alinacak" ? alinacakMiktar : miktariTurkceGoster(alinacakMiktar)} onFocus={() => setOdaktakiMiktar("alinacak")} onBlur={() => setOdaktakiMiktar(null)} onChange={(e) => alinacakMiktariDegistir(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Ödenecek Miktar:</label>
                  <input type="text" inputMode="decimal" value={odaktakiMiktar === "odenecek" ? odenecekMiktar : miktariTurkceGoster(odenecekMiktar)} onFocus={() => setOdaktakiMiktar("odenecek")} onBlur={() => setOdaktakiMiktar(null)} onChange={(e) => odenecekMiktariDegistir(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required />
                </div>

              </div>

              {hesaplamaHatasi && (
                <p style={{ color: "#b42318", fontWeight: "bold", margin: "0 0 10px" }}>
                  {hesaplamaHatasi}
                </p>
              )}

            </form>

          )}
          {yukleniyor && <p>Dövizler yükleniyor...</p>}
          {hata && <p style={{ color: "#b42318", fontWeight: "bold" }}>{hata}</p>}

          {!yukleniyor && !hata && (
            <form onSubmit={islemYap} className="flex min-w-0 flex-col rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm sm:p-5">
              <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(300px,0.6fr)_minmax(0,1.4fr)]">
                <div className="min-w-0 rounded-lg border border-[#e0e0e0] bg-white p-4 sm:p-5">
                  <h1 style={{ fontWeight: "bold", color: "#0047b3" }}>Kur Bilgisi</h1>
                  <div className="grid gap-2 rounded p-2.5 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Kur Alış
                      <input
                        type="text"
                        readOnly
                        value={
                          alinacakDoviz && kurlar.length > 0
                            ? `${alinacakDoviz} Alış: ${alinacakDoviz === "TRY" ? "1.0000" : kurlar.find(k => k.kod === alinacakDoviz)?.dovizAlis?.toFixed(4) || '—'}`
                            : ''
                        }
                        className="h-11 w-full rounded-md border border-slate-300 bg-slate-50 px-3 font-normal"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Kur Satış
                      <input
                        type="text"
                        readOnly
                        value={
                          odenecekDoviz && kurlar.length > 0
                            ? `${odenecekDoviz} Satış: ${odenecekDoviz === "TRY" ? "1.0000" : kurlar.find(k => k.kod === odenecekDoviz)?.dovizSatis?.toFixed(4) || '—'}`
                            : ''
                        }
                        className="h-11 w-full rounded-md border border-slate-300 bg-slate-50 px-3 font-normal"
                      />
                    </label>
                  </div>
                  <div className="p-2 sm:p-4">
                    <Table>
                      <TableCaption>Güncel Döviz Kurları</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Para Birimi</TableHead>
                          <TableHead>Alış</TableHead>
                          <TableHead>Satış</TableHead>
                          <TableHead className="hidden text-right sm:table-cell">Durum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alinacakDoviz && kurlar.length > 0 && (
                          <TableRow>
                            <TableCell className="font-medium">{alinacakDoviz}</TableCell>
                            <TableCell>
                              {alinacakDoviz === "TRY" ? "1.0000" : kurlar.find(k => k.kod === alinacakDoviz)?.dovizAlis?.toFixed(4) || '—'}
                            </TableCell>
                            <TableCell>
                              {alinacakDoviz === "TRY" ? "1.0000" : kurlar.find(k => k.kod === alinacakDoviz)?.dovizSatis?.toFixed(4) || '—'}
                            </TableCell>
                            <TableCell className="hidden text-right text-green-500 sm:table-cell">Stabil</TableCell>
                          </TableRow>
                        )}
                        {odenecekDoviz && kurlar.length > 0 && alinacakDoviz !== odenecekDoviz && (
                          <TableRow>
                            <TableCell className="font-medium">{odenecekDoviz}</TableCell>
                            <TableCell>
                              {odenecekDoviz === "TRY" ? "1.0000" : kurlar.find(k => k.kod === odenecekDoviz)?.dovizAlis?.toFixed(4) || '—'}
                            </TableCell>
                            <TableCell>
                              {odenecekDoviz === "TRY" ? "1.0000" : kurlar.find(k => k.kod === odenecekDoviz)?.dovizSatis?.toFixed(4) || '—'}
                            </TableCell>
                            <TableCell className="hidden text-right text-red-500 sm:table-cell">Stabil</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="flex min-w-0 flex-col gap-5">
                  <div className="h-full min-w-0 rounded-lg border border-[#e0e0e0] bg-white p-4 sm:p-5">
                    <h3 style={{ fontWeight: "bold", color: "#0047b3", marginBottom: "15px" }}>Borçlu Bilgisi</h3>
                    <div className="mb-3 grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Şube Kodu</label>
                        <input
                          type="text" readOnly
                          value={subeKodu}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                        />
                      </div>
                      <div className="min-w-0">
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Şube Adı</label>
                        <input
                          type="text" readOnly
                          value={subeAdi}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                        />
                      </div>
                    </div>
                    <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1.1fr)_minmax(100px,.55fr)_minmax(180px,1fr)_minmax(160px,1fr)]">
                      <div className="min-w-0">
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Borçlu Hesap</label>
                        <MusteriCombobox
                          value={borçluHesap}
                          onValueChange={(musteriId) =>
                            void hesapBilgisiGetir(musteriId)
                          }
                        />
                      </div>
                      <div className="min-w-0">
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Ek No</label>
                        <select
                          value={secilenEkNo}
                          onChange={(e) => hesapSec(e.target.value)}
                          disabled={borcluHesapSecenekleri.length === 0}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "white" }}
                        >
                          <option value="">Seçiniz</option>
                          {borcluHesapSecenekleri.map((hesap) => (
                            <option key={hesap.hesapAnahtari} value={hesap.hesapAnahtari}>
                              {hesap.hesapEkNo} - {hesap.dovizKodu} - Bakiye: {bakiyeYaz(hesap.bakiye, hesap.dovizKodu)} - {hesap.musteriAdi} {hesap.musteriSoyadi}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="min-w-0">
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Müşteri Adı Soyadı</label>
                        <input
                          type="text" readOnly
                          value={musteriAdi}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                        />
                      </div>
                      <div className="min-w-0">
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Bakiye</label>
                        <input
                          type="text"
                          readOnly
                          value={secilenBorcluHesap ? bakiyeYaz(secilenBorcluHesap.bakiye, secilenBorcluHesap.dovizKodu) : ""}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                        />
                      </div>
                    </div>
                    {hesapAramaMesaji && (
                      <p style={{ margin: "8px 0 0", color: "#b54708", fontSize: "12px", fontWeight: "bold" }}>
                        {hesapAramaMesaji}
                      </p>
                    )}
                    {borcluDovizUyarisi && (
                      <p style={{ margin: "8px 0 0", color: "#b54708", fontSize: "12px", fontWeight: "bold" }}>
                        {borcluDovizUyarisi}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 rounded-lg border border-[#e0e0e0] bg-white p-4 sm:p-5">
                    <h3 style={{ fontWeight: "bold", color: "#0047b3", marginBottom: "15px" }}>Alacaklı Bilgisi</h3>
                    <div className="mb-3 grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Şube Kodu</label>
                        <input
                          type="text" readOnly
                          value={subeKodu}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                        />
                      </div>
                      <div className="min-w-0">
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Şube Adı</label>
                        <input
                          type="text" readOnly
                          value={subeAdi}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                        />
                      </div>
                    </div>
                    <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1.1fr)_minmax(100px,.55fr)_minmax(180px,1fr)_minmax(160px,1fr)]">
                      <div className="min-w-0">
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Alacaklı Hesap</label>
                        <input
                          type="text"
                          readOnly
                          value={borçluHesap}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                        />
                      </div>
                      <div className="min-w-0">
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Ek No</label>
                        <select
                          value={alacakliHesapId}
                          onChange={(e) => alacakliHesapSec(e.target.value)}
                          disabled={alacakliHesapSecenekleri.length === 0}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "white" }}
                        >
                          <option value="">Seçiniz</option>
                          {alacakliHesapSecenekleri.map((hesap) => (
                            <option key={hesap.hesapAnahtari} value={hesap.hesapAnahtari}>
                              {hesap.hesapEkNo} - {hesap.dovizKodu} - Bakiye: {bakiyeYaz(hesap.bakiye, hesap.dovizKodu)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="min-w-0">
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Müşteri Adı Soyadı</label>
                        <input
                          type="text" readOnly
                          value={musteriAdi}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                        />
                      </div>
                      <div className="min-w-0">
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Bakiye</label>
                        <input
                          type="text"
                          readOnly
                          value={secilenAlacakliHesap ? bakiyeYaz(secilenAlacakliHesap.bakiye, secilenAlacakliHesap.dovizKodu) : ""}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                        />
                      </div>
                    </div>
                    {alacakliDovizUyarisi && (
                      <p style={{ margin: "8px 0 0", color: "#b54708", fontSize: "12px", fontWeight: "bold" }}>
                        {alacakliDovizUyarisi}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={formTemizle} className="w-full sm:w-auto" style={{ padding: "10px 20px", backgroundColor: "#f0f0f0", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                  İptal
                </button>
                <button type="submit" className="w-full sm:w-auto" style={{ padding: "10px 20px", backgroundColor: "#0047b3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                  İşlemi Gerçekleştir
                </button>
              </div>
            </form>

          )}
      </div>
    </AppShell>
  );
}
