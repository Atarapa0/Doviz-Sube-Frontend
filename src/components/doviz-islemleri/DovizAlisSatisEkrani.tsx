"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { NEXT_API_ENDPOINTS } from "@/constants/api-endpoints";
import { publicDegiskenler } from "@/lib/public-degiskenler";
import { useMusteri } from "@/components/providers/MusteriProvider";
import {
  dovizFormReducer,
  initialDovizFormState,
} from "@/reducers/doviz-form-reducer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MusteriCombobox from "@/components/ui/musteri-bilgileri";
import { ArrowRightLeft, Banknote, WalletCards } from "lucide-react";
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
  CSSProperties,
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

type KurResponse = {
  tarih: string;
  kurlar: Kur[];
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
  const { musteriSec: headerMusteriSec } = useMusteri();
  const [dovizler, setDovizler] = useState<Doviz[]>([]);
  const [kurlar, setKurlar] = useState<Kur[]>([]); 
  //let kurlar: Kur[] = [];
  const [kurTarihi, setKurTarihi] = useState("");
  const [dovizFormu, dovizFormDispatch] = useReducer(
    dovizFormReducer,
    initialDovizFormState,
  );
  const {
    alinacakDoviz,
    odenecekDoviz,
    alinacakMiktar,
    odenecekMiktar,
    sonMiktarAlani,
    hesaplamaHatasi,
  } = dovizFormu;
  const [islemKaynagi, setIslemKaynagi] = useState("");
  const [islemTipi, setIslemTipi] = useState("satis");
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
        const [dovizResponse, kurResponse] = await Promise.all([
          fetch(NEXT_API_ENDPOINTS.dovizler),
          fetch(NEXT_API_ENDPOINTS.kurlar),
        ]);

        if (!dovizResponse.ok || !kurResponse.ok) {
          throw new Error(
            `API isteği başarısız: döviz=${dovizResponse.status}, kur=${kurResponse.status}`,
          );
        }

        const dovizData: unknown = await dovizResponse.json();
        const kurData: unknown = await kurResponse.json();

        if (!Array.isArray(dovizData)) {
          throw new Error("API beklenen döviz listesini döndürmedi.");
        }

        if (
          typeof kurData !== "object" ||
          kurData === null ||
          !Array.isArray((kurData as KurResponse).kurlar)
        ) {
          throw new Error("API beklenen kur listesini döndürmedi.");
        }

        const kurSonucu = kurData as KurResponse;
        setDovizler(dovizData as Doviz[]);
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
    dovizFormDispatch({ type: "ALINACAK_MIKTAR_GIR", payload: yeniMiktar });
    karsiligiGuncelle("alinacak", yeniMiktar);
  }

  function odenecekMiktariDegistir(yeniMiktar: string) {
    dovizFormDispatch({ type: "ODENECEK_MIKTAR_GIR", payload: yeniMiktar });
    karsiligiGuncelle("odenecek", yeniMiktar);
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
      const response = await fetch(
        NEXT_API_ENDPOINTS.musteriHesaplari(musteriId),
      );
      const data: unknown = await response.json();

      if (aramaId !== hesapAramaIdRef.current) return;

      if (!response.ok) {
        const mesaj =
          typeof data === "object" && data !== null && "mesaj" in data
            ? String(data.mesaj)
            : "Müşteri bilgileri alınamadı.";
        throw new Error(mesaj);
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !Array.isArray((data as HesapResponse).hesaplar)
      ) {
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

    dovizFormDispatch({
      type: "ODENECEK_DOVIZ_DEGISTIR",
      payload: hesap.dovizKodu,
    });
    const kaynakMiktar =
      sonMiktarAlani === "alinacak" ? alinacakMiktar : odenecekMiktar;
    karsiligiGuncelle(
      sonMiktarAlani,
      kaynakMiktar,
      alinacakDoviz,
      hesap.dovizKodu,
    );
  }

  function alacakliHesapSec(hesapAnahtari: string) {
    setAlacakliHesapId(hesapAnahtari);

    const hesap = tumHesaplar.find(
      (item) => item.hesapAnahtari === hesapAnahtari,
    );

    if (!hesap) return;

    dovizFormDispatch({
      type: "ALINACAK_DOVIZ_DEGISTIR",
      payload: hesap.dovizKodu,
    });
    const kaynakMiktar =
      sonMiktarAlani === "alinacak" ? alinacakMiktar : odenecekMiktar;
    karsiligiGuncelle(
      sonMiktarAlani,
      kaynakMiktar,
      hesap.dovizKodu,
      odenecekDoviz,
    );
  }

  function formTemizle() {
    dovizFormDispatch({ type: "FORMU_TEMIZLE" });
    publicDegiskenler.islemReferansi = "";
    setGercekReferans("");
    setIslemTipi("");
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
    const response = await fetch(NEXT_API_ENDPOINTS.dovizCevir, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result: unknown = await response.json();

    if (!response.ok) {
      const message =
        typeof result === "object" && result !== null && "mesaj" in result
          ? String(result.mesaj)
          : typeof result === "object" && result !== null && "message" in result
            ? String(result.message)
            : "Döviz işlemi gerçekleştirilemedi.";
      throw new Error(message);
    }

    const gercekReferans =
      typeof result === "object" && result !== null && "referansNo" in result
        ? String(result.referansNo)
        : "";

    if (gercekReferans) {
      publicDegiskenler.islemReferansi = gercekReferans;
      setGercekReferans(gercekReferans);
    }

    try {
      const hesapResponse = await fetch(
        NEXT_API_ENDPOINTS.musteriHesaplari(secilenMusteri),
      );
      const hesapData: unknown = await hesapResponse.json();

      if (!hesapResponse.ok) {
        throw new Error("Güncel hesap bakiyeleri alınamadı.");
      }

      if (
        typeof hesapData !== "object" ||
        hesapData === null ||
        !Array.isArray((hesapData as HesapResponse).hesaplar)
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

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "260px" } as CSSProperties}
      className="bg-[#f9fafb]"
    >

      {/* Sol Menü */}
      <Sidebar />

      {/* Sağ Taraf Kapsayıcı */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Üst Bilgi */}
        <Header />
        <main style={{ padding: "30px" }}>


          {yukleniyor && <p>Dövizler yükleniyor...</p>}
          {hata && <p style={{ color: "#b42318", fontWeight: "bold" }}>{hata}</p>}

          {!yukleniyor && !hata && (
            <form style={{ backgroundColor: "white", padding: "20px", margin: "10px", borderRadius: "8px", border: "1px solid #e0e0e0", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <h1 style={{ marginTop: 0, marginBottom: "20px", fontWeight: "bold", color: "#5a62d4", fontSize: "24px" }}>İşlem Bilgisi</h1>
                <span style={{ marginLeft: "auto", color: "#667085", fontSize: "12px" }}>Kur tarihi: {kurTarihi}</span>
              </div>

              <input type="hidden" name="islemTipi" value={islemTipi} />

              <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", flexWrap: "wrap", marginBottom: "28px" }}>
                <div style={{ flex: "0 0 280px" }}>
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
                  onValueChange={(yeniIslemTipi) => {
                    setGercekReferans("");
                    setIslemTipi(yeniIslemTipi);
                  }}
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
              <div style={{ display: "flex", flexDirection: "row", gap: "20px", flexWrap: "nowrap" }}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>İşlem Kaynağı:</label>
                  <select value={islemKaynagi} onChange={(e) => setIslemKaynagi(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                    <option value="">Seçiniz</option>
                    <option value="tl-hesaptan">TL Hesaptan</option>
                    <option value="yp-hesaptan">YP Hesaptan</option>
                    <option value="nakit">Nakit</option>
                  </select>
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Alınacak Döviz Cinsi:</label>
                  <select value={alinacakDoviz} onChange={(e) => alinacakDoviziDegistir(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                    <option value="">Seçiniz</option>
                    {dovizler.map((doviz) => (
                      <option key={doviz.id} value={doviz.kod}>
                        {doviz.kod} - {doviz.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Ödenecek Döviz Cinsi:</label>
                  <select value={odenecekDoviz} onChange={(e) => odenecekDoviziDegistir(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required>
                    <option value="">Seçiniz</option>
                    {dovizler.map((doviz) => (
                      <option key={doviz.id} value={doviz.kod}>
                        {doviz.kod} - {doviz.name}
                      </option>
                    ))}
                  </select>
                </div>


                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Alınacak Miktar:</label>
                  <input type="number" min="0" step="any" value={alinacakMiktar} onChange={(e) => alinacakMiktariDegistir(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Ödenecek Miktar:</label>
                  <input type="number" min="0" step="any" value={odenecekMiktar} onChange={(e) => odenecekMiktariDegistir(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required />
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
            <form onSubmit={islemYap} style={{ backgroundColor: "white", padding: "20px", margin: "10px", borderRadius: "8px", border: "1px solid #e0e0e0", display: "flex", flexDirection: "column" }}>
              <div className="ads" style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
                <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e0e0e0", width: "40%", flexDirection: "column", gap: "20px" }}>
                  <h1 style={{ fontWeight: "bold", color: "#0047b3" }}>Kur Bilgisi</h1>
                  <div style={{ display: "flex", flexDirection: "row", gap: "10px", borderRadius: "4px", padding: "10px" }}>
                    <h3 style={{ width: "50%" }}>Kur Alış</h3>
                    <h3 style={{ width: "50%" }}>Kur Satış</h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "row", gap: "10px", borderRadius: "4px", padding: "10px" }}>

                    <input
                      type="text"
                      readOnly
                      value={
                        alinacakDoviz && kurlar.length > 0
                          ? `${alinacakDoviz} Alış: ${alinacakDoviz === "TRY" ? "1.0000" : kurlar.find(k => k.kod === alinacakDoviz)?.dovizAlis?.toFixed(4) || '—'}`
                          : ''
                      }
                      style={{ width: "50%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                    />

                    <input
                      type="text"
                      readOnly
                      value={
                        odenecekDoviz && kurlar.length > 0
                          ? `${odenecekDoviz} Satış: ${odenecekDoviz === "TRY" ? "1.0000" : kurlar.find(k => k.kod === odenecekDoviz)?.dovizSatis?.toFixed(4) || '—'}`
                          : ''
                      }
                      style={{ width: "50%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                    />
                  </div>
                  <div className="p-8">
                    <Table>
                      <TableCaption>Güncel Döviz Kurları</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Para Birimi</TableHead>
                          <TableHead>Alış</TableHead>
                          <TableHead>Satış</TableHead>
                          <TableHead className="text-right">Durum</TableHead>
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
                            <TableCell className="text-right text-green-500">Stabil</TableCell>
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
                            <TableCell className="text-right text-red-500">Stabil</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
                  <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e0e0e0", height: "100%" }}>
                    <h3 style={{ fontWeight: "bold", color: "#0047b3", marginBottom: "15px" }}>Borçlu Bilgisi</h3>
                    <div style={{ display: "flex", flexDirection: "row", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ width: "15%" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Şube Kodu</label>
                        <input
                          type="text" readOnly
                          value={subeKodu}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                        />
                      </div>
                      <div style={{ width: "85%" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Şube Adı</label>
                        <input
                          type="text" readOnly
                          value={subeAdi}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", gap: "10px"}}>
                      <div style={{ width: "30%" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Borçlu Hesap</label>
                        <MusteriCombobox
                          value={borçluHesap}
                          onValueChange={(musteriId) =>
                            void hesapBilgisiGetir(musteriId)
                          }
                        />
                      </div>
                      <div style={{ width: "12%" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Ek No</label>
                        <select
                          value={secilenEkNo}
                          onChange={(e) => hesapSec(e.target.value)}
                          disabled={ekNolariDropdown.length === 0}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "white" }}
                        >
                          <option value="">Seçiniz</option>
                          {ekNolariDropdown.map((hesap) => (
                            <option key={hesap.hesapAnahtari} value={hesap.hesapAnahtari}>
                              {hesap.hesapEkNo} - {hesap.dovizKodu} - Bakiye: {bakiyeYaz(hesap.bakiye, hesap.dovizKodu)} - {hesap.musteriAdi} {hesap.musteriSoyadi}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ width: "28%" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Müşteri Adı Soyadı</label>
                        <input
                          type="text" readOnly
                          value={musteriAdi}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                        />
                      </div>
                      <div style={{ width: "30%" }}>
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

                  <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
                    <h3 style={{ fontWeight: "bold", color: "#0047b3", marginBottom: "15px" }}>Alacaklı Bilgisi</h3>
                    <div style={{ display: "flex", flexDirection: "row", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ width: "15%" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Şube Kodu</label>
                        <input
                          type="text" readOnly
                          value={subeKodu}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                        />
                      </div>
                      <div style={{ width: "85%" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Şube Adı</label>
                        <input
                          type="text" readOnly
                          value={subeAdi}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                      <div style={{ width: "30%" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Alacaklı Hesap</label>
                        <input
                          type="text"
                          readOnly
                          value={borçluHesap}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                        />
                      </div>
                      <div style={{ width: "12%" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Ek No</label>
                        <select
                          value={alacakliHesapId}
                          onChange={(e) => alacakliHesapSec(e.target.value)}
                          disabled={hesaplar.length === 0}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "white" }}
                        >
                          <option value="">Seçiniz</option>
                          {hesaplar.map((hesap) => (
                            <option key={hesap.hesapAnahtari} value={hesap.hesapAnahtari}>
                              {hesap.hesapEkNo} - {hesap.dovizKodu} - Bakiye: {bakiyeYaz(hesap.bakiye, hesap.dovizKodu)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ width: "28%" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px" }}>Müşteri Adı Soyadı</label>
                        <input
                          type="text" readOnly
                          value={musteriAdi}
                          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f5f5f5" }}
                        />
                      </div>
                      <div style={{ width: "30%" }}>
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

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button type="button" onClick={formTemizle} style={{ padding: "10px 20px", backgroundColor: "#f0f0f0", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                  İptal
                </button>
                <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#0047b3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                  İşlemi Gerçekleştir
                </button>
              </div>
            </form>

          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
